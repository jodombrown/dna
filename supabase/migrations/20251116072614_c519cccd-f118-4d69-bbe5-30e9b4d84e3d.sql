-- Fix remaining multiple_permissive_policies warnings
-- Separate ALL policies into specific INSERT, UPDATE, DELETE to avoid conflicts with SELECT

-- ===========================
-- ada_cohort_memberships
-- ===========================
DROP POLICY IF EXISTS "System can manage cohort memberships" ON public.ada_cohort_memberships;

CREATE POLICY "System can insert cohort memberships"
ON public.ada_cohort_memberships
FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can update cohort memberships"
ON public.ada_cohort_memberships
FOR UPDATE
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can delete cohort memberships"
ON public.ada_cohort_memberships
FOR DELETE
USING ((SELECT auth.uid()) IS NOT NULL);

-- ===========================
-- ada_cohorts
-- ===========================
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.ada_cohorts;

CREATE POLICY "Admins can insert cohorts"
ON public.ada_cohorts
FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update cohorts"
ON public.ada_cohorts
FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete cohorts"
ON public.ada_cohorts
FOR DELETE
USING ((SELECT public.is_admin()));

-- ===========================
-- ada_experiments
-- ===========================
DROP POLICY IF EXISTS "Admins can manage experiments" ON public.ada_experiments;

CREATE POLICY "Admins can insert experiments"
ON public.ada_experiments
FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update experiments"
ON public.ada_experiments
FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete experiments"
ON public.ada_experiments
FOR DELETE
USING ((SELECT public.is_admin()));

-- ===========================
-- ada_experiment_variants
-- ===========================
DROP POLICY IF EXISTS "Admins can manage variants" ON public.ada_experiment_variants;

CREATE POLICY "Admins can insert variants"
ON public.ada_experiment_variants
FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update variants"
ON public.ada_experiment_variants
FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete variants"
ON public.ada_experiment_variants
FOR DELETE
USING ((SELECT public.is_admin()));

-- ===========================
-- ada_policies
-- ===========================
DROP POLICY IF EXISTS "Admins can manage policies" ON public.ada_policies;

CREATE POLICY "Admins can insert policies"
ON public.ada_policies
FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update policies"
ON public.ada_policies
FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete policies"
ON public.ada_policies
FOR DELETE
USING ((SELECT public.is_admin()));

-- ===========================
-- entity_vectors
-- ===========================
DROP POLICY IF EXISTS "System can manage entity vectors" ON public.entity_vectors;

CREATE POLICY "System can insert entity vectors"
ON public.entity_vectors
FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can update entity vectors"
ON public.entity_vectors
FOR UPDATE
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can delete entity vectors"
ON public.entity_vectors
FOR DELETE
USING ((SELECT auth.uid()) IS NOT NULL);

-- ===========================
-- user_vectors
-- ===========================
DROP POLICY IF EXISTS "System can manage user vectors" ON public.user_vectors;

CREATE POLICY "System can insert user vectors"
ON public.user_vectors
FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can update user vectors"
ON public.user_vectors
FOR UPDATE
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "System can delete user vectors"
ON public.user_vectors
FOR DELETE
USING ((SELECT auth.uid()) IS NOT NULL);