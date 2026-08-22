-- GradMap Phase 4 Migration: Scholarships, funding, expenses and decisions
-- This migration adds scholarship targeting, expense tracking and enhances
-- application decision/offer fields.

-- ============================================================
-- SCHOLARSHIPS
-- ============================================================
create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  provider text,
  official_url text,
  funding_type text not null default 'unknown'
    check (funding_type in ('full', 'partial', 'stipend', 'tuition', 'loan', 'other', 'unknown')),
  amount numeric(12,2) check (amount is null or amount >= 0),
  currency_code text check (currency_code is null or char_length(currency_code) = 3),
  coverage_notes text,
  application_mechanism text not null default 'unknown'
    check (application_mechanism in ('automatic', 'separate', 'nomination', 'unknown')),
  eligibility_status text not null default 'unknown'
    check (eligibility_status in ('unknown', 'likely', 'eligible', 'ineligible', 'needs_verification')),
  eligibility_notes text,
  service_obligation_notes text,
  display_priority smallint default 3 check (display_priority between 1 and 5),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware composite foreign key
alter table public.scholarships
  add constraint scholarships_id_user_id_key unique (id, user_id);

-- Indexes
create index scholarships_user_id_idx on public.scholarships (user_id);
create index scholarships_user_priority_idx
  on public.scholarships (user_id, display_priority desc)
  where archived_at is null;

-- RLS
alter table public.scholarships enable row level security;

create policy "Scholarships: owner can view"
  on public.scholarships for select
  using (auth.uid() = user_id);

create policy "Scholarships: owner can insert"
  on public.scholarships for insert
  with check (auth.uid() = user_id);

create policy "Scholarships: owner can update"
  on public.scholarships for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Scholarships: owner can delete"
  on public.scholarships for delete
  using (auth.uid() = user_id);

-- ============================================================
-- PROGRAM SCHOLARSHIPS (junction)
-- ============================================================
create table public.program_scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  compatibility_status text not null default 'needs_verification'
    check (compatibility_status in ('possible', 'confirmed', 'ineligible', 'needs_verification')),
  notes text,
  created_at timestamptz not null default now()
);

-- Unique constraint
alter table public.program_scholarships
  add constraint program_scholarships_user_program_scholarship_key
  unique (user_id, program_id, scholarship_id);

-- Ownership-aware composite foreign keys
alter table public.program_scholarships
  add constraint program_scholarships_program_owner_fkey
  foreign key (program_id, user_id)
  references public.programs (id, user_id)
  on delete cascade;

alter table public.program_scholarships
  add constraint program_scholarships_scholarship_owner_fkey
  foreign key (scholarship_id, user_id)
  references public.scholarships (id, user_id)
  on delete cascade;

-- Indexes
create index program_scholarships_user_id_idx on public.program_scholarships (user_id);
create index program_scholarships_program_id_idx on public.program_scholarships (program_id);
create index program_scholarships_scholarship_id_idx on public.program_scholarships (scholarship_id);

-- RLS
alter table public.program_scholarships enable row level security;

create policy "Program scholarships: owner can view"
  on public.program_scholarships for select
  using (auth.uid() = user_id);

create policy "Program scholarships: owner can insert"
  on public.program_scholarships for insert
  with check (auth.uid() = user_id);

create policy "Program scholarships: owner can update"
  on public.program_scholarships for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Program scholarships: owner can delete"
  on public.program_scholarships for delete
  using (auth.uid() = user_id);

-- ============================================================
-- SCHOLARSHIP APPLICATIONS
-- ============================================================
create table public.scholarship_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete restrict,
  application_id uuid references public.applications(id) on delete set null,
  status text not null default 'researching'
    check (status in (
      'researching', 'eligible', 'preparing', 'nomination_pending',
      'submitted', 'interview', 'awarded', 'reserve',
      'rejected', 'withdrawn', 'not_required'
    )),
  nomination_required boolean default false,
  nomination_status text
    check (nomination_status is null or nomination_status in ('not_started', 'requested', 'confirmed', 'declined')),
  submitted_at timestamptz,
  decision_at timestamptz,
  award_amount numeric(12,2) check (award_amount is null or award_amount >= 0),
  award_currency_code text check (award_currency_code is null or char_length(award_currency_code) = 3),
  conditions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware composite foreign keys
alter table public.scholarship_applications
  add constraint scholarship_applications_scholarship_owner_fkey
  foreign key (scholarship_id, user_id)
  references public.scholarships (id, user_id)
  on delete restrict;

alter table public.scholarship_applications
  add constraint scholarship_applications_id_user_id_key unique (id, user_id);

-- Indexes
create index scholarship_applications_user_id_idx on public.scholarship_applications (user_id);
create index scholarship_applications_scholarship_id_idx on public.scholarship_applications (scholarship_id);
create index scholarship_applications_application_id_idx on public.scholarship_applications (application_id);
create index scholarship_applications_user_status_idx
  on public.scholarship_applications (user_id, status)
  where archived_at is null;

-- RLS
alter table public.scholarship_applications enable row level security;

create policy "Scholarship applications: owner can view"
  on public.scholarship_applications for select
  using (auth.uid() = user_id);

create policy "Scholarship applications: owner can insert"
  on public.scholarship_applications for insert
  with check (auth.uid() = user_id);

create policy "Scholarship applications: owner can update"
  on public.scholarship_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Scholarship applications: owner can delete"
  on public.scholarship_applications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  scholarship_application_id uuid references public.scholarship_applications(id) on delete set null,
  category text not null default 'other'
    check (category in ('application_fee', 'test', 'translation', 'courier', 'visa', 'deposit', 'other')),
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency_code text not null check (char_length(currency_code) = 3),
  status text not null default 'planned'
    check (status in ('planned', 'due', 'paid', 'waived', 'refunded')),
  due_on date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Ownership-aware composite foreign keys
alter table public.expenses
  add constraint expenses_application_owner_fkey
  foreign key (application_id, user_id)
  references public.applications (id, user_id)
  on delete set null;

alter table public.expenses
  add constraint expenses_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete set null;

alter table public.expenses
  add constraint expenses_id_user_id_key unique (id, user_id);

-- Indexes
create index expenses_user_id_idx on public.expenses (user_id);
create index expenses_application_id_idx on public.expenses (application_id);
create index expenses_scholarship_application_id_idx on public.expenses (scholarship_application_id);
create index expenses_user_status_idx
  on public.expenses (user_id, status)
  where archived_at is null;

-- RLS
alter table public.expenses enable row level security;

create policy "Expenses: owner can view"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Expenses: owner can insert"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Expenses: owner can update"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Expenses: owner can delete"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ALTER APPLICATIONS: Add decision/offer fields
-- ============================================================
alter table public.applications
  add column decision_type text
    check (decision_type is null or decision_type in ('admitted', 'rejected', 'waitlisted', 'deferred', 'withdrawn'));

alter table public.applications
  add column offer_amount numeric(12,2) check (offer_amount is null or offer_amount >= 0);

alter table public.applications
  add column offer_currency_code text check (offer_currency_code is null or char_length(offer_currency_code) = 3);

alter table public.applications
  add column offer_financial_aid boolean default false;

alter table public.applications
  add column offer_aid_details text;

alter table public.applications
  add column enrollment_deadline timestamptz;

-- ============================================================
-- ALTER DEADLINES: Add FKs for scholarship/scholarship_application
-- ============================================================
alter table public.deadlines
  add constraint deadlines_scholarship_owner_fkey
  foreign key (scholarship_id, user_id)
  references public.scholarships (id, user_id)
  on delete set null;

alter table public.deadlines
  add constraint deadlines_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete set null;

create index deadlines_scholarship_id_idx on public.deadlines (scholarship_id);
create index deadlines_scholarship_application_id_idx on public.deadlines (scholarship_application_id);

-- ============================================================
-- ALTER TASKS: Add FKs for scholarship/scholarship_application
-- ============================================================
alter table public.tasks
  add constraint tasks_scholarship_owner_fkey
  foreign key (scholarship_id, user_id)
  references public.scholarships (id, user_id)
  on delete set null;

alter table public.tasks
  add constraint tasks_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete set null;

create index tasks_scholarship_id_idx on public.tasks (scholarship_id);

-- ============================================================
-- GRANTS
-- ============================================================
grant select, insert, update, delete on public.scholarships to authenticated;
grant select, insert, update, delete on public.program_scholarships to authenticated;
grant select, insert, update, delete on public.scholarship_applications to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
