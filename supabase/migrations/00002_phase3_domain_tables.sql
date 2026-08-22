-- GradMap Phase 3 Migration: Institutions, Programs, Applications, Deadlines, Tasks
-- This migration creates the core domain tables for the first usable vertical slice.

-- ============================================================
-- INSTITUTIONS
-- ============================================================
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  country_code text,
  country_name text,
  city text,
  website_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware unique constraint
alter table public.institutions
  add constraint institutions_id_user_id_key unique (id, user_id);

-- Indexes
create index institutions_user_id_idx on public.institutions (user_id);

-- RLS
alter table public.institutions enable row level security;

create policy "Institutions: owner can view"
  on public.institutions for select
  using (auth.uid() = user_id);

create policy "Institutions: owner can insert"
  on public.institutions for insert
  with check (auth.uid() = user_id);

create policy "Institutions: owner can update"
  on public.institutions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Institutions: owner can delete"
  on public.institutions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- PROGRAMS
-- ============================================================
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  name text not null,
  degree_type text,
  department text,
  field text,
  intake_term text,
  intake_year smallint default 2027,
  duration_months smallint,
  delivery_mode text,
  program_url text,
  application_portal_url text,
  status text not null default 'exploring'
    check (status in ('exploring', 'shortlisted', 'applying', 'applied', 'closed', 'archived')),
  display_priority smallint default 3 check (display_priority between 1 and 5),
  requirements_summary text,
  research_notes text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware composite foreign key
alter table public.programs
  add constraint programs_institution_owner_fkey
  foreign key (institution_id, user_id)
  references public.institutions (id, user_id)
  on delete restrict;

alter table public.programs
  add constraint programs_id_user_id_key unique (id, user_id);

-- Indexes
create index programs_user_id_idx on public.programs (user_id);
create index programs_institution_id_idx on public.programs (institution_id);
create index programs_user_status_priority_idx
  on public.programs (user_id, status, display_priority desc)
  where archived_at is null;

-- RLS
alter table public.programs enable row level security;

create policy "Programs: owner can view"
  on public.programs for select
  using (auth.uid() = user_id);

create policy "Programs: owner can insert"
  on public.programs for insert
  with check (auth.uid() = user_id);

create policy "Programs: owner can update"
  on public.programs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Programs: owner can delete"
  on public.programs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- PROGRAM EVALUATIONS
-- ============================================================
create table public.program_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  academic_fit smallint check (academic_fit between 0 and 5),
  research_career_fit smallint check (research_career_fit between 0 and 5),
  funding_strength smallint check (funding_strength between 0 and 5),
  admission_feasibility smallint check (admission_feasibility between 0 and 5),
  location_personal_fit smallint check (location_personal_fit between 0 and 5),
  academic_weight smallint default 20,
  research_weight smallint default 25,
  funding_weight smallint default 20,
  feasibility_weight smallint default 20,
  location_weight smallint default 15,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, user_id)
);

-- Indexes
create index program_evaluations_user_id_idx on public.program_evaluations (user_id);
create index program_evaluations_program_id_idx on public.program_evaluations (program_id);

-- RLS
alter table public.program_evaluations enable row level security;

create policy "Program evaluations: owner can view"
  on public.program_evaluations for select
  using (auth.uid() = user_id);

create policy "Program evaluations: owner can insert"
  on public.program_evaluations for insert
  with check (auth.uid() = user_id);

create policy "Program evaluations: owner can update"
  on public.program_evaluations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Program evaluations: owner can delete"
  on public.program_evaluations for delete
  using (auth.uid() = user_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  status text not null default 'researching'
    check (status in (
      'researching', 'shortlisted', 'preparing', 'ready', 'submitted',
      'interview', 'waitlisted', 'admitted', 'rejected', 'withdrawn',
      'deferred', 'enrolled'
    )),
  priority smallint default 3 check (priority between 1 and 5),
  application_round text,
  portal_url text,
  applicant_reference text,
  fee_amount numeric(12,2),
  fee_currency_code text,
  fee_status text default 'unknown'
    check (fee_status in ('unknown', 'not_due', 'due', 'paid', 'waived', 'refunded')),
  submitted_at timestamptz,
  decision_at timestamptz,
  response_due_at timestamptz,
  decision_conditions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware composite foreign key
alter table public.applications
  add constraint applications_program_owner_fkey
  foreign key (program_id, user_id)
  references public.programs (id, user_id)
  on delete restrict;

alter table public.applications
  add constraint applications_id_user_id_key unique (id, user_id);

-- Indexes
create index applications_user_id_idx on public.applications (user_id);
create index applications_program_id_idx on public.applications (program_id);
create index applications_user_status_priority_idx
  on public.applications (user_id, status, priority desc)
  where archived_at is null;

-- RLS
alter table public.applications enable row level security;

create policy "Applications: owner can view"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Applications: owner can insert"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Applications: owner can update"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Applications: owner can delete"
  on public.applications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- APPLICATION STATUS HISTORY
-- ============================================================
create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

-- Indexes
create index application_status_history_user_id_idx on public.application_status_history (user_id);
create index application_status_history_application_id_idx on public.application_status_history (application_id);

-- RLS
alter table public.application_status_history enable row level security;

create policy "Application status history: owner can view"
  on public.application_status_history for select
  using (auth.uid() = user_id);

create policy "Application status history: owner can insert"
  on public.application_status_history for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- DEADLINES
-- ============================================================
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline_type text not null default 'custom'
    check (deadline_type in (
      'priority', 'final', 'funding', 'document', 'recommendation',
      'interview', 'decision', 'internal', 'custom'
    )),
  due_at timestamptz not null,
  timezone text,
  is_date_only boolean default false,
  source_url text,
  last_verified_at timestamptz,
  is_hard_deadline boolean default true,
  completed_at timestamptz,
  notes text,
  program_id uuid references public.programs(id) on delete set null,
  scholarship_id uuid,
  application_id uuid references public.applications(id) on delete set null,
  scholarship_application_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Indexes
create index deadlines_user_id_idx on public.deadlines (user_id);
create index deadlines_application_id_idx on public.deadlines (application_id);
create index deadlines_program_id_idx on public.deadlines (program_id);
create index deadlines_user_due_idx
  on public.deadlines (user_id, due_at, id)
  where completed_at is null and archived_at is null;

-- RLS
alter table public.deadlines enable row level security;

create policy "Deadlines: owner can view"
  on public.deadlines for select
  using (auth.uid() = user_id);

create policy "Deadlines: owner can insert"
  on public.deadlines for insert
  with check (auth.uid() = user_id);

create policy "Deadlines: owner can update"
  on public.deadlines for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Deadlines: owner can delete"
  on public.deadlines for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TASKS
-- ============================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority smallint default 3 check (priority between 1 and 5),
  due_at timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  blocking boolean default false,
  completed_at timestamptz,
  program_id uuid references public.programs(id) on delete set null,
  scholarship_id uuid,
  application_id uuid references public.applications(id) on delete set null,
  scholarship_application_id uuid,
  document_id uuid,
  recommendation_request_id uuid,
  essay_prompt_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Indexes
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_application_id_idx on public.tasks (application_id);
create index tasks_user_status_due_idx
  on public.tasks (user_id, status, due_at, id)
  where archived_at is null and status not in ('done', 'cancelled');

-- RLS
alter table public.tasks enable row level security;

create policy "Tasks: owner can view"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Tasks: owner can insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Tasks: owner can update"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Tasks: owner can delete"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY EVENTS (append-only audit trail)
-- ============================================================
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index activity_events_user_id_idx on public.activity_events (user_id, created_at desc, id);

-- RLS
alter table public.activity_events enable row level security;

create policy "Activity events: owner can view"
  on public.activity_events for select
  using (auth.uid() = user_id);

create policy "Activity events: owner can insert"
  on public.activity_events for insert
  with check (auth.uid() = user_id);
