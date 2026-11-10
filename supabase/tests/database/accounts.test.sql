-- Run only with `supabase test db` against a local/test Supabase database.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

insert into auth.users (id, email, raw_user_meta_data, created_at) values
  ('10000000-0000-0000-0000-000000000001', 'admin@dashboard.test', '{"display_name":"Admin"}', now()),
  ('10000000-0000-0000-0000-000000000002', 'alice@dashboard.test', '{"display_name":"Alice"}', now()),
  ('10000000-0000-0000-0000-000000000003', 'bob@dashboard.test', '{"display_name":"Bob"}', now());
update public.user_roles set role = 'admin' where user_id = '10000000-0000-0000-0000-000000000001';
select is((select count(*)::int from public.profiles), 3, 'signup trigger creates profiles');

set local role anon;
select throws_ok('select * from public.profiles', '42501', null, 'anonymous profiles access denied');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*)::int from public.profiles), 1, 'member sees only own profile');
select is((select count(*)::int from public.user_roles), 1, 'member sees only own role');
select lives_ok($$update public.profiles set display_name = 'Alice Updated' where id = '10000000-0000-0000-0000-000000000002'$$, 'member can update own display name');
select throws_ok($$update public.profiles set email = 'fake@dashboard.test' where id = '10000000-0000-0000-0000-000000000002'$$, '42501', null, 'member cannot forge email');
select throws_ok($$update public.user_roles set role = 'admin' where user_id = '10000000-0000-0000-0000-000000000002'$$, '42501', null, 'member cannot directly elevate role');
select throws_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000003', 'admin')$$, '42501', null, 'member cannot invoke admin role mutation');
select is((select count(*)::int from public.profiles where id = '10000000-0000-0000-0000-000000000003'), 0, 'another member profile is hidden');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is((select count(*)::int from public.profiles), 3, 'admin sees all profiles');
select is((select count(*)::int from public.user_roles), 3, 'admin sees all roles');
select lives_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000003', 'admin')$$, 'admin can promote another member');
select is((select role from public.user_roles where user_id = '10000000-0000-0000-0000-000000000003'), 'admin', 'promotion persisted');
select throws_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000001', 'user')$$, '42501', null, 'self demotion rejected');
select lives_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000003', 'user')$$, 'admin can demote another admin');
select is((select role from public.user_roles where user_id = '10000000-0000-0000-0000-000000000003'), 'user', 'demotion persisted');
reset role;

insert into auth.users (id, email, raw_user_meta_data, created_at) values
  ('10000000-0000-0000-0000-000000000004', 'metadata@dashboard.test', '{"display_name":"Test", "role":"admin"}', now());
select is((select role from public.user_roles where user_id = '10000000-0000-0000-0000-000000000004'), 'user', 'signup metadata cannot grant administrator role');
select * from finish();
rollback;
