-- Fix multiple permissive policies (corrected - remove feature_flags fix)

-- 1. profiles table - remove duplicate UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. profiles table - remove duplicate INSERT policy
DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;

-- 3. user_roles table - merge SELECT policies
DROP POLICY IF EXISTS "user_roles_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_view" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR 
    has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- 4. invites table - merge SELECT policies
DROP POLICY IF EXISTS "Admins can view all invites" ON public.invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON public.invites;
CREATE POLICY "invites_select" ON public.invites
  FOR SELECT USING (
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    email = (SELECT auth.email()) OR 
    created_by = (SELECT auth.uid())
  );

-- 5. billing_transactions - merge SELECT policies
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.billing_transactions;
DROP POLICY IF EXISTS "Org owners can view their transactions" ON public.billing_transactions;
CREATE POLICY "billing_transactions_select" ON public.billing_transactions
  FOR SELECT USING (
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_user_id = (SELECT auth.uid())
    )
  );

-- 6. organization_verification_requests - merge all policies
DROP POLICY IF EXISTS "Admins can manage verification requests" ON public.organization_verification_requests;
DROP POLICY IF EXISTS "Org owners can create verification requests" ON public.organization_verification_requests;
DROP POLICY IF EXISTS "Org owners can view their verification requests" ON public.organization_verification_requests;
CREATE POLICY "org_verification_all" ON public.organization_verification_requests
  FOR ALL USING (
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_user_id = (SELECT auth.uid())
    )
  );

-- 7. profile_views - merge INSERT policies
DROP POLICY IF EXISTS "Anyone can create profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Authenticated users can log views" ON public.profile_views;
CREATE POLICY "profile_views_insert" ON public.profile_views
  FOR INSERT WITH CHECK (true);

-- 8. profile_views - merge SELECT policies
DROP POLICY IF EXISTS "Profile owners can view their analytics" ON public.profile_views;
DROP POLICY IF EXISTS "Users can view own profile views" ON public.profile_views;
CREATE POLICY "profile_views_select" ON public.profile_views
  FOR SELECT USING (
    profile_id = (SELECT auth.uid()) OR
    viewer_id = (SELECT auth.uid())
  );

-- 9. profile_causes - merge SELECT policies
DROP POLICY IF EXISTS "Anyone can view profile causes" ON public.profile_causes;
DROP POLICY IF EXISTS "Users can manage their own profile causes" ON public.profile_causes;
CREATE POLICY "profile_causes_select" ON public.profile_causes
  FOR SELECT USING (true);

-- 10. profile_skills - merge SELECT policies
DROP POLICY IF EXISTS "Anyone can view profile skills" ON public.profile_skills;
DROP POLICY IF EXISTS "Users can manage their own profile skills" ON public.profile_skills;
CREATE POLICY "profile_skills_select" ON public.profile_skills
  FOR SELECT USING (true);