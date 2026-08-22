-- RLS Test Helpers for GradMap
-- These SQL snippets verify RLS policies work correctly.
-- Run against a local Supabase instance after migrations.

-- ============================================================
-- TEST SETUP: Create two test users
-- ============================================================

-- User A (owner)
-- Insert into auth.users with:
--   id: '00000000-0000-0000-0000-000000000001'
--   email: 'user-a@test.com'

-- User B (other user)
-- Insert into auth.users with:
--   id: '00000000-0000-0000-0000-000000000002'
--   email: 'user-b@test.com'

-- ============================================================
-- TEST 1: Anonymous cannot read profiles
-- ============================================================
-- SET ROLE anon;
-- SELECT * FROM public.profiles;
-- Expected: empty result set (RLS denies)
-- RESET ROLE;

-- ============================================================
-- TEST 2: Owner can read their own profile
-- ============================================================
-- SET ROLE authenticated;
-- -- Set JWT claims for user A
-- SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}');
-- SELECT * FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1 row (user A's profile)
-- RESET ROLE;

-- ============================================================
-- TEST 3: Owner cannot read other user's profile
-- ============================================================
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}');
-- SELECT * FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000002';
-- Expected: empty result set
-- RESET ROLE;

-- ============================================================
-- TEST 4: Owner can update their own profile
-- ============================================================
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}');
-- UPDATE public.profiles SET full_name = 'Test User A' WHERE id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1 row updated
-- RESET ROLE;

-- ============================================================
-- TEST 5: Owner cannot update other user's profile
-- ============================================================
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}');
-- UPDATE public.profiles SET full_name = 'Hacked' WHERE id = '00000000-0000-0000-0000-000000000002';
-- Expected: 0 rows updated (RLS denies)
-- RESET ROLE;

-- ============================================================
-- TEST 6: Anonymous cannot read notification preferences
-- ============================================================
-- SET ROLE anon;
-- SELECT * FROM public.notification_preferences;
-- Expected: empty result set
-- RESET ROLE;

-- ============================================================
-- TEST 7: Owner can manage their notification preferences
-- ============================================================
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}');
-- SELECT * FROM public.notification_preferences WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1 row
-- UPDATE public.notification_preferences SET push_enabled = true WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1 row updated
-- RESET ROLE;
