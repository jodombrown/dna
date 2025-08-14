-- Fix critical security issue: Users table allows public access to private data
-- This policy currently allows anyone to see user emails, names, locations if bio exists
DROP POLICY IF EXISTS "Users can view their own record and public profiles" ON public.users;

-- Create secure policy that only allows users to see their own record
CREATE POLICY "Users can view their own record only" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Fix feature_flags table if it exists (secure from public access)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feature_flags') THEN
        ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
        
        -- Drop any existing permissive policies
        DROP POLICY IF EXISTS "feature_flags_admin_only" ON public.feature_flags;
        
        -- Only admins should see feature flags
        CREATE POLICY "feature_flags_admin_only" 
        ON public.feature_flags 
        FOR SELECT 
        USING (public.is_admin_user(auth.uid()));
    END IF;
END $$;