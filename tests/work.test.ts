import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { workId, workIdentity, workInput, workPage, workSlug } from '../src/work/validation'
import { seedProjects } from '../src/work/seed'

const input = { slug: 'new-project', title: 'New project', description: '', image_url: '/imgs/sc.jpg', image_alt: 'App preview', tags: ['UI Design'], published: false, sort_order: 5 }

test('work input whitelists fields, preserves drafts and normalizes categories', () => {
  const data = workInput({ ...input, title: ' Project ', tags: [' UI Design ', 'UI Design'], role: 'admin', created_at: 'forged' })
  assert.equal(data.identity, null)
  assert.equal(data.fields.title, 'Project')
  assert.equal(data.fields.published, false)
  assert.deepEqual(data.fields.tags, ['UI Design'])
  assert.equal('role' in data.fields, false)
  assert.equal('created_at' in data.fields, false)
  assert.equal(workInput({ ...input, image_url: 'https://example.com/image.png' }).fields.image_url, 'https://example.com/image.png')
})

test('work validation rejects unsafe images, slugs, unbounded data and invalid versions', () => {
  for (const image_url of ['javascript:alert(1)', 'data:image/svg+xml,hi', '//evil.test/image', '/\\evil.test/x', 'http://example.com/image.png', 'https://u:p@example.com/a', '/imgs/a\n.jpg']) assert.throws(() => workInput({ ...input, image_url }))
  for (const slug of ['../admin', '/work/test', 'A B', 'has/slash', 'a'.repeat(101)]) assert.throws(() => workSlug(slug))
  for (const data of [{ title: '' }, { description: 'a'.repeat(10001) }, { tags: Array(21).fill('UI') }, { tags: [null] }, { tags: ['a'.repeat(61)] }, { published: 'true' }, { sort_order: -1 }, { sort_order: 1.5 }, { sort_order: 100001 }]) assert.throws(() => workInput({ ...input, ...data }))
  assert.equal(workId('10000000-0000-0000-0000-000000000001'), '10000000-0000-0000-0000-000000000001')
  for (const id of ['draft-slug', '../admin', '', null]) assert.throws(() => workId(id))
  assert.throws(() => workIdentity({ id: 'forged', updated_at: new Date().toISOString() }))
  assert.throws(() => workIdentity({ id: '10000000-0000-0000-0000-000000000001', updated_at: 'yesterday' }))
  assert.throws(() => workPage({ page: -1 }))
})

test('work migration enforces published-only reads, admin-only writes and stale-write protection', async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, created_at timestamptz default now());
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`)
    for (const migration of ['202611100001_dashboard_accounts.sql', '202611100002_work_projects.sql']) await db.exec(await readFile(new URL('../supabase/migrations/' + migration, import.meta.url), 'utf8'))
    const seeded = await db.query<{ slug: string; title: string }>('select slug,title from public.work_projects order by sort_order')
    assert.deepEqual(seeded.rows, seedProjects.map(project => ({ slug: project.id, title: project.title })))
    const admin = '10000000-0000-0000-0000-000000000001', member = '10000000-0000-0000-0000-000000000002'
    await db.exec(`insert into auth.users (id,email) values ('${admin}','admin@test.dev'),('${member}','member@test.dev'); update public.user_roles set role='admin' where user_id='${admin}'; set role anon;`)
    assert.equal((await db.query('select * from public.work_projects')).rows.length, 5)
    await assert.rejects(db.query("insert into public.work_projects (slug,title,image_url,image_alt) values ('blocked','Blocked','/imgs/a.jpg','Alt')"), /permission denied/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${member}'`)
    await assert.rejects(db.query("insert into public.work_projects (slug,title,image_url,image_alt) values ('blocked','Blocked','/imgs/a.jpg','Alt')"), /row-level security/)
    assert.equal((await db.query("update public.work_projects set title='Forged' where slug='dal' returning id")).rows.length, 0)
    assert.equal((await db.query("delete from public.work_projects where slug='dal' returning id")).rows.length, 0)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    const draft = (await db.query<{ id: string; version: string }>("insert into public.work_projects (slug,title,image_url,image_alt) values ('draft-project','Draft','/imgs/a.jpg','Alt') returning id,updated_at::text as version")).rows[0]
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
    assert.equal((await db.query('select * from public.work_projects where id=$1', [draft.id])).rows.length, 1)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${admin}'`)
    await db.query('update public.work_projects set published=false where id=$1', [draft.id])
    await assert.rejects(db.query("insert into public.work_projects (slug,title,image_url,image_alt) values ('dal','Duplicate','/imgs/a.jpg','Alt')"), /unique/)
    await db.exec('reset role; set role anon')
    assert.equal((await db.query('select * from public.work_projects where id=$1', [draft.id])).rows.length, 0)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${admin}'`)
    assert.equal((await db.query('delete from public.work_projects where id=$1 returning id', [draft.id])).rows.length, 1)
  } finally { await db.close() }
})
