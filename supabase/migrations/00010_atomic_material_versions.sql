begin;
alter table public.essay_versions add constraint essay_versions_parent_pointer_key unique (id, essay_prompt_id, user_id);
alter table public.document_versions add constraint document_versions_parent_pointer_key unique (id, document_id, user_id);
alter table public.essay_prompts add constraint essay_prompts_current_version_parent_fkey
  foreign key (current_version_id, id, user_id) references public.essay_versions(id, essay_prompt_id, user_id) on delete restrict not valid;
alter table public.documents add constraint documents_current_version_parent_fkey
  foreign key (current_version_id, id, user_id) references public.document_versions(id, document_id, user_id) on delete restrict not valid;
alter table public.deadlines add constraint deadlines_single_context_check
  check (num_nonnulls(application_id, program_id, scholarship_id, scholarship_application_id) <= 1) not valid;
alter table public.tasks add constraint tasks_single_context_check
  check (num_nonnulls(application_id, program_id, scholarship_id, scholarship_application_id, document_id, essay_prompt_id, recommendation_request_id) <= 1) not valid;
alter table public.document_requirements add constraint document_requirements_one_application_check
  check (num_nonnulls(application_id, scholarship_application_id) = 1) not valid;
alter table public.recommendation_requests add constraint recommendation_requests_one_application_check
  check (num_nonnulls(application_id, scholarship_application_id) = 1) not valid;

-- SECURITY INVOKER: ordinary owner RLS applies to every statement.
-- Parent locks serialize version allocation and current-version updates.
create function public.create_essay_revision(p_prompt_id uuid, p_content text, p_notes text default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid; v_number integer; v_owner uuid := auth.uid(); v_words integer;
begin
  if v_owner is null or p_content is null or char_length(p_content) not between 1 and 1000000 or char_length(btrim(p_content)) = 0
     or char_length(coalesce(p_notes, '')) > 10000 then raise exception 'Invalid revision' using errcode = '22023'; end if;
  perform 1 from public.essay_prompts where id = p_prompt_id and user_id = v_owner and archived_at is null for update;
  if not found then raise exception 'Unavailable writing record' using errcode = '42501'; end if;
  select coalesce(max(version_number), 0) + 1 into v_number from public.essay_versions where essay_prompt_id = p_prompt_id and user_id = v_owner;
  v_words := cardinality(regexp_split_to_array(btrim(p_content), '\s+'));
  insert into public.essay_versions(user_id, essay_prompt_id, version_number, content, word_count, character_count, notes)
    values(v_owner, p_prompt_id, v_number, p_content, v_words, char_length(p_content), p_notes) returning id into v_id;
  update public.essay_prompts set current_version_id = v_id, status = 'drafting', updated_at = now() where id = p_prompt_id and user_id = v_owner;
  insert into public.activity_events(user_id, entity_type, entity_id, action, summary)
    values(v_owner, 'essay_prompt', p_prompt_id, 'updated', 'Saved writing revision');
  return v_id;
end; $$;

create function public.create_document_revision(p_document_id uuid, p_file_name text, p_mime_type text, p_file_size bigint, p_storage_path text, p_sha256 text default null, p_notes text default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid; v_number integer; v_owner uuid := auth.uid();
begin
  if v_owner is null or p_file_size is null or p_file_name is null or p_mime_type is null or p_storage_path is null
    or char_length(coalesce(p_notes, '')) > 10000 or p_file_size not between 1 and 20971520 or char_length(p_file_name) not between 1 and 200
    or p_mime_type not in ('application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    or p_storage_path not like v_owner::text || '/' || p_document_id::text || '/%'
    or p_storage_path like '%..%' or char_length(p_storage_path) > 500
    or (p_sha256 is not null and p_sha256 !~ '^[a-f0-9]{64}$') then raise exception 'Invalid document revision' using errcode = '22023'; end if;
  perform 1 from public.documents where id = p_document_id and user_id = v_owner and archived_at is null for update;
  if not found then raise exception 'Unavailable document' using errcode = '42501'; end if;
  perform 1 from storage.objects where bucket_id = 'application-files' and name = p_storage_path;
  if not found then raise exception 'Unavailable file' using errcode = '42501'; end if;
  select coalesce(max(version_number), 0) + 1 into v_number from public.document_versions where document_id = p_document_id and user_id = v_owner;
  insert into public.document_versions(user_id, document_id, version_number, file_name, mime_type, file_size, storage_path, sha256_hash, notes)
    values(v_owner, p_document_id, v_number, p_file_name, p_mime_type, p_file_size, p_storage_path, p_sha256, p_notes) returning id into v_id;
  update public.documents set current_version_id = v_id, updated_at = now() where id = p_document_id and user_id = v_owner;
  insert into public.activity_events(user_id, entity_type, entity_id, action, summary)
    values(v_owner, 'document', p_document_id, 'updated', 'Saved document version');
  return v_id;
end; $$;
revoke all on function public.create_essay_revision(uuid,text,text) from public, anon;
revoke all on function public.create_document_revision(uuid,text,text,bigint,text,text,text) from public, anon;
grant execute on function public.create_essay_revision(uuid,text,text) to authenticated;
grant execute on function public.create_document_revision(uuid,text,text,bigint,text,text,text) to authenticated;

create function public.validate_writing_submission()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_revision public.essay_versions%rowtype;
begin
  if new.status in ('final','submitted') then
    select * into v_revision from public.essay_versions
      where id = new.current_version_id and essay_prompt_id = new.id and user_id = new.user_id;
    if not found or (new.word_limit is not null and v_revision.word_count > new.word_limit)
      or (new.character_limit is not null and v_revision.character_count > new.character_limit)
      then raise exception 'Save a revision within the submission limits first' using errcode = '23514'; end if;
  end if;
  return new;
end; $$;
create trigger essay_prompts_submission_limits before insert or update of status, current_version_id, word_limit, character_limit
  on public.essay_prompts for each row execute function public.validate_writing_submission();

create function public.validate_requirement_file()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.satisfied_by_version_id is not null then
    perform 1 from public.document_versions v join public.documents d on d.id = v.document_id and d.user_id = v.user_id
      where v.id = new.satisfied_by_version_id and v.user_id = new.user_id and d.archived_at is null
      and (new.document_type is null or new.document_type = 'other' or d.document_type = new.document_type) for share of d;
    if not found then raise exception 'Unavailable or mismatched file version' using errcode = '23514'; end if;
  end if;
  return new;
end; $$;
create trigger document_requirements_matching_file before insert or update of satisfied_by_version_id, document_type
  on public.document_requirements for each row execute function public.validate_requirement_file();
revoke all on function public.validate_writing_submission() from public, anon;
revoke all on function public.validate_requirement_file() from public, anon;
grant execute on function public.validate_writing_submission(), public.validate_requirement_file() to authenticated;
commit;
