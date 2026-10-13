-- Additive profile preferences. Existing users keep neutral defaults.
begin;
-- Do not depend on platform default privileges. Owner RLS remains mandatory.
grant select, insert, update, delete on public.institutions, public.programs, public.applications, public.deadlines, public.tasks to authenticated;
grant select, insert on public.activity_events, public.application_status_history to authenticated;
alter table public.profiles
  add column field_of_study text check (char_length(field_of_study) <= 160),
  add column current_qualification text check (char_length(current_qualification) <= 160),
  add column academic_institution text check (char_length(academic_institution) <= 200),
  add column career_goal text check (char_length(career_goal) <= 2000),
  add column research_interests text[] not null default '{}' check (cardinality(research_interests) <= 20),
  add column preferred_countries text[] not null default '{}' check (cardinality(preferred_countries) <= 30),
  add column target_degrees text[] not null default '{}' check (cardinality(target_degrees) <= 12),
  add column preferred_languages text[] not null default '{}' check (cardinality(preferred_languages) <= 10),
  add column delivery_preferences text[] not null default '{}' check (delivery_preferences <@ array['on_campus','online','hybrid']::text[]),
  add column funding_preference text not null default 'undecided' check (funding_preference in ('undecided','required','preferred','self_funded')),
  add column annual_tuition_budget numeric(12,2) check (annual_tuition_budget >= 0),
  add column budget_currency text not null default 'USD' check (budget_currency ~ '^[A-Z]{3}$'),
  add column study_start_term text not null default 'any' check (study_start_term in ('any','fall','spring','summer','winter'));

-- NOT VALID preserves historical data while enforcing owner references on new writes.
-- Validate these constraints after auditing any historical orphan/cross-owner rows.
alter table public.deadlines add constraint deadlines_application_owner_fkey
  foreign key (application_id, user_id) references public.applications(id, user_id) on delete restrict not valid;
alter table public.deadlines add constraint deadlines_program_owner_fkey
  foreign key (program_id, user_id) references public.programs(id, user_id) on delete restrict not valid;
alter table public.tasks add constraint tasks_application_owner_fkey
  foreign key (application_id, user_id) references public.applications(id, user_id) on delete restrict not valid;
alter table public.tasks add constraint tasks_program_owner_fkey
  foreign key (program_id, user_id) references public.programs(id, user_id) on delete restrict not valid;
alter table public.tasks add constraint tasks_document_owner_fkey
  foreign key (document_id, user_id) references public.documents(id, user_id) on delete restrict not valid;
alter table public.tasks add constraint tasks_essay_prompt_owner_fkey
  foreign key (essay_prompt_id, user_id) references public.essay_prompts(id, user_id) on delete restrict not valid;
alter table public.tasks add constraint tasks_recommendation_request_owner_fkey
  foreign key (recommendation_request_id, user_id) references public.recommendation_requests(id, user_id) on delete restrict not valid;
alter table public.document_requirements add constraint document_requirements_version_owner_fkey
  foreign key (satisfied_by_version_id, user_id) references public.document_versions(id, user_id) on delete restrict not valid;

-- Preserve legacy deadline values while accepting the current UI vocabulary.
alter table public.deadlines drop constraint if exists deadlines_deadline_type_check;
alter table public.deadlines add constraint deadlines_deadline_type_check check (deadline_type in
  ('priority','final','funding','document','recommendation','interview','decision','internal','custom',
   'application','test_score','visa','enrollment','other')) not valid;
commit;
