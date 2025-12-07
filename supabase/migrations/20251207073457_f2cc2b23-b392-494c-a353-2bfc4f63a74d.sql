-- Fix the profiles RLS policy to allow authenticated users to see public_profiles view
-- while still protecting sensitive fields

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "profiles_select_own_only" ON public.profiles;

-- Create a balanced policy: authenticated users can see all public profiles
-- The public_profiles view already filters out sensitive fields (email, phone, linkedin_url)
CREATE POLICY "profiles_select_authenticated" 
ON public.profiles 
FOR SELECT 
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND (
    -- Users can always see their own profile
    id = (SELECT auth.uid())
    -- Or profiles marked as public
    OR is_public = true
  )
);