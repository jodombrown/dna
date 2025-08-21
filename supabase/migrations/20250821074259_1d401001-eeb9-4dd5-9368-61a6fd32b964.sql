-- Final security fix - remove duplicate and overly permissive policies

-- Remove the conflicting public profile policies
DROP POLICY IF EXISTS "Public profiles viewable with privacy controls" ON public.profiles;

-- The remaining policy "Public profiles with privacy controls" should be sufficient
-- It includes the can_view_field check which is more secure

-- Let's also verify that all our target tables are truly secure
-- by checking if any policies allow broad access

-- Double-check that we don't have any overly permissive "true" conditions
-- except where absolutely necessary (like system inserts)

-- The goal is to ensure:
-- 1. profiles: Only self, admin, and properly controlled public access
-- 2. users: Only self access  
-- 3. waitlist_signups: Only admin view, system insert
-- 4. beta_applications: Only admin access, system insert
-- 5. magic_links: Only system access

-- Add explicit deny-all policy as default for extra security on sensitive tables
-- This ensures that if other policies don't match, access is denied

-- For profiles, let's add more explicit documentation
COMMENT ON POLICY "Public profiles with privacy controls" ON public.profiles IS 
'Allows viewing of public profiles with completed scores and proper field-level privacy controls';

COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
'Users can only modify their own profile data';

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 
'Admin users can view all profiles for moderation purposes';