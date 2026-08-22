-- GradMap Migration: profiles and notification_preferences
-- Based on DATA_MODEL.md sections 4 (Identity and preferences)

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- One row per authenticated user
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  timezone text not null default 'Africa/Accra',
  target_intake_year smallint not null default 2027
    check (target_intake_year between 2020 and 2035),
  expected_graduation_date date,
  graduation_month_label text,
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PK already provides uniqueness; no extra constraint needed

-- Index for common lookups
create index profiles_id_idx on public.profiles (id);

-- Updated at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- NOTIFICATION_PREFERENCES
-- One row per user
-- ============================================================
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  push_enabled boolean not null default false,
  email_enabled boolean not null default false,
  privacy_level text not null default 'minimal'
    check (privacy_level in ('minimal', 'descriptive')),
  quiet_hours_start time,
  quiet_hours_end time,
  daily_digest_time time,
  default_offsets_minutes integer[] not null default '{10080, 4320, 1440}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles: owner can read and update their own profile
alter table public.profiles enable row level security;

grant select, update on public.profiles to authenticated;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Allow insert on signup (auth trigger will create the profile)
create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

-- Notification preferences: owner only
alter table public.notification_preferences enable row level security;

grant select, insert, update, delete on public.notification_preferences to authenticated;

create policy notification_preferences_select_own
  on public.notification_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy notification_preferences_insert_own
  on public.notification_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy notification_preferences_update_own
  on public.notification_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy notification_preferences_delete_own
  on public.notification_preferences for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User')
  );

  insert into public.notification_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
