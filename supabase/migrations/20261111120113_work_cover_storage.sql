begin;

-- New bucket only: never turn an existing private bucket public implicitly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('work-covers', 'work-covers', true, 5242880, array['image/jpeg','image/png','image/webp']);

-- Public bucket URLs serve bytes without a SELECT policy. Uploads require a
-- verified admin, their own folder, and an immutable UUID-based object name.
create policy "work cover admin upload" on storage.objects
for insert to authenticated with check (
  bucket_id = 'work-covers' and (select private.is_admin()) and
  split_part(name, '/', 1) = (select auth.uid())::text and
  name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
);

-- Fence off this bucket even if other Storage features have broad permissive
-- policies. Unrelated buckets keep their existing access behavior.
create policy "work cover authenticated boundary" on storage.objects
as restrictive for all to authenticated
using (bucket_id <> 'work-covers' or (select private.is_admin()))
with check (bucket_id <> 'work-covers' or (
  (select private.is_admin()) and split_part(name, '/', 1) = (select auth.uid())::text and
  name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
));
create policy "work cover anonymous boundary" on storage.objects
as restrictive for all to anon
using (bucket_id <> 'work-covers') with check (bucket_id <> 'work-covers');

commit;
