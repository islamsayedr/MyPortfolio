import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'

// Execute the real migration and real PostgreSQL RLS in an isolated database.
// auth.users/auth.uid below stand in for Supabase Auth, not a live project.
test('account migration enforces member/admin permissions in PostgreSQL', async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb, created_at timestamptz default now());
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
    `)
    await db.exec(await readFile(new URL('../supabase/migrations/202611100001_dashboard_accounts.sql', import.meta.url), 'utf8'))
    const admin = '10000000-0000-0000-0000-000000000001'
    const alice = '10000000-0000-0000-0000-000000000002'
    const bob = '10000000-0000-0000-0000-000000000003'
    await db.exec(`insert into auth.users (id,email,raw_user_meta_data) values
      ('${admin}','admin@test.dev','{"display_name":"Admin"}'),
      ('${alice}','alice@test.dev','{"display_name":"Alice","role":"admin"}'),
      ('${bob}','bob@test.dev','{"display_name":"Bob"}');
      update public.user_roles set role='admin' where user_id='${admin}';`)
    await db.exec(`set role anon`)
    await assert.rejects(db.query('select * from public.profiles'), /permission denied/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${alice}'`)
    assert.equal((await db.query('select * from public.profiles')).rows.length, 1)
    const roles = await db.query<{ role: string }>('select role from public.user_roles')
    assert.deepEqual(roles.rows, [{ role: 'user' }], 'signup metadata must not elevate permissions')
    assert.equal((await db.query(`select * from public.profiles where id='${bob}'`)).rows.length, 0)
    await db.query("update public.profiles set display_name='Updated' where id=$1", [alice])
    await assert.rejects(db.query("update public.profiles set email='forged@test.dev' where id=$1", [alice]), /permission denied/)
    await assert.rejects(db.query("update public.user_roles set role='admin' where user_id=$1", [alice]), /permission denied/)
    await assert.rejects(db.query("select public.set_user_role($1, 'admin')", [bob]), /Administrator access/)
    await db.exec(`set request.jwt.claim.sub='${admin}'`)
    assert.equal((await db.query('select * from public.profiles')).rows.length, 3)
    await db.query("select public.set_user_role($1, 'admin')", [bob])
    assert.equal((await db.query<{ role: string }>('select role from public.user_roles where user_id=$1', [bob])).rows[0].role, 'admin')
    await assert.rejects(db.query("select public.set_user_role($1, 'user')", [admin]), /own role/)
    await db.query("select public.set_user_role($1, 'user')", [bob])
    assert.equal((await db.query<{ role: string }>('select role from public.user_roles where user_id=$1', [bob])).rows[0].role, 'user')
    await db.exec(`reset role; update auth.users set email='new@test.dev' where id='${alice}'`)
    assert.equal((await db.query<{ email: string }>('select email from public.profiles where id=$1', [alice])).rows[0].email, 'new@test.dev')
  } finally { await db.close() }
})
