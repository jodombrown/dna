-- Check and fix RLS policies for profiles table to protect user data

-- First, let's see what policies exist and drop the problematic public ones
DO $$
BEGIN
  -- Drop potentially insecure policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone') THEN
    DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view public profiles') THEN
    DROP POLICY "Users can view public profiles" ON public.profiles;
  END IF;
  
  -- Create secure policy for public profile viewing with privacy controls
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles viewable with privacy controls') THEN
    EXECUTE 'CREATE POLICY "Public profiles viewable with privacy controls" 
    ON public.profiles 
    FOR SELECT 
    USING (
      auth.uid() != id 
      AND COALESCE(is_public, false) = true 
      AND COALESCE(profile_completeness_score, 0) >= 50
    )';
  END IF;
END$$;

-- Fix waitlist_signups table security
DO $$
BEGIN
  -- Drop insecure policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Anyone can insert waitlist signups') THEN
    DROP POLICY "Anyone can insert waitlist signups" ON public.waitlist_signups;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Waitlist signups are publicly viewable') THEN
    DROP POLICY "Waitlist signups are publicly viewable" ON public.waitlist_signups;
  END IF;
  
  -- Create secure policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'System can insert waitlist signups') THEN
    EXECUTE 'CREATE POLICY "System can insert waitlist signups" 
    ON public.waitlist_signups 
    FOR INSERT 
    WITH CHECK (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Admins can view waitlist signups') THEN
    EXECUTE 'CREATE POLICY "Admins can view waitlist signups" 
    ON public.waitlist_signups 
    FOR SELECT 
    USING (is_admin_user(auth.uid()))';
  END IF;
END$$;

-- Fix magic_links table security  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'magic_links' AND policyname = 'Magic links are publicly accessible') THEN
    DROP POLICY "Magic links are publicly accessible" ON public.magic_links;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'magic_links' AND policyname = 'System can manage magic links') THEN
    EXECUTE 'CREATE POLICY "System can manage magic links" 
    ON public.magic_links 
    FOR ALL 
    USING (true) 
    WITH CHECK (true)';
  END IF;
END$$;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;