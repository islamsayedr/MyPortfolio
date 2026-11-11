import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { COVER_MAX_BYTES, validateCoverFile, validateCoverMetadata } from '../src/work/cover-file'
import { boundedServerFunctionRequest, SERVER_FUNCTION_MAX_BYTES } from '../src/server/request-body'

const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])

test('cover validation accepts JPEG/PNG/WebP signatures, not just filenames', async () => {
  assert.deepEqual(await validateCoverFile(new File([png], 'anything.txt', { type: 'image/png' })), { mime: 'image/png', extension: 'png' })
  assert.equal((await validateCoverFile(new File([new Uint8Array([255,216,255,224])], 'image.jpg', { type: 'image/jpeg' }))).extension, 'jpg')
  assert.equal((await validateCoverFile(new File(['RIFF1234WEBPdata'], 'image.webp', { type: 'image/webp' }))).extension, 'webp')
  await assert.rejects(validateCoverFile(new File(['<svg onload="alert(1)">'], 'fake.png', { type: 'image/png' })), /does not match/)
  await assert.rejects(validateCoverFile(new File(['<svg/>'], 'image.svg', { type: 'image/svg+xml' })), /JPEG, PNG, or WebP/)
  assert.throws(() => validateCoverMetadata({ size: 0, type: 'image/png' }), /5 MB/)
  assert.throws(() => validateCoverMetadata({ size: COVER_MAX_BYTES + 1, type: 'image/png' }), /5 MB/)
})

test('server function body limiting preserves valid multipart files', async () => {
  const form = new FormData(); form.set('file', new File([png], 'cover.png', { type: 'image/png' }))
  const request = new Request('https://example.com/_serverFn/test', { method: 'POST', body: form })
  const result = await boundedServerFunctionRequest(request)
  assert.ok(result instanceof Request)
  const data = await result.formData()
  const file = data.get('file') as File
  assert.equal(file.name, 'cover.png')
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), png)
})

test('body limiting rejects oversized declared and streamed requests', async () => {
  const declared = await boundedServerFunctionRequest(new Request('https://example.com/_serverFn/test', { method: 'POST', body: 'a', headers: { 'content-length': String(SERVER_FUNCTION_MAX_BYTES + 1) } }))
  assert.ok(declared instanceof Response); assert.equal(declared.status, 413)
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(SERVER_FUNCTION_MAX_BYTES)); controller.enqueue(new Uint8Array(1)); controller.close() } })
  const request = new Request('https://example.com/_serverFn/test', { method: 'POST', body: stream, duplex: 'half' } as RequestInit)
  const streamed = await boundedServerFunctionRequest(request)
  assert.ok(streamed instanceof Response); assert.equal(streamed.status, 413)
})

test('cover bucket permits admin uploads and fences out members/anon, even with unrelated broad policies', async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, created_at timestamptz default now());
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
      create schema storage;
      create table storage.buckets (id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      create policy "unrelated broad feature" on storage.objects for all to anon,authenticated using(true) with check(true);`)
    await db.exec(await readFile(new URL('../supabase/migrations/202611100001_dashboard_accounts.sql', import.meta.url), 'utf8'))
    await db.exec(await readFile(new URL('../supabase/migrations/20261111120113_work_cover_storage.sql', import.meta.url), 'utf8'))
    const bucket = (await db.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>("select public,file_size_limit,allowed_mime_types from storage.buckets where id='work-covers'")).rows[0]
    assert.equal(bucket.public, true); assert.equal(Number(bucket.file_size_limit), COVER_MAX_BYTES)
    assert.deepEqual(bucket.allowed_mime_types, ['image/jpeg','image/png','image/webp'])
    const admin = '10000000-0000-0000-0000-000000000001', member = '10000000-0000-0000-0000-000000000002'
    await db.exec(`insert into auth.users(id,email) values ('${admin}','admin@test.dev'),('${member}','member@test.dev'); update public.user_roles set role='admin' where user_id='${admin}'; insert into storage.buckets(id,name) values ('other','other'); set role anon;`)
    const name = `${admin}/20000000-0000-0000-0000-000000000001.png`
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('work-covers',$1)",[name]), /row-level security/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${member}'`)
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('work-covers',$1)",[name]), /row-level security/)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    await db.query("insert into storage.objects(bucket_id,name) values ('work-covers',$1)",[name])
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('work-covers',$1)",[`${member}/20000000-0000-0000-0000-000000000001.png`]), /row-level security/)
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('work-covers',$1)",[`${admin}/unsafe.svg`]), /row-level security/)
    await db.exec(`set request.jwt.claim.sub='${member}'`)
    assert.equal((await db.query("select * from storage.objects where bucket_id='work-covers'")).rows.length, 0)
    assert.equal((await db.query("delete from storage.objects where bucket_id='work-covers' returning id")).rows.length, 0)
    await db.query("insert into storage.objects(bucket_id,name) values ('other','unrelated.txt')")
    assert.equal((await db.query("select * from storage.objects where bucket_id='other'")).rows.length, 1)
  } finally { await db.close() }
})
