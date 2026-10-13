-- Test fixtures ONLY for a disposable PostgreSQL instance; never run on Supabase.
create role anon;
create role authenticated;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth, storage to anon, authenticated;
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text unique);
alter table storage.objects enable row level security;
grant select, insert, delete on storage.objects to authenticated;
create policy owner_objects on storage.objects for all to authenticated
  using (split_part(name, '/', 1) = auth.uid()::text)
  with check (split_part(name, '/', 1) = auth.uid()::text);
