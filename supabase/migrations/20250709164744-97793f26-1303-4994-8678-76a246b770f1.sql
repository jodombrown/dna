-- Fix RLS performance issues by optimizing auth function calls and consolidating policies

-- Drop existing policies for adin_contributor_requests to recreate optimized versions
DROP POLICY IF EXISTS "Admins can view all requests" ON public.adin_contributor_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.adin_contributor_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.adin_contributor_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.adin_contributor_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.adin_contributor_requests;

-- Create consolidated and optimized policies for adin_contributor_requests
CREATE POLICY "Contributors can view their requests, admins can view all" 
ON public.adin_contributor_requests 
FOR SELECT 
USING (
  ((SELECT auth.uid()) = user_id) OR 
  is_admin_user((SELECT auth.uid()))
);

CREATE POLICY "Contributors can create their own requests" 
ON public.adin_contributor_requests 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Contributors can update pending requests, admins can update all" 
ON public.adin_contributor_requests 
FOR UPDATE 
USING (
  (((SELECT auth.uid()) = user_id) AND (status = 'pending'::text)) OR 
  is_admin_user((SELECT auth.uid()))
);

-- Fix user_dna_points policy with optimized auth call
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_dna_points;

CREATE POLICY "Users can update their own points" 
ON public.user_dna_points 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize admin_users policies by making the protection policy restrictive
DROP POLICY IF EXISTS "Cannot delete protected super admin" ON public.admin_users;

CREATE POLICY "Cannot delete protected super admin" 
ON public.admin_users 
FOR DELETE 
AS RESTRICTIVE
USING (NOT (EXISTS ( 
  SELECT 1 FROM auth.users 
  WHERE users.id = admin_users.user_id 
  AND users.email = 'aweh@diasporanetwork.africa'
)));

-- Optimize leaderboard_cache by making system policy more specific
DROP POLICY IF EXISTS "System can manage leaderboard cache" ON public.leaderboard_cache;

CREATE POLICY "System can manage leaderboard cache" 
ON public.leaderboard_cache 
FOR INSERT, UPDATE, DELETE
USING (true);