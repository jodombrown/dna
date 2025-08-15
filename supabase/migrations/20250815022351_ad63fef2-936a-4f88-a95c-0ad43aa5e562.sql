-- Fix multiple permissive policies on profiles table
-- Consolidate "Profiles privacy policy" and "profiles_select_owner" into single policy

-- First, drop the existing duplicate policies
DROP POLICY IF EXISTS "Profiles privacy policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;

-- Create a single consolidated policy that handles both owner access and privacy controls
CREATE POLICY "profiles_unified_select_policy" ON public.profiles
FOR SELECT USING (
  -- Users can always see their own profile
  (auth.uid() = id) 
  OR 
  -- For other profiles, check if they are public and meet privacy settings
  (
    COALESCE(is_public, false) = true 
    AND COALESCE(profile_completeness_score, 0) >= 50
    AND public.can_view_field(visibility, 'profile', auth.uid(), id)
  )
  OR
  -- Admins can see all profiles
  public.is_admin_user(auth.uid())
);