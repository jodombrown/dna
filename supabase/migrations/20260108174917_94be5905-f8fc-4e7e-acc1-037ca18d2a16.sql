-- Fix RLS performance issues: consolidate duplicate policies and use subqueries for auth functions

-- =============================================
-- 1. FIX user_last_view_state (remove duplicates, fix auth calls)
-- =============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can insert own view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can update own view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can delete own view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can view their own last view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can insert their own last view state" ON public.user_last_view_state;
DROP POLICY IF EXISTS "Users can update their own last view state" ON public.user_last_view_state;

-- Create single consolidated policies with optimized auth calls
CREATE POLICY "user_last_view_state_select" ON public.user_last_view_state
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "user_last_view_state_insert" ON public.user_last_view_state
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_last_view_state_update" ON public.user_last_view_state
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "user_last_view_state_delete" ON public.user_last_view_state
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =============================================
-- 2. FIX ada_experiment_assignments (remove duplicates, fix auth calls)
-- =============================================

DROP POLICY IF EXISTS "Users can read own experiment assignments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "Authenticated users can be assigned to experiments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.ada_experiment_assignments;
DROP POLICY IF EXISTS "View assignments (own or all as admin)" ON public.ada_experiment_assignments;

CREATE POLICY "ada_experiment_assignments_select" ON public.ada_experiment_assignments
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "ada_experiment_assignments_insert" ON public.ada_experiment_assignments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'admin'));

-- =============================================
-- 3. FIX ada_experiments (remove duplicates)
-- =============================================

DROP POLICY IF EXISTS "ADA experiments access policy" ON public.ada_experiments;
DROP POLICY IF EXISTS "Authenticated users can read experiments" ON public.ada_experiments;

CREATE POLICY "ada_experiments_select" ON public.ada_experiments
  FOR SELECT TO authenticated
  USING (true);

-- =============================================
-- 4. FIX ada_experiment_variants (remove duplicates)
-- =============================================

DROP POLICY IF EXISTS "ADA experiment variants access policy" ON public.ada_experiment_variants;
DROP POLICY IF EXISTS "Authenticated users can read experiment variants" ON public.ada_experiment_variants;

CREATE POLICY "ada_experiment_variants_select" ON public.ada_experiment_variants
  FOR SELECT TO authenticated
  USING (true);

-- =============================================
-- 5. FIX event_roles (remove duplicates, fix auth calls)
-- =============================================

DROP POLICY IF EXISTS "Users can view event roles for public events" ON public.event_roles;
DROP POLICY IF EXISTS "Organizers can manage event roles" ON public.event_roles;

-- Allow viewing roles for public events or if user is organizer
CREATE POLICY "event_roles_select" ON public.event_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND (e.visibility = 'public' OR e.organizer_id = (select auth.uid()))
    )
  );

-- Allow organizers to manage roles
CREATE POLICY "event_roles_manage" ON public.event_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

-- =============================================
-- 6. FIX event_tickets (remove duplicates, fix auth calls)
-- =============================================

DROP POLICY IF EXISTS "Anyone can view active tickets for public events" ON public.event_tickets;
DROP POLICY IF EXISTS "Organizers can manage tickets" ON public.event_tickets;

-- Anyone can view active tickets for public events
CREATE POLICY "event_tickets_public_select" ON public.event_tickets
  FOR SELECT
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.visibility = 'public'
    )
  );

-- Organizers can manage their event tickets
CREATE POLICY "event_tickets_organizer_manage" ON public.event_tickets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

-- =============================================
-- 7. FIX event_promo_codes (fix auth calls)
-- =============================================

DROP POLICY IF EXISTS "Organizers can manage promo codes" ON public.event_promo_codes;

CREATE POLICY "event_promo_codes_organizer_manage" ON public.event_promo_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_promo_codes.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_promo_codes.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );