begin;

-- Serialize reorder transactions and protect against stale page snapshots.
-- UUIDs and versions are paired in the desired order for one 20-item page.
create function private.reorder_work_projects(page_index integer, project_ids uuid[], expected_versions timestamptz[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  all_ids uuid[];
  current_page uuid[];
  reordered_ids uuid[];
  start_position integer;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if page_index is null or page_index < 0 or page_index > 10000 or
    project_ids is null or expected_versions is null or
    cardinality(project_ids) < 1 or cardinality(project_ids) > 20 or
    cardinality(project_ids) <> cardinality(expected_versions) or
    array_ndims(project_ids) <> 1 or array_ndims(expected_versions) <> 1 or
    array_position(project_ids, null) is not null or array_position(expected_versions, null) is not null or
    (select count(distinct id) from unnest(project_ids) as requested(id)) <> cardinality(project_ids) then
    raise exception 'Invalid project order.' using errcode = '22023';
  end if;

  -- Also excludes concurrent inserts/edits/deletes while rebuilding the order.
  lock table public.work_projects in share row exclusive mode;
  select coalesce(array_agg(id order by sort_order, created_at, id), '{}'::uuid[])
  into all_ids from public.work_projects;
  start_position := page_index * 20 + 1;
  current_page := all_ids[start_position:start_position + 19];
  if cardinality(current_page) <> cardinality(project_ids) or
    not (current_page @> project_ids and project_ids @> current_page) or
    exists (
      select 1 from unnest(project_ids, expected_versions) as requested(id, version)
      left join public.work_projects as project on project.id = requested.id
      where project.id is null or project.updated_at is distinct from requested.version
    ) then
    raise exception 'Project list changed. Reload before reordering.' using errcode = '40001';
  end if;
  if cardinality(all_ids) > 100001 then
    raise exception 'Too many projects to reorder.' using errcode = '22023';
  end if;

  reordered_ids := all_ids[1:start_position - 1] || project_ids || all_ids[start_position + cardinality(project_ids):cardinality(all_ids)];
  -- Normalize ranks so duplicate/manual sort values cannot displace another
  -- page. The relative order outside the requested page is preserved.
  update public.work_projects as project
  set sort_order = ranked.position::integer - 1
  from unnest(reordered_ids) with ordinality as ranked(id, position)
  where project.id = ranked.id and project.sort_order is distinct from ranked.position::integer - 1;
end;
$$;
revoke all on function private.reorder_work_projects(integer, uuid[], timestamptz[]) from public, anon;
grant execute on function private.reorder_work_projects(integer, uuid[], timestamptz[]) to authenticated;

create function public.reorder_work_projects(page_index integer, project_ids uuid[], expected_versions timestamptz[]) returns void
language sql security invoker set search_path = '' as $$
  select private.reorder_work_projects(page_index, project_ids, expected_versions);
$$;
revoke all on function public.reorder_work_projects(integer, uuid[], timestamptz[]) from public, anon;
grant execute on function public.reorder_work_projects(integer, uuid[], timestamptz[]) to authenticated;

commit;
