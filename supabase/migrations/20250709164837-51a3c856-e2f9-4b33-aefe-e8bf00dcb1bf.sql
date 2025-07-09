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

-- Optimize admin_users policies by consolidating into one policy
DROP POLICY IF EXISTS "Admin access policy" ON public.admin_users;
DROP POLICY IF EXISTS "Cannot delete protected super admin" ON public.admin_users;

CREATE POLICY "Admin access with protection" 
ON public.admin_users 
FOR ALL
USING (
  (is_admin_user((SELECT auth.uid())) OR (get_admin_role((SELECT auth.uid())) = 'superadmin'::admin_role))
  AND 
  (CASE WHEN TG_OP = 'DELETE' THEN 
    NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE users.id = admin_users.user_id 
      AND users.email = 'aweh@diasporanetwork.africa'
    )
  ELSE true END)
);

-- Optimize leaderboard_cache by consolidating policies
DROP POLICY IF EXISTS "Anyone can view leaderboards" ON public.leaderboard_cache;
DROP POLICY IF EXISTS "System can manage leaderboard cache" ON public.leaderboard_cache;

CREATE POLICY "Leaderboard access policy" 
ON public.leaderboard_cache 
FOR ALL
USING (true);