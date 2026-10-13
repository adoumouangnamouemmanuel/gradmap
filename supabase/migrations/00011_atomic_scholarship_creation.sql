begin;
alter table public.recommendation_requests alter column status set default 'pending';
alter table public.scholarships alter column funding_type set default 'other';
alter table public.scholarships alter column application_mechanism set default 'other';

-- Owner RLS applies. The scholarship, program links, and audit record commit together.
create function public.create_scholarship_entry(p_input jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_id uuid; v_program uuid; v_programs uuid[]; v_amount numeric(12,2);
begin
  if v_owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_input is null or jsonb_typeof(p_input) <> 'object'
    or char_length(btrim(coalesce(p_input->>'name', ''))) not between 1 and 200
    or char_length(coalesce(p_input->>'provider','')) > 200
    or char_length(coalesce(p_input->>'official_url','')) > 2000
    or (p_input->>'official_url' is not null and p_input->>'official_url' !~ '^https?://')
    or char_length(coalesce(p_input->>'coverage_notes','')) > 10000
    or char_length(coalesce(p_input->>'eligibility_notes','')) > 10000
    or char_length(coalesce(p_input->>'service_obligation_notes','')) > 10000
    or coalesce(p_input->>'funding_type','other') not in ('full','partial','stipend','tuition_waiver','loan','fellowship','government_sponsorship','work_study','other')
    or coalesce(p_input->>'application_mechanism','other') not in ('automatic','separate_application','nomination','university_application','direct_application','other')
    or coalesce(p_input->>'eligibility_status','unknown') not in ('unknown','likely','eligible','ineligible','needs_verification')
    or coalesce(p_input->>'currency_code','USD') !~ '^[A-Z]{3}$'
    or jsonb_typeof(coalesce(p_input->'program_ids','[]'::jsonb)) <> 'array'
    then raise exception 'Invalid scholarship' using errcode = '22023'; end if;
  if p_input->>'amount' is not null then
    if p_input->>'amount' !~ '^\d{1,10}(\.\d{1,2})?$' then raise exception 'Invalid amount' using errcode = '22023'; end if;
    v_amount := (p_input->>'amount')::numeric(12,2);
  end if;
  if jsonb_array_length(coalesce(p_input->'program_ids','[]'::jsonb)) > 100 then raise exception 'Too many links' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct value::uuid), array[]::uuid[]) into v_programs
    from jsonb_array_elements_text(coalesce(p_input->'program_ids','[]'::jsonb));
  foreach v_program in array v_programs loop
    perform 1 from public.programs p join public.institutions i on i.id = p.institution_id and i.user_id = p.user_id
      where p.id = v_program and p.user_id = v_owner and p.archived_at is null and i.archived_at is null for share of p, i;
    if not found then raise exception 'Unavailable program' using errcode = '42501'; end if;
  end loop;
  insert into public.scholarships(user_id,name,provider,official_url,funding_type,amount,currency_code,coverage_notes,application_mechanism,eligibility_status,eligibility_notes,service_obligation_notes)
    values(v_owner,btrim(p_input->>'name'),p_input->>'provider',p_input->>'official_url',coalesce(p_input->>'funding_type','other'),v_amount,coalesce(p_input->>'currency_code','USD'),p_input->>'coverage_notes',coalesce(p_input->>'application_mechanism','other'),coalesce(p_input->>'eligibility_status','unknown'),p_input->>'eligibility_notes',p_input->>'service_obligation_notes') returning id into v_id;
  insert into public.program_scholarships(user_id,program_id,scholarship_id,compatibility_status)
    select v_owner,program,v_id,'needs_verification' from unnest(v_programs) as program;
  insert into public.activity_events(user_id,entity_type,entity_id,action,summary)
    values(v_owner,'scholarship',v_id,'created','Created funding opportunity');
  return v_id;
end; $$;
revoke all on function public.create_scholarship_entry(jsonb) from public, anon;
grant execute on function public.create_scholarship_entry(jsonb) to authenticated;
commit;
