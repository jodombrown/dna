-- =============================================
-- RLS Performance Optimization Migration (Fixed)
-- Fixes auth_rls_initplan and multiple_permissive_policies warnings
-- =============================================

-- 1. Fix dia_user_usage policies (convert auth.uid() to (select auth.uid()))
DROP POLICY IF EXISTS "dia_user_usage_select_own" ON public.dia_user_usage;
DROP POLICY IF EXISTS "dia_user_usage_update_own" ON public.dia_user_usage;

CREATE POLICY "dia_user_usage_select_own" ON public.dia_user_usage
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "dia_user_usage_update_own" ON public.dia_user_usage
  FOR UPDATE USING (user_id = (select auth.uid()));

-- 2. Fix dia_query_log policies
DROP POLICY IF EXISTS "dia_query_log_insert_own" ON public.dia_query_log;
DROP POLICY IF EXISTS "dia_query_log_select_own" ON public.dia_query_log;

CREATE POLICY "dia_query_log_insert_own" ON public.dia_query_log
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "dia_query_log_select_own" ON public.dia_query_log
  FOR SELECT USING (user_id = (select auth.uid()));

-- 3. Fix releases policies - consolidate and optimize
DROP POLICY IF EXISTS "Admins can manage releases" ON public.releases;
DROP POLICY IF EXISTS "Public can view published releases" ON public.releases;
DROP POLICY IF EXISTS "releases_select_policy" ON public.releases;
DROP POLICY IF EXISTS "releases_admin_manage" ON public.releases;

-- Single consolidated SELECT policy for all roles (using 'admin' in roles array)
CREATE POLICY "releases_select_policy" ON public.releases
  FOR SELECT USING (
    status = 'published' 
    OR (select auth.uid()) IN (
      SELECT id FROM profiles WHERE 'admin' = ANY(roles)
    )
  );

-- Admin-only management policy for INSERT/UPDATE/DELETE
CREATE POLICY "releases_admin_manage" ON public.releases
  FOR ALL USING (
    (select auth.uid()) IN (
      SELECT id FROM profiles WHERE 'admin' = ANY(roles)
    )
  );

-- 4. Fix release_features policies - consolidate and optimize
DROP POLICY IF EXISTS "Admins can manage release features" ON public.release_features;
DROP POLICY IF EXISTS "Public can view release features" ON public.release_features;
DROP POLICY IF EXISTS "release_features_select_policy" ON public.release_features;
DROP POLICY IF EXISTS "release_features_admin_manage" ON public.release_features;

-- Single consolidated SELECT policy
CREATE POLICY "release_features_select_policy" ON public.release_features
  FOR SELECT USING (true);

-- Admin-only management policy for INSERT/UPDATE/DELETE
CREATE POLICY "release_features_admin_manage" ON public.release_features
  FOR ALL USING (
    (select auth.uid()) IN (
      SELECT id FROM profiles WHERE 'admin' = ANY(roles)
    )
  );

-- 5. Fix dia_insights duplicate policies
DROP POLICY IF EXISTS "adin_insights_select_active" ON public.dia_insights;
DROP POLICY IF EXISTS "dia_insights_select_policy" ON public.dia_insights;

CREATE POLICY "dia_insights_select_policy" ON public.dia_insights
  FOR SELECT USING (is_active = true);

-- 6. Fix dia_queries duplicate policies
DROP POLICY IF EXISTS "adin_queries_select_authenticated" ON public.dia_queries;
DROP POLICY IF EXISTS "dia_queries_select_policy" ON public.dia_queries;

CREATE POLICY "dia_queries_select_policy" ON public.dia_queries
  FOR SELECT USING (true);