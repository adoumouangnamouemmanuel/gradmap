SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'deadlines'::regclass AND contype = 'c';
