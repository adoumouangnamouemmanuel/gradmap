do $$
begin
  if (select count(*) from public.essay_versions where essay_prompt_id='50000000-0000-4000-8000-000000000003') <> 2 then raise exception 'Concurrent revisions were lost'; end if;
  if (select array_agg(version_number order by version_number) from public.essay_versions where essay_prompt_id='50000000-0000-4000-8000-000000000003') <> array[1,2]::smallint[] then raise exception 'Concurrent version allocation failed'; end if;
  if (select v.version_number from public.essay_prompts p join public.essay_versions v on v.id=p.current_version_id where p.id='50000000-0000-4000-8000-000000000003') <> 2 then raise exception 'Concurrent current-version pointer incorrect'; end if;
end $$;
select 'Concurrent writing revision assertions passed' as result;
