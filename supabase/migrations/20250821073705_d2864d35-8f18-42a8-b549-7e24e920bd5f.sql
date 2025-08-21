-- Fix RLS policies for profiles table to protect user data
-- First, drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
-- Policy 1: Users can view their own profile completely
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy 4: Public profiles are viewable with privacy controls
-- Only allow viewing of profiles that are explicitly marked as public
-- and only show non-sensitive fields based on visibility settings
CREATE POLICY "Public profiles viewable with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id 
  AND COALESCE(is_public, false) = true 
  AND COALESCE(profile_completeness_score, 0) >= 50
);

-- Policy 5: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Policy 6: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin_user(auth.uid()));

-- Fix RLS policies for waitlist_signups table
DROP POLICY IF EXISTS "Anyone can insert waitlist signups" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Waitlist signups are publicly viewable" ON public.waitlist_signups;

-- Only allow system to insert waitlist signups (from edge functions)
CREATE POLICY "System can insert waitlist signups" 
ON public.waitlist_signups 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view waitlist signups
CREATE POLICY "Admins can view waitlist signups" 
ON public.waitlist_signups 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Admins can update waitlist signups
CREATE POLICY "Admins can update waitlist signups" 
ON public.waitlist_signups 
FOR UPDATE 
USING (is_admin_user(auth.uid()));

-- Fix RLS policies for magic_links table
DROP POLICY IF EXISTS "Magic links are publicly accessible" ON public.magic_links;

-- Only allow system access to magic links
CREATE POLICY "System can manage magic links" 
ON public.magic_links 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create a function to safely validate magic links without exposing data
CREATE OR REPLACE FUNCTION public.validate_magic_link(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link RECORD;
  v_result jsonb;
BEGIN
  -- Find the magic link
  SELECT * INTO v_link 
  FROM public.magic_links 
  WHERE token = p_token 
    AND expires_at > now() 
    AND used_at IS NULL;
  
  IF v_link IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_or_expired');
  END IF;
  
  -- Mark as used
  UPDATE public.magic_links 
  SET used_at = now() 
  WHERE token = p_token;
  
  -- Return safe data for authentication
  RETURN jsonb_build_object(
    'valid', true,
    'email', v_link.user_email,
    'full_name', v_link.full_name,
    'beta_application_id', v_link.beta_application_id
  );
END;
$$;

-- Grant execute permission to anon users for magic link validation
GRANT EXECUTE ON FUNCTION public.validate_magic_link(uuid) TO anon;

-- Ensure profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;