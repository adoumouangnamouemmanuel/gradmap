begin;
-- Match the editor’s ECMAScript whitespace rules without changing the saved text.
create or replace function public.create_essay_revision(p_prompt_id uuid, p_content text, p_notes text default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid; v_number integer; v_owner uuid := auth.uid(); v_words integer; v_normalized text;
  v_whitespace constant text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
begin
  if v_owner is null or p_content is null or char_length(p_content) not between 1 and 1000000
     or char_length(coalesce(p_notes, '')) > 10000 then raise exception 'Invalid revision' using errcode = '22023'; end if;
  v_normalized := btrim(translate(p_content, v_whitespace, repeat(' ', char_length(v_whitespace))));
  if char_length(v_normalized) = 0 then raise exception 'Invalid revision' using errcode = '22023'; end if;
  perform 1 from public.essay_prompts where id = p_prompt_id and user_id = v_owner and archived_at is null for update;
  if not found then raise exception 'Unavailable writing record' using errcode = '42501'; end if;
  select coalesce(max(version_number), 0) + 1 into v_number from public.essay_versions where essay_prompt_id = p_prompt_id and user_id = v_owner;
  v_words := cardinality(regexp_split_to_array(v_normalized, ' +'));
  insert into public.essay_versions(user_id, essay_prompt_id, version_number, content, word_count, character_count, notes)
    values(v_owner, p_prompt_id, v_number, p_content, v_words, char_length(p_content), p_notes) returning id into v_id;
  update public.essay_prompts set current_version_id = v_id, status = 'drafting', updated_at = now() where id = p_prompt_id and user_id = v_owner;
  insert into public.activity_events(user_id, entity_type, entity_id, action, summary)
    values(v_owner, 'essay_prompt', p_prompt_id, 'updated', 'Saved writing revision');
  return v_id;
end; $$;
revoke all on function public.create_essay_revision(uuid,text,text) from public,anon;
grant execute on function public.create_essay_revision(uuid,text,text) to authenticated;
commit;
