-- ============================================================
-- FIX: Profiles table RLS policies (CORRECT VERSION)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- The previous version had a circular RLS recursion bug:
-- the admin-check subquery queried 'profiles' from inside
-- a 'profiles' policy, which Postgres can't resolve safely.
-- This version uses a SECURITY DEFINER function to break
-- the recursion.
-- ============================================================

-- STEP 1: Check existing policies (run this first to see names)
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- ============================================================
-- STEP 2: Create a helper function that bypasses RLS
-- (SECURITY DEFINER runs as the function owner, not the caller)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- STEP 3: Drop ALL existing SELECT policies on profiles
-- (adjust names if yours are different — check with the SELECT above)
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_students" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;

-- ============================================================
-- STEP 4: Create the correct policies
-- ============================================================

-- Policy A: Every authenticated user sees their OWN profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy B: Every authenticated user can see all STUDENT profiles
-- (for the public Students Directory page)
CREATE POLICY "profiles_select_students"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'student');

-- Policy C: Admin users can see ALL profiles
-- Uses the SECURITY DEFINER function to avoid circular recursion
CREATE POLICY "profiles_select_admin_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Result:
-- • Regular users → see their own row + all student rows
-- • Admins        → see ALL rows (own + students + other admins)
-- • Policies are OR'd, so any matching policy grants access
-- ============================================================
