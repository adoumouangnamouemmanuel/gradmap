-- Disposable test database only. The enclosing harness discards this instance.
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000003');
insert into public.essay_prompts(id,user_id,title) values ('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Concurrency fixture');
