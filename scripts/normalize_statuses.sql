-- ============================================================
-- Run this in Supabase SQL Editor directly (not via migration)
-- Normalizes all status/type columns and adds CHECK constraints
-- ============================================================

-- ─── APPLICATION STATUSES ────────────────────────────────────
UPDATE applications SET status = 'under_review' WHERE status = 'ready';
UPDATE applications SET status = 'preparing' WHERE status = 'shortlisted';

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('researching','preparing','submitted','under_review','interview','waitlisted','admitted','rejected','withdrawn','deferred','enrolled'));

-- ─── PROGRAM STATUSES ────────────────────────────────────────
UPDATE programs SET status = 'withdrawn' WHERE status = 'archived';

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_status_check;
ALTER TABLE programs ADD CONSTRAINT programs_status_check
  CHECK (status IN ('exploring','shortlisted','applying','applied','withdrawn','closed'));

-- ─── SCHOLARSHIP APPLICATION STATUSES ───────────────────────
UPDATE scholarship_applications SET status = 'nominated' WHERE status = 'nomination_pending';

ALTER TABLE scholarship_applications DROP CONSTRAINT IF EXISTS scholarship_applications_status_check;
ALTER TABLE scholarship_applications ADD CONSTRAINT scholarship_applications_status_check
  CHECK (status IN ('researching','eligible','preparing','nominated','submitted','interview','awarded','reserve','rejected','withdrawn'));

-- ─── ELIGIBILITY STATUSES ────────────────────────────────────
ALTER TABLE scholarships DROP CONSTRAINT IF EXISTS scholarships_eligibility_status_check;
ALTER TABLE scholarships ADD CONSTRAINT scholarships_eligibility_status_check
  CHECK (eligibility_status IN ('unknown','likely','eligible','ineligible','needs_verification'));

-- ─── FUNDING TYPES ───────────────────────────────────────────
UPDATE scholarships SET funding_type = 'tuition_waiver' WHERE funding_type = 'tuition';
UPDATE scholarships SET funding_type = 'other' WHERE funding_type = 'unknown';

ALTER TABLE scholarships DROP CONSTRAINT IF EXISTS scholarships_funding_type_check;
ALTER TABLE scholarships ADD CONSTRAINT scholarships_funding_type_check
  CHECK (funding_type IN ('full','partial','stipend','tuition_waiver','loan','fellowship','government_sponsorship','work_study','other'));

-- ─── SCHOLARSHIP MECHANISMS ──────────────────────────────────
UPDATE scholarships SET application_mechanism = 'separate_application' WHERE application_mechanism = 'separate';
UPDATE scholarships SET application_mechanism = 'other' WHERE application_mechanism = 'unknown';

ALTER TABLE scholarships DROP CONSTRAINT IF EXISTS scholarships_application_mechanism_check;
ALTER TABLE scholarships ADD CONSTRAINT scholarships_application_mechanism_check
  CHECK (application_mechanism IN ('automatic','separate_application','nomination','university_application','direct_application','other'));

-- ─── TASK STATUSES ───────────────────────────────────────────
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo','in_progress','done','cancelled'));

-- ─── DEADLINE TYPES ──────────────────────────────────────────
UPDATE deadlines SET deadline_type = 'other'
  WHERE deadline_type IN ('custom','priority','final');

UPDATE deadlines SET deadline_type = 'test_score'
  WHERE deadline_type = 'test';

UPDATE deadlines SET deadline_type = 'other'
  WHERE deadline_type NOT IN ('application','document','funding','test_score','visa','decision','enrollment','other');

ALTER TABLE deadlines DROP CONSTRAINT IF EXISTS deadlines_deadline_type_check;
ALTER TABLE deadlines ADD CONSTRAINT deadlines_deadline_type_check
  CHECK (deadline_type IN ('application','document','funding','test_score','visa','decision','enrollment','other'));

-- ─── EXPENSE STATUSES ────────────────────────────────────────
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_status_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_status_check
  CHECK (status IN ('planned','due','paid','waived','refunded'));

-- ─── EXPENSE CATEGORIES ──────────────────────────────────────
UPDATE expenses SET category = 'test_fee' WHERE category = 'test';

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('application_fee','test_fee','translation','courier','visa','deposit','travel','accommodation','insurance','other'));

-- ─── RECOMMENDATION REQUEST STATUSES ────────────────────────
ALTER TABLE recommendation_requests DROP CONSTRAINT IF EXISTS recommendation_requests_status_check;
ALTER TABLE recommendation_requests ADD CONSTRAINT recommendation_requests_status_check
  CHECK (status IN ('pending','sent','accepted','submitted','declined'));

-- ─── ESSAY PROMPT STATUSES ──────────────────────────────────
ALTER TABLE essay_prompts DROP CONSTRAINT IF EXISTS essay_prompts_status_check;
ALTER TABLE essay_prompts ADD CONSTRAINT essay_prompts_status_check
  CHECK (status IN ('not_started','outlining','drafting','reviewing','final','submitted'));

-- ─── CONTACT INTERACTION TYPES ──────────────────────────────
ALTER TABLE contact_interactions DROP CONSTRAINT IF EXISTS contact_interactions_interaction_type_check;
ALTER TABLE contact_interactions ADD CONSTRAINT contact_interactions_interaction_type_check
  CHECK (interaction_type IN ('email','phone','meeting','video_call','other'));

-- ─── DEGREE TYPES ────────────────────────────────────────────
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_degree_type_check;
ALTER TABLE programs ADD CONSTRAINT programs_degree_type_check
  CHECK (degree_type IS NULL OR degree_type IN ('BSc','BA','MSc','MEng','MA','MRes','MPA','MBA','LLM','MPhil','PhD','Other'));
