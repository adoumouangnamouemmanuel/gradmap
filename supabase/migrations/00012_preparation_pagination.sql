begin;
create index if not exists deadlines_owner_due_active_idx on public.deadlines(user_id,due_at,id) where archived_at is null;
create index if not exists tasks_owner_due_active_idx on public.tasks(user_id,due_at,id) where archived_at is null;
create index if not exists document_requirements_owner_application_idx on public.document_requirements(user_id,application_id,created_at,id);
create index if not exists recommendation_requests_owner_application_idx on public.recommendation_requests(user_id,application_id,due_at,id);

-- Return one owner-filtered page of safe preparation metadata, never file paths or draft text.
create function public.get_preparation_page(p_kind text, p_tab text default 'primary', p_query text default '', p_application_id uuid default null, p_page integer default 1)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_result jsonb;
begin
  if v_owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_kind is null or p_kind not in ('documents','essays','recommendations') or p_tab is null or p_tab not in ('primary','secondary')
    or p_page is null or p_page not between 1 and 10000 or char_length(coalesce(p_query,'')) > 120 then raise exception 'Invalid preparation view' using errcode = '22023'; end if;
  with records as (
    select d.id,'document'::text as kind,d.name as title,replace(d.document_type,'_',' ') as subtitle,
      case when d.current_version_id is null then 'Awaiting file' else 'Uploaded' end as status,null::uuid as application_id,
      '/documents/'||d.id as href,d.document_type,null::uuid as satisfied_by,null::uuid as person_id
      from public.documents d where p_kind='documents' and p_tab='primary' and d.user_id=v_owner and d.archived_at is null
      and (p_application_id is null or exists(select 1 from public.document_requirements r join public.document_versions v on v.id=r.satisfied_by_version_id and v.user_id=r.user_id where r.user_id=v_owner and r.application_id=p_application_id and v.document_id=d.id))
    union all
    select r.id,'requirement',r.requirement_name,case when r.scholarship_application_id is null then 'Application requirement' else 'Scholarship application' end,
      case when r.satisfied_by_version_id is null then 'Missing' else 'Ready' end,r.application_id,
      case when r.application_id is not null then '/applications/'||r.application_id||'#documents' else null end,r.document_type,r.satisfied_by_version_id,null
      from public.document_requirements r where p_kind='documents' and p_tab='secondary' and r.user_id=v_owner and (p_application_id is null or r.application_id=p_application_id)
    union all
    select e.id,'essay',e.title,case when e.word_limit is null then 'No word limit set' else e.word_limit||' word limit' end,
      replace(e.status,'_',' '),e.application_id,'/essays/'||e.id,null,null,null
      from public.essay_prompts e where p_kind='essays' and e.user_id=v_owner and e.archived_at is null and (p_application_id is null or e.application_id=p_application_id)
    union all
    select r.id,'recommender',r.name,coalesce(r.institution,r.relationship,'Recommender'),'Contact',null,'/recommenders/'||r.id,null,null,null
      from public.recommenders r where p_kind='recommendations' and p_tab='primary' and r.user_id=v_owner and r.archived_at is null
      and (p_application_id is null or exists(select 1 from public.recommendation_requests q where q.user_id=v_owner and q.recommender_id=r.id and q.application_id=p_application_id))
    union all
    select q.id,'recommendation',coalesce(r.name,'Recommendation request'),
      case when q.due_at is null then 'Delivery date not set' else 'Delivery due '||to_char(q.due_at at time zone 'UTC','YYYY-MM-DD')||' (UTC)' end,
      q.status,q.application_id,'/recommenders/'||q.recommender_id,null,null,q.recommender_id
      from public.recommendation_requests q left join public.recommenders r on r.id=q.recommender_id and r.user_id=q.user_id
      where p_kind='recommendations' and p_tab='secondary' and q.user_id=v_owner and (p_application_id is null or q.application_id=p_application_id)
  ), filtered as materialized (
    select * from records where position(lower(btrim(coalesce(p_query,''))) in lower(title||' '||coalesce(subtitle,'')||' '||status))>0
  ), bounds as (
    select count(*) as total,least(p_page,greatest(1,ceil(count(*)/24.0)::integer)) as page from filtered
  ), selected as (
    select * from filtered order by lower(title),id limit 24 offset (select (page-1)*24 from bounds)
  ), library as (
    select id,name,document_type,current_version_id from public.documents where p_kind='documents' and p_tab='secondary' and user_id=v_owner and archived_at is null order by name,id limit 500
  ), versions as (
    select v.id,v.document_id,v.file_name,v.version_number from public.document_versions v
      where v.user_id=v_owner and (v.id in (select current_version_id from library) or v.id in (select satisfied_by from selected))
  )
  select jsonb_build_object(
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'title',title,'subtitle',subtitle,'status',status,'applicationId',application_id,'href',href,'documentType',document_type,'satisfiedBy',satisfied_by,'personId',person_id) order by lower(title),id) from selected),'[]'::jsonb),
    'versions',coalesce((select jsonb_agg(to_jsonb(versions)) from versions),'[]'::jsonb),
    'documentChoices',coalesce((select jsonb_agg(jsonb_build_object('id',id,'documentType',document_type)) from library),'[]'::jsonb),
    'page',bounds.page,'pageSize',24,'total',bounds.total,
    'truncated',p_kind='documents' and p_tab='secondary' and (select count(*) from public.documents where user_id=v_owner and archived_at is null)>500
  ) into v_result from bounds;
  return v_result;
end; $$;
revoke all on function public.get_preparation_page(text,text,text,uuid,integer) from public,anon;
grant execute on function public.get_preparation_page(text,text,text,uuid,integer) to authenticated;

create function public.get_application_page(p_query text default '', p_status text default 'all', p_page integer default 1)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_result jsonb;
begin
  if v_owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_page is null or p_page not between 1 and 10000 or char_length(coalesce(p_query,''))>120 or char_length(coalesce(p_status,''))>60 then raise exception 'Invalid application view' using errcode = '22023'; end if;
  with records as materialized (
    select a.id,a.status,coalesce(a.priority,3) as priority,p.name as program_name,i.name as institution_name,i.country_name
      from public.applications a join public.programs p on p.id=a.program_id and p.user_id=a.user_id
      join public.institutions i on i.id=p.institution_id and i.user_id=p.user_id
      where a.user_id=v_owner and a.archived_at is null
  ), filtered as materialized (
    select * from records where (coalesce(p_status,'all')='all' or status=p_status)
      and position(lower(btrim(coalesce(p_query,''))) in lower(program_name||' '||institution_name||' '||coalesce(country_name,'')))>0
  ), bounds as (
    select count(*) as total,least(p_page,greatest(1,ceil(count(*)/24.0)::integer)) as page from filtered
  ), selected as (
    select * from filtered order by lower(institution_name),lower(program_name),id limit 24 offset (select (page-1)*24 from bounds)
  )
  select jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'status',status,'priority',priority,'programs',jsonb_build_object('name',program_name,'institutions',jsonb_build_object('name',institution_name,'country_name',country_name))) order by lower(institution_name),lower(program_name),id) from selected),'[]'::jsonb),
    'page',bounds.page,'pageSize',24,'total',bounds.total,'stages',coalesce((select jsonb_agg(status order by status) from (select distinct status from records) as stages),'[]'::jsonb)) into v_result from bounds;
  return v_result;
end; $$;
revoke all on function public.get_application_page(text,text,integer) from public,anon;
grant execute on function public.get_application_page(text,text,integer) to authenticated;
commit;
