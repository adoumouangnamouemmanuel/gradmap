-- ============================================================
-- Migration 00008: Normalize statuses and add CHECK constraints
-- Uses DO blocks to dynamically find and drop inline constraints
-- ============================================================

-- ─── APPLICATION STATUSES ────────────────────────────────────
UPDATE applications SET status = 'under_review' WHERE status = 'ready';
UPDATE applications SET status = 'preparing' WHERE status = 'shortlisted';

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'applications'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('researching','preparing','submitted','under_review','interview','waitlisted','admitted','rejected','withdrawn','deferred','enrolled'));

-- ─── PROGRAM STATUSES ────────────────────────────────────────
UPDATE programs SET status = 'withdrawn' WHERE status = 'archived';

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'programs'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE programs DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE programs ADD CONSTRAINT programs_status_check
  CHECK (status IN ('exploring','shortlisted','applying','applied','withdrawn','closed'));

-- ─── SCHOLARSHIP APPLICATION STATUSES ───────────────────────
UPDATE scholarship_applications SET status = 'nominated' WHERE status = 'nomination_pending';

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'scholarship_applications'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE scholarship_applications DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE scholarship_applications ADD CONSTRAINT scholarship_applications_status_check
  CHECK (status IN ('researching','eligible','preparing','nominated','submitted','interview','awarded','reserve','rejected','withdrawn'));

-- ─── ELIGIBILITY STATUSES ────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'scholarships'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE scholarships DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE scholarships ADD CONSTRAINT scholarships_eligibility_status_check
  CHECK (eligibility_status IN ('unknown','likely','eligible','ineligible','needs_verification'));

-- ─── FUNDING TYPES ───────────────────────────────────────────
UPDATE scholarships SET funding_type = 'tuition_waiver' WHERE funding_type = 'tuition';
UPDATE scholarships SET funding_type = 'other' WHERE funding_type = 'unknown';

ALTER TABLE scholarships ADD CONSTRAINT scholarships_funding_type_check
  CHECK (funding_type IN ('full','partial','stipend','tuition_waiver','loan','fellowship','government_sponsorship','work_study','other'));

-- ─── SCHOLARSHIP MECHANISMS ──────────────────────────────────
UPDATE scholarships SET application_mechanism = 'separate_application' WHERE application_mechanism = 'separate';
UPDATE scholarships SET application_mechanism = 'other' WHERE application_mechanism = 'unknown';

ALTER TABLE scholarships ADD CONSTRAINT scholarships_application_mechanism_check
  CHECK (application_mechanism IN ('automatic','separate_application','nomination','university_application','direct_application','other'));

-- ─── TASK STATUSES ───────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'tasks'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE tasks DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo','in_progress','done','cancelled'));

-- ─── DEADLINE TYPES ──────────────────────────────────────────
UPDATE deadlines SET deadline_type = 'other' WHERE deadline_type IN ('custom','priority','final');
UPDATE deadlines SET deadline_type = 'test_score' WHERE deadline_type = 'test';
UPDATE deadlines SET deadline_type = 'other' WHERE deadline_type NOT IN ('application','document','funding','test_score','visa','decision','enrollment','other');

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'deadlines'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE deadlines DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE deadlines ADD CONSTRAINT deadlines_deadline_type_check
  CHECK (deadline_type IN ('application','document','funding','test_score','visa','decision','enrollment','other'));

-- ─── EXPENSE STATUSES ────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'expenses'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE expenses DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE expenses ADD CONSTRAINT expenses_status_check
  CHECK (status IN ('planned','due','paid','waived','refunded'));

-- ─── EXPENSE CATEGORIES ──────────────────────────────────────
UPDATE expenses SET category = 'test_fee' WHERE category = 'test';

ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('application_fee','test_fee','translation','courier','visa','deposit','travel','accommodation','insurance','other'));

-- ─── RECOMMENDATION REQUEST STATUSES ────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'recommendation_requests'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE recommendation_requests DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE recommendation_requests ADD CONSTRAINT recommendation_requests_status_check
  CHECK (status IN ('pending','sent','accepted','submitted','declined'));

-- ─── ESSAY PROMPT STATUSES ──────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'essay_prompts'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE essay_prompts DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE essay_prompts ADD CONSTRAINT essay_prompts_status_check
  CHECK (status IN ('not_started','outlining','drafting','reviewing','final','submitted'));

-- ─── CONTACT INTERACTION TYPES ──────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'contact_interactions'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE contact_interactions DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE contact_interactions ADD CONSTRAINT contact_interactions_interaction_type_check
  CHECK (interaction_type IN ('email','phone','meeting','video_call','other'));

-- ─── DEGREE TYPES ────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'programs'::regclass AND contype = 'c' AND conname LIKE '%degree%' LOOP
    EXECUTE format('ALTER TABLE programs DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE programs ADD CONSTRAINT programs_degree_type_check
  CHECK (degree_type IS NULL OR degree_type IN ('BSc','BA','MSc','MEng','MA','MRes','MPA','MBA','LLM','MPhil','PhD','Other'));
