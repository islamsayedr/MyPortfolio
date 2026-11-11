begin;

-- Store source Markdown, not generated HTML. Existing projects stay unchanged.
alter table public.work_projects
  add column presentation text not null default ''
  constraint work_projects_presentation_length check (char_length(presentation) <= 100000);
comment on column public.work_projects.presentation is 'Project presentation in Markdown; rendered as safe HTML by the application.';

-- Existing SELECT grants and published/admin RLS policies cover the new column.
-- Explicit column-level write grants are required by the original migration.
grant insert (presentation), update (presentation) on public.work_projects to authenticated;
notify pgrst, 'reload schema';

commit;
