-- GradMap Phase 5+6 Migration: Documents, Essays, Recommenders, Contacts
-- Phase 5: Document vault and application requirements
-- Phase 6: Essays, recommenders and contacts

-- ============================================================
-- DOCUMENTS (Phase 5)
-- ============================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  document_type text not null default 'other'
    check (document_type in ('transcript', 'diploma', 'cv', 'passport', 'recommendation_letter', 'english_test', 'motivation_letter', 'research_proposal', 'portfolio', 'other')),
  current_version_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.documents
  add constraint documents_id_user_id_key unique (id, user_id);

create index documents_user_id_idx on public.documents (user_id);
create index documents_user_type_idx
  on public.documents (user_id, document_type)
  where archived_at is null;

alter table public.documents enable row level security;

create policy "Documents: owner can view"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Documents: owner can insert"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Documents: owner can update"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Documents: owner can delete"
  on public.documents for delete
  using (auth.uid() = user_id);

-- ============================================================
-- DOCUMENT VERSIONS (Phase 5)
-- ============================================================
create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number smallint not null default 1,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  sha256_hash text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.document_versions
  add constraint document_versions_document_version_unique
  unique (document_id, version_number);

alter table public.document_versions
  add constraint document_versions_id_user_id_key unique (id, user_id);

alter table public.document_versions
  add constraint document_versions_document_owner_fkey
  foreign key (document_id, user_id)
  references public.documents (id, user_id)
  on delete cascade;

create index document_versions_user_id_idx on public.document_versions (user_id);
create index document_versions_document_id_idx on public.document_versions (document_id);

alter table public.document_versions enable row level security;

create policy "Document versions: owner can view"
  on public.document_versions for select
  using (auth.uid() = user_id);

create policy "Document versions: owner can insert"
  on public.document_versions for insert
  with check (auth.uid() = user_id);

create policy "Document versions: owner can update"
  on public.document_versions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Document versions: owner can delete"
  on public.document_versions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- DOCUMENT REQUIREMENTS (Phase 5)
-- ============================================================
create table public.document_requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  scholarship_application_id uuid references public.scholarship_applications(id) on delete cascade,
  requirement_name text not null,
  document_type text not null default 'other',
  is_required boolean default true,
  satisfied_by_version_id uuid references public.document_versions(id) on delete set null,
  due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.document_requirements
  add constraint document_requirements_id_user_id_key unique (id, user_id);

alter table public.document_requirements
  add constraint document_requirements_application_owner_fkey
  foreign key (application_id, user_id)
  references public.applications (id, user_id)
  on delete cascade;

alter table public.document_requirements
  add constraint document_requirements_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete cascade;

create index document_requirements_user_id_idx on public.document_requirements (user_id);
create index document_requirements_application_id_idx on public.document_requirements (application_id);

alter table public.document_requirements enable row level security;

create policy "Document requirements: owner can view"
  on public.document_requirements for select
  using (auth.uid() = user_id);

create policy "Document requirements: owner can insert"
  on public.document_requirements for insert
  with check (auth.uid() = user_id);

create policy "Document requirements: owner can update"
  on public.document_requirements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Document requirements: owner can delete"
  on public.document_requirements for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ESSAY PROMPTS (Phase 6)
-- ============================================================
create table public.essay_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  scholarship_application_id uuid references public.scholarship_applications(id) on delete set null,
  title text not null,
  prompt_text text,
  word_limit integer check (word_limit is null or word_limit > 0),
  character_limit integer check (character_limit is null or character_limit > 0),
  status text not null default 'not_started'
    check (status in ('not_started', 'outlining', 'drafting', 'reviewing', 'final', 'submitted')),
  current_version_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.essay_prompts
  add constraint essay_prompts_id_user_id_key unique (id, user_id);

alter table public.essay_prompts
  add constraint essay_prompts_application_owner_fkey
  foreign key (application_id, user_id)
  references public.applications (id, user_id)
  on delete set null;

alter table public.essay_prompts
  add constraint essay_prompts_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete set null;

create index essay_prompts_user_id_idx on public.essay_prompts (user_id);
create index essay_prompts_application_id_idx on public.essay_prompts (application_id);

alter table public.essay_prompts enable row level security;

create policy "Essay prompts: owner can view"
  on public.essay_prompts for select
  using (auth.uid() = user_id);

create policy "Essay prompts: owner can insert"
  on public.essay_prompts for insert
  with check (auth.uid() = user_id);

create policy "Essay prompts: owner can update"
  on public.essay_prompts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Essay prompts: owner can delete"
  on public.essay_prompts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ESSAY VERSIONS (Phase 6)
-- ============================================================
create table public.essay_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  essay_prompt_id uuid not null references public.essay_prompts(id) on delete cascade,
  version_number smallint not null default 1,
  content text not null default '',
  word_count integer default 0 check (word_count >= 0),
  character_count integer default 0 check (character_count >= 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.essay_versions
  add constraint essay_versions_prompt_version_unique
  unique (essay_prompt_id, version_number);

alter table public.essay_versions
  add constraint essay_versions_id_user_id_key unique (id, user_id);

alter table public.essay_versions
  add constraint essay_versions_prompt_owner_fkey
  foreign key (essay_prompt_id, user_id)
  references public.essay_prompts (id, user_id)
  on delete cascade;

create index essay_versions_user_id_idx on public.essay_versions (user_id);
create index essay_versions_essay_prompt_id_idx on public.essay_versions (essay_prompt_id);

alter table public.essay_versions enable row level security;

create policy "Essay versions: owner can view"
  on public.essay_versions for select
  using (auth.uid() = user_id);

create policy "Essay versions: owner can insert"
  on public.essay_versions for insert
  with check (auth.uid() = user_id);

create policy "Essay versions: owner can update"
  on public.essay_versions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Essay versions: owner can delete"
  on public.essay_versions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RECOMMENDERS (Phase 6)
-- ============================================================
create table public.recommenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  email text,
  title text,
  institution text,
  relationship text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.recommenders
  add constraint recommenders_id_user_id_key unique (id, user_id);

create index recommenders_user_id_idx on public.recommenders (user_id);

alter table public.recommenders enable row level security;

create policy "Recommenders: owner can view"
  on public.recommenders for select
  using (auth.uid() = user_id);

create policy "Recommenders: owner can insert"
  on public.recommenders for insert
  with check (auth.uid() = user_id);

create policy "Recommenders: owner can update"
  on public.recommenders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Recommenders: owner can delete"
  on public.recommenders for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RECOMMENDATION REQUESTS (Phase 6)
-- ============================================================
create table public.recommendation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommender_id uuid not null references public.recommenders(id) on delete restrict,
  application_id uuid references public.applications(id) on delete set null,
  scholarship_application_id uuid references public.scholarship_applications(id) on delete set null,
  status text not null default 'planned'
    check (status in ('planned', 'requested', 'accepted', 'submitted', 'declined')),
  due_at timestamptz,
  submitted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendation_requests
  add constraint recommendation_requests_id_user_id_key unique (id, user_id);

alter table public.recommendation_requests
  add constraint recommendation_requests_recommender_owner_fkey
  foreign key (recommender_id, user_id)
  references public.recommenders (id, user_id)
  on delete restrict;

alter table public.recommendation_requests
  add constraint recommendation_requests_application_owner_fkey
  foreign key (application_id, user_id)
  references public.applications (id, user_id)
  on delete set null;

alter table public.recommendation_requests
  add constraint recommendation_requests_scholarship_application_owner_fkey
  foreign key (scholarship_application_id, user_id)
  references public.scholarship_applications (id, user_id)
  on delete set null;

create index recommendation_requests_user_id_idx on public.recommendation_requests (user_id);
create index recommendation_requests_recommender_id_idx on public.recommendation_requests (recommender_id);
create index recommendation_requests_application_id_idx on public.recommendation_requests (application_id);

alter table public.recommendation_requests enable row level security;

create policy "Recommendation requests: owner can view"
  on public.recommendation_requests for select
  using (auth.uid() = user_id);

create policy "Recommendation requests: owner can insert"
  on public.recommendation_requests for insert
  with check (auth.uid() = user_id);

create policy "Recommendation requests: owner can update"
  on public.recommendation_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Recommendation requests: owner can delete"
  on public.recommendation_requests for delete
  using (auth.uid() = user_id);

-- ============================================================
-- CONTACTS (Phase 6)
-- ============================================================
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  email text,
  phone text,
  role text,
  institution text,
  program_id uuid references public.programs(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.contacts
  add constraint contacts_id_user_id_key unique (id, user_id);

create index contacts_user_id_idx on public.contacts (user_id);

alter table public.contacts enable row level security;

create policy "Contacts: owner can view"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Contacts: owner can insert"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Contacts: owner can update"
  on public.contacts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Contacts: owner can delete"
  on public.contacts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- CONTACT INTERACTIONS (Phase 6)
-- ============================================================
create table public.contact_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  interaction_type text not null default 'email'
    check (interaction_type in ('email', 'phone', 'video_call', 'meeting', 'other')),
  summary text not null,
  happened_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.contact_interactions
  add constraint contact_interactions_id_user_id_key unique (id, user_id);

alter table public.contact_interactions
  add constraint contact_interactions_contact_owner_fkey
  foreign key (contact_id, user_id)
  references public.contacts (id, user_id)
  on delete cascade;

create index contact_interactions_user_id_idx on public.contact_interactions (user_id);
create index contact_interactions_contact_id_idx on public.contact_interactions (contact_id);

alter table public.contact_interactions enable row level security;

create policy "Contact interactions: owner can view"
  on public.contact_interactions for select
  using (auth.uid() = user_id);

create policy "Contact interactions: owner can insert"
  on public.contact_interactions for insert
  with check (auth.uid() = user_id);

create policy "Contact interactions: owner can update"
  on public.contact_interactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Contact interactions: owner can delete"
  on public.contact_interactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- GRANTS
-- ============================================================
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.document_versions to authenticated;
grant select, insert, update, delete on public.document_requirements to authenticated;
grant select, insert, update, delete on public.essay_prompts to authenticated;
grant select, insert, update, delete on public.essay_versions to authenticated;
grant select, insert, update, delete on public.recommenders to authenticated;
grant select, insert, update, delete on public.recommendation_requests to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.contact_interactions to authenticated;
