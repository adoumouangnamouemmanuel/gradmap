-- Expand scholarships_funding_type_check to include additional funding types
-- that are defined in the app constants but were missing from the original constraint.

ALTER TABLE scholarships
  DROP CONSTRAINT IF EXISTS scholarships_funding_type_check;

ALTER TABLE scholarships
  ADD CONSTRAINT scholarships_funding_type_check
    CHECK (funding_type IN ('full', 'partial', 'stipend', 'tuition', 'loan', 'fellowship', 'government_sponsorship', 'other', 'unknown'));
