begin;

-- Requires 202611100001_dashboard_accounts.sql (private.is_admin).
create table public.work_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 10000),
  image_url text not null check (
    char_length(image_url) between 1 and 2048 and
    position(chr(92) in image_url) = 0 and image_url !~ '[[:space:][:cntrl:]]' and
    (image_url like 'https://%' or (left(image_url, 1) = '/' and left(image_url, 2) <> '//'))
  ),
  image_alt text not null check (char_length(trim(image_alt)) between 1 and 240),
  tags text[] not null default '{}' check (cardinality(tags) <= 20 and array_position(tags, null) is null and char_length(array_to_string(tags, ',')) <= 1219),
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index work_projects_public_order on public.work_projects (sort_order, created_at, id) where published;
alter table public.work_projects enable row level security;
revoke all on public.work_projects from public, anon, authenticated;
grant select on public.work_projects to anon, authenticated;
grant insert (slug, title, description, image_url, image_alt, tags, published, sort_order) on public.work_projects to authenticated;
grant update (slug, title, description, image_url, image_alt, tags, published, sort_order) on public.work_projects to authenticated;
grant delete on public.work_projects to authenticated;

create policy "published work read" on public.work_projects for select to anon, authenticated using (published);
create policy "admin work management" on public.work_projects for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create function private.work_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = pg_catalog.clock_timestamp();
  return new;
end;
$$;
revoke all on function private.work_updated_at() from public, anon, authenticated;
create trigger work_updated_at before update on public.work_projects
for each row execute function private.work_updated_at();

-- Preserve existing public cards and URLs exactly; new projects default to draft.
insert into public.work_projects (slug, title, image_url, image_alt, tags, published, sort_order) values
('couponz-souq', 'Couponz Souq', '/imgs/sc.jpg', 'Couponz Souq mobile app', array['UI Design', 'Mobile App'], true, 0),
('tracker-3arbya', 'Tracker 3arbya', '/imgs/t3.jpg', 'Tracker 3arbya mobile app', array['Case Study', 'UX Design', 'UI Design', 'Mobile App'], true, 1),
('tia-jewelry', 'Tia Jewelry', '/imgs/tia.jpg', 'Tia Jewelry website', array['UX Design', 'UI Design', 'Website'], true, 2),
('dal', 'Dal', '/imgs/dal.jpg', 'Dal mobile app', array['Case Study', 'UX Design', 'UI Design'], true, 3),
('shipin', 'Shipin', '/imgs/shipin.jpg', 'Shipin mobile app', array['Case Study', 'UX Design', 'Mobile App'], true, 4);

commit;
