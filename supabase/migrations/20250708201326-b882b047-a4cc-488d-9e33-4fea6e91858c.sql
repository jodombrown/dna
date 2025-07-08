-- Fix ADIN RLS performance issues by optimizing auth function calls and consolidating policies

-- Drop existing policies for user_adin_profile
DROP POLICY IF EXISTS "Users can view their own ADIN profile" ON public.user_adin_profile;
DROP POLICY IF EXISTS "Users can insert their own ADIN profile" ON public.user_adin_profile;
DROP POLICY IF EXISTS "Users can update their own ADIN profile" ON public.user_adin_profile;
DROP POLICY IF EXISTS "System can read ADIN profiles for matching" ON public.user_adin_profile;

-- Drop existing policies for adin_connection_signals
DROP POLICY IF EXISTS "Users can view connection signals involving them" ON public.adin_connection_signals;
DROP POLICY IF EXISTS "Admins can view all connection signals" ON public.adin_connection_signals;

-- Create optimized consolidated policies for user_adin_profile
CREATE POLICY "ADIN profiles read access" 
  ON public.user_adin_profile 
  FOR SELECT 
  USING (
    -- Users can view their own profile OR system can read for matching
    ((select auth.uid()) = user_id) OR 
    true -- Allow system access for matching algorithms
  );

CREATE POLICY "Users can insert their own ADIN profile" 
  ON public.user_adin_profile 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own ADIN profile" 
  ON public.user_adin_profile 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

-- Create optimized consolidated policies for adin_connection_signals
CREATE POLICY "Connection signals read access" 
  ON public.adin_connection_signals 
  FOR SELECT 
  USING (
    -- Users can view signals involving them OR admins can view all
    ((select auth.uid()) = source_user) OR 
    ((select auth.uid()) = target_user) OR 
    public.is_admin_user((select auth.uid()))
  );

-- Keep the existing insert policy as it's already optimized
-- CREATE POLICY "System can create connection signals" already exists and is fine