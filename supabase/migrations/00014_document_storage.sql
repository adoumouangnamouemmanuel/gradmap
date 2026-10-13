begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-files',
  'application-files',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their application files'
  ) then
    create policy "Users can read their application files"
      on storage.objects for select
      to authenticated
      using (
        bucket_id = 'application-files'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their application files'
  ) then
    create policy "Users can upload their application files"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'application-files'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their application files'
  ) then
    create policy "Users can delete their application files"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'application-files'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;
end $$;

commit;
