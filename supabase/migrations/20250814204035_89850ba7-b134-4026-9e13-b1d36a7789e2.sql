-- Fix RLS performance issues identified by linter

-- Fix auth function performance in users table policy
DROP POLICY IF EXISTS "Users can view their own record only" ON public.users;

CREATE POLICY "Users can view their own record only" 
ON public.users 
FOR SELECT 
USING ((SELECT auth.uid()) = id);

-- Fix feature_flags table: remove duplicate policies and optimize auth calls
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feature_flags') THEN
        -- Drop all existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Feature flags read access" ON public.feature_flags;
        DROP POLICY IF EXISTS "feature_flags_admin_only" ON public.feature_flags;
        
        -- Create single optimized policy for admin access
        CREATE POLICY "feature_flags_admin_only" 
        ON public.feature_flags 
        FOR SELECT 
        USING (public.is_admin_user((SELECT auth.uid())));
    END IF;
END $$;