-- Fix RLS performance issue in profiles_unified_select_policy
-- Optimize auth.uid() calls to be evaluated once per query instead of per row

DROP POLICY IF EXISTS "profiles_unified_select_policy" ON public.profiles;

-- Create optimized policy with proper subquery wrapping for auth functions
CREATE POLICY "profiles_unified_select_policy" ON public.profiles
FOR SELECT USING (
  -- Users can always see their own profile (optimize auth.uid() with subquery)
  ((SELECT auth.uid()) = id) 
  OR 
  -- For other profiles, check if they are public and meet completeness requirements
  (
    COALESCE(is_public, false) = true 
    AND COALESCE(profile_completeness_score, 0) >= 50
  )
  OR
  -- Admins can see all profiles (optimize auth.uid() with subquery)
  public.is_admin_user((SELECT auth.uid()))
);