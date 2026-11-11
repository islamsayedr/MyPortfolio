begin;

-- UUIDs are now the canonical public identifier. Preserve existing UUIDs and
-- legacy slugs so previously shared URLs can redirect without losing content.
alter table public.work_projects alter column slug drop not null;
revoke insert (slug), update (slug) on public.work_projects from authenticated;
comment on column public.work_projects.slug is 'Read-only legacy URL alias. New project URLs use id; new rows leave this null.';
notify pgrst, 'reload schema';

commit;
