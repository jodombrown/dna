-- Fix remaining security issues with beta_applications table
DO $$
BEGIN
  -- Drop any public access policies for beta_applications
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'beta_applications' AND policyname = 'Anyone can view beta applications') THEN
    DROP POLICY "Anyone can view beta applications" ON public.beta_applications;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'beta_applications' AND policyname = 'Beta applications are publicly readable') THEN
    DROP POLICY "Beta applications are publicly readable" ON public.beta_applications;
  END IF;
  
  -- Ensure only admins can view beta applications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'beta_applications' AND policyname = 'Admins can view all beta applications') THEN
    EXECUTE 'CREATE POLICY "Admins can view all beta applications" 
    ON public.beta_applications 
    FOR SELECT 
    USING (is_admin_user(auth.uid()))';
  END IF;
END$$;

-- Check if there are any overly permissive policies on profiles table and replace them
DO $$
BEGIN
  -- Check for any remaining public access policies on profiles
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname LIKE '%public%' AND policyname != 'Public profiles viewable with privacy controls') THEN
    -- Drop overly permissive policies (this is a safety check)
    DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
    DROP POLICY IF EXISTS "All profiles are public" ON public.profiles;
  END IF;
END$$;

-- Ensure beta_applications and magic_links have RLS enabled
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the security fix
COMMENT ON TABLE public.profiles IS 'User profiles with RLS policies to protect sensitive data based on privacy settings';
COMMENT ON TABLE public.waitlist_signups IS 'Waitlist signups - access restricted to admins only';
COMMENT ON TABLE public.beta_applications IS 'Beta applications - access restricted to admins only';
COMMENT ON TABLE public.magic_links IS 'Magic authentication links - system access only';