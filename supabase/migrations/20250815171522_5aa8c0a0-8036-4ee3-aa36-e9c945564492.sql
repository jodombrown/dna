-- Fix Auth RLS performance issues by wrapping auth.uid() with SELECT
-- This prevents unnecessary re-evaluation for each row

-- Fix project_contributions policies
DROP POLICY IF EXISTS "Users can view contributions to their projects or their own con" ON public.project_contributions;
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.project_contributions;
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.project_contributions;

CREATE POLICY "Users can view contributions to their projects or their own contributions" ON public.project_contributions
FOR SELECT USING (
  contributor_id = (SELECT auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_contributions.project_id 
    AND p.creator_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create their own contributions" ON public.project_contributions
FOR INSERT WITH CHECK (contributor_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own contributions" ON public.project_contributions
FOR UPDATE USING (contributor_id = (SELECT auth.uid()));

-- Fix skill_analytics policies
DROP POLICY IF EXISTS "Users can view their own skill analytics" ON public.skill_analytics;

CREATE POLICY "Users can view their own skill analytics" ON public.skill_analytics
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix skill_connections policies  
DROP POLICY IF EXISTS "Users can view their own skill connections" ON public.skill_connections;

CREATE POLICY "Users can view their own skill connections" ON public.skill_connections
FOR SELECT USING (user_a_id = (SELECT auth.uid()) OR user_b_id = (SELECT auth.uid()));

-- Fix multiple permissive policies on profiles table
-- Drop existing UPDATE policies and create a single consolidated one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = (SELECT auth.uid()));