-- FIX: Database linter warnings for RLS policy performance and duplicates
-- This addresses auth function re-evaluation and multiple permissive policies

BEGIN;

-- Drop all existing SELECT policies on profiles to consolidate them
DROP POLICY IF EXISTS "Secure profile access with privacy controls" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles for administration" ON public.profiles;
DROP POLICY IF EXISTS "profiles_unified_select_policy" ON public.profiles;

-- Create single optimized profile SELECT policy with proper auth function wrapping
CREATE POLICY "profiles_optimized_select_policy" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile (optimized auth call)
  ((SELECT auth.uid()) = id) 
  OR 
  -- Public profiles with proper privacy filtering
  (
    COALESCE(is_public, false) = true 
    AND COALESCE(profile_completeness_score, 0) >= 50
    AND public.can_view_field(visibility, 'profile', (SELECT auth.uid()), id)
  )
  OR
  -- Admins can view all profiles for administration (optimized auth call)
  public.is_admin_user((SELECT auth.uid()))
);

-- Drop duplicate policies on user_dna_points
DROP POLICY IF EXISTS "Users can view DNA points" ON public.user_dna_points;
DROP POLICY IF EXISTS "Users can view their own DNA points and admins can view all" ON public.user_dna_points;

-- Create single optimized user_dna_points SELECT policy
CREATE POLICY "user_dna_points_optimized_select_policy" 
ON public.user_dna_points 
FOR SELECT 
USING (
  ((SELECT auth.uid()) = user_id) 
  OR 
  public.is_admin_user((SELECT auth.uid()))
);

-- Drop duplicate policies on user_adin_profile
DROP POLICY IF EXISTS "ADIN profiles read access" ON public.user_adin_profile;
DROP POLICY IF EXISTS "Users can view their own ADIN profile and connected users" ON public.user_adin_profile;

-- Create single optimized user_adin_profile SELECT policy
CREATE POLICY "user_adin_profile_optimized_select_policy" 
ON public.user_adin_profile 
FOR SELECT 
USING (
  ((SELECT auth.uid()) = user_id)
  OR 
  (
    -- Only allow access to ADIN profiles of users they're connected to
    EXISTS (
      SELECT 1 FROM public.connections c 
      WHERE c.status = 'accepted' 
      AND ((c.a = (SELECT auth.uid()) AND c.b = user_id) OR (c.a = user_id AND c.b = (SELECT auth.uid())))
    )
  )
  OR
  public.is_admin_user((SELECT auth.uid()))
);

COMMIT;