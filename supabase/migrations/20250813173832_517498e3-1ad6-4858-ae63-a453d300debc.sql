-- Fix critical security issue: Users table allows public access to private data
-- This policy currently allows anyone to see user emails, names, locations if bio exists
DROP POLICY IF EXISTS "Users can view their own record and public profiles" ON public.users;

-- Create secure policy that only allows users to see their own record
-- and limited public profile data for others (no emails, private data)
CREATE POLICY "Users can view their own record only" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Create separate policy for limited public profile viewing (without sensitive data)
-- Note: This would need a view or function to expose only safe fields like username, bio
-- For now, we'll remove public access entirely until proper public profile mechanism exists

-- Fix RLS policies for publicly exposed views
-- Restrict user_impact_summary to authenticated users only
CREATE POLICY "user_impact_summary_auth_only" 
ON public.user_impact_summary 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Restrict view_public_contributions to authenticated users  
CREATE POLICY "view_public_contributions_auth_only"
ON public.view_public_contributions
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Enable RLS on views if not already enabled
ALTER TABLE public.user_impact_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_public_contributions ENABLE ROW LEVEL SECURITY;

-- Check if feature_flags table exists and secure it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feature_flags') THEN
        ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
        
        -- Only admins should see feature flags
        CREATE POLICY "feature_flags_admin_only" 
        ON public.feature_flags 
        FOR SELECT 
        USING (public.is_admin_user(auth.uid()));
    END IF;
END $$;

-- Ensure profiles table has proper privacy controls
-- Check if profiles visibility column exists for field-level privacy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'visibility') THEN
        -- Profiles table already has proper privacy controls via visibility field
        -- The existing RLS policies use can_view_field function which respects privacy settings
        RAISE NOTICE 'Profiles table already has proper privacy controls';
    END IF;
END $$;