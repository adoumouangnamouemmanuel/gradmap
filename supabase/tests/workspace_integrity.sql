-- Run after migrations in an isolated test database. All fixture data rolls back.
begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002');
insert into public.institutions(id,user_id,name) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Owner school'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Other school');
insert into public.programs(id,user_id,institution_id,name) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Owner program'),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Other program');
insert into public.applications(id,user_id,program_id) values
 ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001'),
 ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002');
insert into public.essay_prompts(id,user_id,title,application_id) values
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Owner essay','40000000-0000-4000-8000-000000000001'),
 ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Other essay','40000000-0000-4000-8000-000000000002');
insert into public.documents(id,user_id,name,document_type) values ('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Transcript','transcript');
insert into storage.objects(bucket_id,name) values ('application-files','10000000-0000-4000-8000-000000000001/60000000-0000-4000-8000-000000000001/test.pdf');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
do $$
declare v_id uuid; v_other uuid; v_page jsonb;
begin
  v_id := public.create_scholarship_entry('{"name":"Independent award","amount":"10000.01"}'::jsonb);
  if (select amount from public.scholarships where id=v_id) <> 10000.01 then raise exception 'Funding amount lost precision'; end if;
  v_other := public.create_scholarship_entry('{"name":"Linked award","program_ids":["30000000-0000-4000-8000-000000000001"]}'::jsonb);
  if (select count(*) from public.program_scholarships where scholarship_id=v_other) <> 1 then raise exception 'Program link missing'; end if;
  begin
    perform public.create_scholarship_entry('{"name":"Rejected award","program_ids":["30000000-0000-4000-8000-000000000002"]}'::jsonb);
    raise exception 'Foreign program scholarship allowed';
  exception when insufficient_privilege then null; end;
  if exists(select 1 from public.scholarships where name='Rejected award') then raise exception 'Partial scholarship retained'; end if;
  insert into public.recommenders(id,user_id,name) values('70000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Supervisor');
  insert into public.recommendation_requests(user_id,recommender_id,application_id)
    values('10000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001');
  if (select status from public.recommendation_requests where recommender_id='70000000-0000-4000-8000-000000000001') <> 'pending' then raise exception 'Invalid request default'; end if;
  insert into public.essay_prompts(user_id,title,application_id)
    select '10000000-0000-4000-8000-000000000001','Page test '||lpad(number::text,3,'0'),'40000000-0000-4000-8000-000000000001' from generate_series(1,30) as number;
  v_page := public.get_preparation_page('essays','primary','Page test',null,1);
  if jsonb_array_length(v_page->'items') <> 24 or (v_page->>'total')::integer <> 30 then raise exception 'Preparation page is unbounded or incomplete'; end if;
  v_page := public.get_preparation_page('essays','primary','Page test',null,2);
  if jsonb_array_length(v_page->'items') <> 6 then raise exception 'Second preparation page incorrect'; end if;
  v_page := public.get_preparation_page('essays','primary','Page test',null,9999);
  if (v_page->>'page')::integer <> 2 then raise exception 'Out-of-range page not clamped'; end if;
  v_page := public.get_preparation_page('essays','primary','Page test','40000000-0000-4000-8000-000000000002',1);
  if (v_page->>'total')::integer <> 0 then raise exception 'Foreign preparation context returned data'; end if;
  v_page := public.get_preparation_page('essays','primary','%',null,1);
  if (v_page->>'total')::integer <> 0 then raise exception 'Search wildcard changed query semantics'; end if;
  v_page := public.get_application_page('', 'all', 1);
  if (v_page->>'total')::integer <> 1 or jsonb_array_length(v_page->'items') <> 1 then raise exception 'Application ownership pagination failed'; end if;
  if v_page->'items'->0 ? 'notes' then raise exception 'Private application notes exposed in list metadata'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Profile owner read failed'; end if;
  update public.profiles set preferred_countries = array['Ghana','Canada'], funding_preference = 'required'
    where id = '10000000-0000-4000-8000-000000000001';
  update public.profiles set full_name = 'Cross owner mutation' where id = '10000000-0000-4000-8000-000000000002';
  if found then raise exception 'Cross owner profile update allowed'; end if;
  begin
    insert into public.tasks(user_id,title,application_id) values ('10000000-0000-4000-8000-000000000001','Bad parent','40000000-0000-4000-8000-000000000002');
    raise exception 'Cross owner task parent allowed';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.deadlines(user_id,title,due_at,application_id) values ('10000000-0000-4000-8000-000000000001','Bad parent',now(),'40000000-0000-4000-8000-000000000002');
    raise exception 'Cross owner deadline parent allowed';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.tasks(user_id,title,application_id,program_id) values ('10000000-0000-4000-8000-000000000001','Conflicting parents','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001');
    raise exception 'Conflicting context allowed';
  exception when check_violation then null; end;
  begin
    insert into public.document_requirements(user_id,requirement_name) values ('10000000-0000-4000-8000-000000000001','Orphan requirement');
    raise exception 'Orphan requirement allowed';
  exception when check_violation then null; end;
  begin
    perform public.create_essay_revision('50000000-0000-4000-8000-000000000002','Cross owner content',null);
    raise exception 'Cross owner revision allowed';
  exception when insufficient_privilege then null; end;
  v_id := public.create_essay_revision('50000000-0000-4000-8000-000000000001','First draft',null);
  v_other := public.create_essay_revision('50000000-0000-4000-8000-000000000001','Second draft',null);
  if (select count(*) from public.essay_versions where essay_prompt_id='50000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Revision history lost'; end if;
  if (select current_version_id from public.essay_prompts where id='50000000-0000-4000-8000-000000000001') <> v_other then raise exception 'Current revision pointer incorrect'; end if;
  v_other := public.create_essay_revision('50000000-0000-4000-8000-000000000001',U&'\0009One\00A0two\2003three\000A',null);
  if (select word_count from public.essay_versions where id=v_other) <> 3 then raise exception 'Unicode whitespace word count differs from the editor'; end if;
  if (select content from public.essay_versions where id=v_other) <> U&'\0009One\00A0two\2003three\000A' then raise exception 'Saved writing was normalized destructively'; end if;
  begin
    perform public.create_essay_revision('50000000-0000-4000-8000-000000000001',U&'\000A\0009\00A0',null);
    raise exception 'Whitespace-only revision allowed';
  exception when invalid_parameter_value then null; end;
  begin
    update public.essay_prompts set word_limit=1,status='final' where id='50000000-0000-4000-8000-000000000001';
    raise exception 'Over-limit final revision allowed';
  exception when check_violation then null; end;
  v_id := public.create_document_revision('60000000-0000-4000-8000-000000000001','test.pdf','application/pdf',10,'10000000-0000-4000-8000-000000000001/60000000-0000-4000-8000-000000000001/test.pdf');
  if (select current_version_id from public.documents where id='60000000-0000-4000-8000-000000000001') <> v_id then raise exception 'Current document pointer incorrect'; end if;
  insert into public.document_requirements(user_id,requirement_name,application_id,document_type,satisfied_by_version_id)
    values('10000000-0000-4000-8000-000000000001','Transcript','40000000-0000-4000-8000-000000000001','transcript',v_id);
  begin
    insert into public.document_requirements(user_id,requirement_name,application_id,document_type,satisfied_by_version_id)
      values('10000000-0000-4000-8000-000000000001','CV','40000000-0000-4000-8000-000000000001','cv',v_id);
    raise exception 'Mismatched requirement file allowed';
  exception when check_violation then null; end;
  begin
    perform public.create_document_revision('60000000-0000-4000-8000-000000000001','bad.pdf','application/pdf',10,'10000000-0000-4000-8000-000000000002/60000000-0000-4000-8000-000000000001/test.pdf');
    raise exception 'Foreign storage path allowed';
  exception when invalid_parameter_value then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  if has_function_privilege(current_user,'public.create_essay_revision(uuid,text,text)','execute') then raise exception 'Anonymous revision execute allowed'; end if;
  if has_function_privilege(current_user,'public.get_preparation_page(text,text,text,uuid,integer)','execute') then raise exception 'Anonymous preparation read allowed'; end if;
  if has_function_privilege(current_user,'public.get_application_page(text,text,integer)','execute') then raise exception 'Anonymous application read allowed'; end if;
end $$;
reset role;
rollback;
select 'Workspace database assertions passed' as result;
