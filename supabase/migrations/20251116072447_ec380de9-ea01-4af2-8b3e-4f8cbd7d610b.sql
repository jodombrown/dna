-- Performance optimization: Fix auth_rls_initplan and multiple_permissive_policies warnings
-- This migration wraps auth.uid() calls in SELECT and consolidates multiple permissive policies

-- ===========================
-- user_interactions table
-- ===========================
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;

CREATE POLICY "Users can manage their own interactions"
ON public.user_interactions
FOR ALL
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ===========================
-- user_vectors table
-- ===========================
DROP POLICY IF EXISTS "Users can view their own vectors" ON public.user_vectors;
DROP POLICY IF EXISTS "System can manage user vectors" ON public.user_vectors;

CREATE POLICY "User vectors access policy"
ON public.user_vectors
FOR SELECT
USING (
  user_id = (SELECT auth.uid()) 
  OR (SELECT auth.uid()) IS NOT NULL -- System/authenticated access
);

CREATE POLICY "System can manage user vectors"
ON public.user_vectors
FOR ALL
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ===========================
-- entity_vectors table
-- ===========================
DROP POLICY IF EXISTS "Authenticated users can view entity vectors" ON public.entity_vectors;
DROP POLICY IF EXISTS "System can manage entity vectors" ON public.entity_vectors;

CREATE POLICY "Entity vectors access policy"
ON public.entity_vectors
FOR SELECT
USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can manage entity vectors"
ON public.entity_vectors
FOR ALL
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ===========================
-- ada_policies table
-- ===========================
DROP POLICY IF EXISTS "Admins can manage policies" ON public.ada_policies;
DROP POLICY IF EXISTS "Authenticated users can view active policies" ON public.ada_policies;

CREATE POLICY "ADA policies access policy"
ON public.ada_policies
FOR SELECT
USING (
  (SELECT public.is_admin())
  OR ((SELECT auth.uid()) IS NOT NULL AND is_active = true)
);

CREATE POLICY "Admins can manage policies"
ON public.ada_policies
FOR ALL
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- ===========================
-- ada_cohorts table
-- ===========================
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.ada_cohorts;
DROP POLICY IF EXISTS "Authenticated users can view active cohorts" ON public.ada_cohorts;

CREATE POLICY "ADA cohorts access policy"
ON public.ada_cohorts
FOR SELECT
USING (
  (SELECT public.is_admin())
  OR ((SELECT auth.uid()) IS NOT NULL AND is_active = true)
);

CREATE POLICY "Admins can manage cohorts"
ON public.ada_cohorts
FOR ALL
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- ===========================
-- ada_experiments table
-- ===========================
DROP POLICY IF EXISTS "Admins can manage experiments" ON public.ada_experiments;
DROP POLICY IF EXISTS "System can view running experiments" ON public.ada_experiments;

CREATE POLICY "ADA experiments access policy"
ON public.ada_experiments
FOR SELECT
USING (
  (SELECT public.is_admin())
  OR ((SELECT auth.uid()) IS NOT NULL AND status = 'running')
);

CREATE POLICY "Admins can manage experiments"
ON public.ada_experiments
FOR ALL
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- ===========================
-- ada_experiment_variants table
-- ===========================
DROP POLICY IF EXISTS "Admins can manage variants" ON public.ada_experiment_variants;
DROP POLICY IF EXISTS "System can view variants for running experiments" ON public.ada_experiment_variants;

CREATE POLICY "ADA experiment variants access policy"
ON public.ada_experiment_variants
FOR SELECT
USING (
  (SELECT public.is_admin())
  OR (
    (SELECT auth.uid()) IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.ada_experiments 
      WHERE id = experiment_id AND status = 'running'
    )
  )
);

CREATE POLICY "Admins can manage variants"
ON public.ada_experiment_variants
FOR ALL
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- ===========================
-- ada_cohort_memberships table
-- ===========================
DROP POLICY IF EXISTS "System can manage cohort memberships" ON public.ada_cohort_memberships;
DROP POLICY IF EXISTS "Users can view their own cohort memberships" ON public.ada_cohort_memberships;

CREATE POLICY "ADA cohort memberships access policy"
ON public.ada_cohort_memberships
FOR SELECT
USING (
  (SELECT auth.uid()) IS NOT NULL 
  AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
);

CREATE POLICY "System can manage cohort memberships"
ON public.ada_cohort_memberships
FOR ALL
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);