-- Fix profile RLS policies and ensure seamless user experience

-- Drop the duplicate/old profile SELECT policy
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Ensure users can always see their own profile even during onboarding
DROP POLICY IF EXISTS "Users can view own profile during onboarding" ON public.profiles;
CREATE POLICY "Users can view own profile during onboarding"
ON public.profiles
FOR SELECT
USING (id = (SELECT auth.uid()));

-- Verify insert policy allows profile trigger to work
-- The existing "Users can insert own profile" should work but let's be explicit
DROP POLICY IF EXISTS "System can create profiles for new users" ON public.profiles;
CREATE POLICY "System can create profiles for new users"
ON public.profiles
FOR INSERT
WITH CHECK (true);  -- Allow trigger to create profiles

-- Add helpful function to check if user has completed profile
CREATE OR REPLACE FUNCTION public.user_has_profile(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND full_name IS NOT NULL
  );
$$;

-- Create a helper view for debugging auth issues
CREATE OR REPLACE VIEW public.user_auth_status AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.username,
  p.onboarding_completed_at IS NOT NULL as onboarding_complete,
  p.created_at as profile_created_at,
  (SELECT COUNT(*) FROM posts WHERE author_id = p.id) as post_count
FROM profiles p;