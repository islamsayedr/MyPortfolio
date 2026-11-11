import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { reorderWorkInput, workId, workIdentity, workInput, workPage, legacyProjectKey } from '../src/work/validation'
import { seedLegacyIds, seedProjects } from '../src/work/seed'
import { projectFromRow, type WorkRow } from '../src/work/types'

const input = { title: 'New project', description: '', presentation: '', image_url: '/imgs/sc.jpg', image_alt: 'App preview', tags: ['UI Design'], published: false, sort_order: 5 }

test('work input whitelists fields, preserves drafts and normalizes categories', () => {
  const data = workInput({ ...input, title: ' Project ', tags: [' UI Design ', 'UI Design'], role: 'admin', created_at: 'forged', slug: 'ignored-alias' })
  assert.equal(data.identity, null)
  assert.equal(data.fields.title, 'Project')
  assert.equal(data.fields.published, false)
  const markdown = '    Indented code\n\nA line with a hard break  \nNext line\n'
  assert.equal(workInput({ ...input, presentation: markdown }).fields.presentation, markdown, 'Markdown whitespace must be preserved')
  assert.deepEqual(data.fields.tags, ['UI Design'])
  assert.equal('slug' in data.fields, false)
  assert.equal('role' in data.fields, false)
  assert.equal('created_at' in data.fields, false)
  assert.equal(workInput({ ...input, image_url: 'https://example.com/image.png' }).fields.image_url, 'https://example.com/image.png')
})

test('work validation rejects unsafe images, legacy keys, unbounded data and invalid versions', () => {
  for (const image_url of ['javascript:alert(1)', 'data:image/svg+xml,hi', '//evil.test/image', '/\\evil.test/x', 'http://example.com/image.png', 'https://u:p@example.com/a', '/imgs/a\n.jpg']) assert.throws(() => workInput({ ...input, image_url }))
  for (const slug of ['../admin', '/work/test', 'A B', 'has/slash', 'a'.repeat(101)]) assert.throws(() => legacyProjectKey(slug))
  for (const data of [{ title: '' }, { description: 'a'.repeat(10001) }, { presentation: 'a'.repeat(100001) }, { presentation: null }, { presentation: 42 }, { presentation: '\0' }, { tags: Array(21).fill('UI') }, { tags: [null] }, { tags: ['a'.repeat(61)] }, { published: 'true' }, { sort_order: -1 }, { sort_order: 1.5 }, { sort_order: 100001 }]) assert.throws(() => workInput({ ...input, ...data }))
  assert.equal(workId('10000000-0000-0000-0000-000000000001'), '10000000-0000-0000-0000-000000000001')
  for (const id of ['draft-slug', '../admin', '', null]) assert.throws(() => workId(id))
  assert.throws(() => workIdentity({ id: 'forged', updated_at: new Date().toISOString() }))
  assert.throws(() => workIdentity({ id: '10000000-0000-0000-0000-000000000001', updated_at: 'yesterday' }))
  assert.throws(() => workPage({ page: -1 }))
})

test('public project identities use the database UUID, never a legacy alias or title', () => {
  const row: WorkRow = { ...input, id: '30000000-0000-0000-0000-000000000001', slug: 'old-alias', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  assert.equal(projectFromRow(row).id, row.id)
  assert.equal(projectFromRow({ ...row, title: 'Changed title' }).id, row.id)
  for (const project of seedProjects) assert.equal(workId(project.id), project.id)
  assert.equal(new Set(seedProjects.map(project => project.id)).size, seedProjects.length)
})

test('reorder input requires a bounded page, unique IDs and valid versions', () => {
  const identity = { id: '10000000-0000-0000-0000-000000000001', updated_at: new Date().toISOString() }
  assert.deepEqual(reorderWorkInput({ page: 0, projects: [identity] }), { page: 0, projects: [identity] })
  for (const value of [{ page: -1, projects: [identity] }, { page: 0, projects: [] }, { page: 0, projects: [identity, identity] }, { page: 0, projects: Array(21).fill(identity) }, { page: 0, projects: [{ ...identity, updated_at: 'forged' }] }]) assert.throws(() => reorderWorkInput(value))
})

test('work migration enforces published-only reads, admin-only writes and stale-write protection', async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, created_at timestamptz default now());
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`)
    let existingIds: string[] = []
    for (const migration of ['202611100001_dashboard_accounts.sql', '202611100002_work_projects.sql', '202611100003_work_reordering.sql', '202611100004_work_presentation.sql', '202611100005_work_id_urls.sql']) {
      if (migration === '202611100005_work_id_urls.sql') existingIds = (await db.query<{ id: string }>('select id from public.work_projects order by id')).rows.map(row => row.id)
      await db.exec(await readFile(new URL('../supabase/migrations/' + migration, import.meta.url), 'utf8'))
    }
    assert.deepEqual((await db.query<{ id: string }>('select id from public.work_projects order by id')).rows.map(row => row.id), existingIds, 'URL migration must not replace existing database IDs')
    const seeded = await db.query<{ slug: string; title: string }>('select slug,title from public.work_projects order by sort_order')
    assert.deepEqual(seeded.rows, Object.entries(seedLegacyIds).map(([slug, id]) => ({ slug, title: seedProjects.find(project => project.id === id)!.title })))
    const admin = '10000000-0000-0000-0000-000000000001', member = '10000000-0000-0000-0000-000000000002'
    await db.exec(`insert into auth.users (id,email) values ('${admin}','admin@test.dev'),('${member}','member@test.dev'); update public.user_roles set role='admin' where user_id='${admin}'; set role anon;`)
    assert.equal((await db.query('select * from public.work_projects')).rows.length, 5)
    await assert.rejects(db.query("insert into public.work_projects (title,image_url,image_alt) values ('Blocked','/imgs/a.jpg','Alt')"), /permission denied/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${member}'`)
    await assert.rejects(db.query("insert into public.work_projects (title,image_url,image_alt) values ('Blocked','/imgs/a.jpg','Alt')"), /row-level security/)
    assert.equal((await db.query("update public.work_projects set title='Forged' where slug='dal' returning id")).rows.length, 0)
    assert.equal((await db.query("delete from public.work_projects where slug='dal' returning id")).rows.length, 0)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    const draft = (await db.query<{ id: string; version: string }>("insert into public.work_projects (title,image_url,image_alt,presentation) values ('Draft','/imgs/a.jpg','Alt','# Private presentation') returning id,updated_at::text as version")).rows[0]
    assert.equal((await db.query<{ presentation: string }>('select presentation from public.work_projects where id=$1', [draft.id])).rows[0].presentation, '# Private presentation')
    await assert.rejects(db.query('update public.work_projects set presentation=repeat(\'x\',100001) where id=$1', [draft.id]), /presentation_length/)
    await db.exec(`set request.jwt.claim.sub='${member}'`)
    assert.equal((await db.query('select presentation from public.work_projects where id=$1', [draft.id])).rows.length, 0)
    assert.equal((await db.query("update public.work_projects set presentation='forged' where slug='dal' returning id")).rows.length, 0)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    assert.equal((await db.query('select * from public.work_projects')).rows.length, 6)
    await assert.rejects(db.query("update public.work_projects set updated_at=now() where id=$1", [draft.id]), /permission denied/)
    const changed = (await db.query<{ version: string }>("update public.work_projects set title='Changed' where id=$1 and updated_at=$2::timestamptz returning updated_at::text as version", [draft.id, draft.version])).rows[0]
    assert.notEqual(changed.version, draft.version)
    assert.equal((await db.query("update public.work_projects set title='Stale' where id=$1 and updated_at=$2::timestamptz returning id", [draft.id, draft.version])).rows.length, 0)
    await db.exec('reset role; set role anon')
    assert.equal((await db.query('select * from public.work_projects where id=$1', [draft.id])).rows.length, 0)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${admin}'`)
    await db.query('update public.work_projects set published=true where id=$1', [draft.id])
    await db.exec('reset role; set role anon')
    assert.equal((await db.query<{ presentation: string }>('select presentation from public.work_projects where id=$1', [draft.id])).rows[0].presentation, '# Private presentation')
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${admin}'`)
    await db.query('update public.work_projects set published=false where id=$1', [draft.id])
    await assert.rejects(db.query("update public.work_projects set slug='changed-alias' where id=$1", [draft.id]), /permission denied/)
    await assert.rejects(db.query("insert into public.work_projects (slug,title,image_url,image_alt) values ('custom','Blocked alias','/imgs/a.jpg','Alt')"), /permission denied/)
    const newRow = (await db.query<{ id: string; slug: string | null }>("insert into public.work_projects (title,image_url,image_alt) values ('Same title','/imgs/a.jpg','Alt'),('Same title','/imgs/a.jpg','Alt') returning id,slug")).rows
    assert.equal(newRow.length, 2)
    assert.notEqual(newRow[0].id, newRow[1].id)
    assert.equal(newRow[0].slug, null)
    assert.equal(newRow[1].slug, null)
    await db.query('delete from public.work_projects where id=$1 or id=$2', [newRow[0].id, newRow[1].id])
    await db.exec('reset role; set role anon')
    assert.equal((await db.query('select * from public.work_projects where id=$1', [draft.id])).rows.length, 0)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${admin}'`)
    assert.equal((await db.query('delete from public.work_projects where id=$1 returning id', [draft.id])).rows.length, 1)

    // Add enough projects to verify a full page and a partial second page.
    await db.query("insert into public.work_projects (title,image_url,image_alt,sort_order) select 'Extra '||n, '/imgs/a.jpg', 'Alt', n*10 from generate_series(6,26) as n")
    type Ordered = { id: string; version: string; sort_order: number }
    const snapshot = async () => (await db.query<Ordered>('select id,updated_at::text as version,sort_order from public.work_projects order by sort_order,created_at,id')).rows
    const before = await snapshot()
    const desired = before.slice(0, 20).reverse()
    const args = (projects: Ordered[]) => [
      '{' + projects.map(project => JSON.stringify(project.id)).join(',') + '}',
      '{' + projects.map(project => JSON.stringify(project.version)).join(',') + '}',
    ]
    const rpc = 'select public.reorder_work_projects($1, $2::uuid[], $3::timestamptz[])'
    await db.exec('reset role; set role anon')
    await assert.rejects(db.query(rpc, [0, ...args(desired)]), /permission denied/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${member}'`)
    await assert.rejects(db.query(rpc, [0, ...args(desired)]), /Administrator access/)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    await db.query(rpc, [0, ...args(desired)])
    const firstOrder = await snapshot()
    assert.deepEqual(firstOrder.map(project => project.id), [...desired, ...before.slice(20)].map(project => project.id), 'other pages must retain their relative order')
    assert.deepEqual(firstOrder.map(project => project.sort_order), firstOrder.map((_, index) => index))
    await assert.rejects(db.query(rpc, [0, ...args(desired)]), /Project list changed/)
    await assert.rejects(db.query(rpc, [0, ...args(firstOrder.slice(0, 19))]), /Project list changed/)
    await assert.rejects(db.query(rpc, [1, ...args(firstOrder.slice(0, 20))]), /Project list changed/)
    await assert.rejects(db.query(rpc, [0, ...args(Array(20).fill(firstOrder[0]))]), /Invalid project order/)
    assert.deepEqual(await snapshot(), firstOrder, 'failed reorders must not partially update any rows')
    const lastPage = firstOrder.slice(20).reverse()
    await db.query(rpc, [1, ...args(lastPage)])
    assert.deepEqual((await snapshot()).map(project => project.id), [...firstOrder.slice(0, 20), ...lastPage].map(project => project.id))
    await db.exec('reset role; set role anon')
    assert.equal((await db.query('select * from public.work_projects')).rows.length, 5, 'reordering must not publish drafts')
  } finally { await db.close() }
})
