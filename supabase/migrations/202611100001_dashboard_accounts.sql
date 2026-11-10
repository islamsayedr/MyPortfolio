begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '' check (char_length(display_name) <= 120),
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin'))
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
revoke all on public.profiles, public.user_roles from public, anon, authenticated;
grant select on public.profiles, public.user_roles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create policy "own profile or admin read" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy "own display name update" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "own role or admin read" on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
-- No insert/update/delete policy for roles. Only the guarded RPC below can
-- change roles; signup metadata is never used as an authorization source.

create function private.sync_auth_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, email, display_name, created_at)
    values (new.id, coalesce(new.email, ''), left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 120), new.created_at);
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  else
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_auth_profile() from public, anon, authenticated;
create trigger dashboard_auth_profile_insert after insert on auth.users
for each row execute function private.sync_auth_profile();
create trigger dashboard_auth_email_update after update of email on auth.users
for each row execute function private.sync_auth_profile();

-- Backfill accounts created before this migration, without elevating anyone.
insert into public.profiles (id, email, display_name, created_at)
select id, coalesce(email, ''), left(trim(coalesce(raw_user_meta_data ->> 'display_name', '')), 120), created_at from auth.users
on conflict (id) do nothing;
insert into public.user_roles (user_id, role)
select id, 'user' from public.profiles on conflict (user_id) do nothing;

create function private.set_user_role(target_user_id uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare previous_role text;
begin
  -- Serialize role changes before verifying the caller. This prevents races
  -- between concurrent demotions of administrators.
  perform pg_catalog.pg_advisory_xact_lock(7826011042);
  if not private.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if new_role not in ('user', 'admin') or new_role is null then
    raise exception 'Invalid role.' using errcode = '22023';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'You cannot change your own role.' using errcode = '42501';
  end if;
  select role into previous_role from public.user_roles where user_id = target_user_id for update;
  if not found then
    raise exception 'Unknown user.' using errcode = '22023';
  end if;
  if previous_role = 'admin' and new_role = 'user' and
    (select count(*) from public.user_roles where role = 'admin') <= 1 then
    raise exception 'The last administrator must be retained.' using errcode = '23514';
  end if;
  update public.user_roles set role = new_role where user_id = target_user_id;
end;
$$;
revoke all on function private.set_user_role(uuid, text) from public, anon;
grant execute on function private.set_user_role(uuid, text) to authenticated;

-- Expose only an invoker wrapper. The privileged implementation stays outside
-- the public API schema and enforces authorization itself.
create function public.set_user_role(target_user_id uuid, new_role text) returns void
language sql security invoker set search_path = '' as $$
  select private.set_user_role(target_user_id, new_role);
$$;
revoke all on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

commit;
