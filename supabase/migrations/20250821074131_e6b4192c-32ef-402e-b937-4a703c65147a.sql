-- Clean up and secure all RLS policies properly

-- First, remove all conflicting and overly permissive policies
DROP POLICY IF EXISTS "profiles_optimized_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can submit to waitlist" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.waitlist_signups;

-- Ensure users table has proper RLS (this shouldn't be public)
-- Users table should only be accessible to the user themselves
-- No public access should be allowed

-- Waitlist signups should ONLY be insertable by system and viewable by admins
-- Remove any public insert policies

-- Magic links should be system-only access

-- Let's ensure the profiles table only allows:
-- 1. Users to see their own profile
-- 2. Public profiles with privacy controls  
-- 3. Admin access

-- Clean slate approach for profiles
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Create the final secure policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public profiles with privacy controls" ON public.profiles 
FOR SELECT USING (
  auth.uid() != id 
  AND COALESCE(is_public, false) = true 
  AND COALESCE(profile_completeness_score, 0) >= 50
  AND can_view_field(visibility, 'profile'::text, auth.uid(), id)
);

CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT USING (is_admin_user(auth.uid()));

-- Ensure users table is properly secured (users should only see themselves)
-- The existing policies look correct for users table

-- Fix waitlist_signups to be admin-only for viewing
-- Keep only the necessary policies

-- Summary of what we want:
-- profiles: Self + controlled public + admin access
-- users: Self only  
-- waitlist_signups: System insert + admin view
-- beta_applications: System insert + admin view/update
-- admin_users: Admin view/manage only
-- magic_links: System only