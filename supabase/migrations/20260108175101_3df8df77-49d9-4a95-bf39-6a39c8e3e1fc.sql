-- Fix remaining multiple permissive policies by consolidating SELECT logic

-- =============================================
-- 1. FIX event_roles - consolidate into single SELECT policy
-- =============================================

DROP POLICY IF EXISTS "event_roles_select" ON public.event_roles;
DROP POLICY IF EXISTS "event_roles_manage" ON public.event_roles;

-- Single SELECT policy covering both public view and organizer access
CREATE POLICY "event_roles_select" ON public.event_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND (e.visibility = 'public' OR e.organizer_id = (select auth.uid()))
    )
  );

-- Separate INSERT/UPDATE/DELETE for organizers only
CREATE POLICY "event_roles_insert" ON public.event_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

CREATE POLICY "event_roles_update" ON public.event_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

CREATE POLICY "event_roles_delete" ON public.event_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_roles.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

-- =============================================
-- 2. FIX event_tickets - consolidate into single SELECT policy
-- =============================================

DROP POLICY IF EXISTS "event_tickets_public_select" ON public.event_tickets;
DROP POLICY IF EXISTS "event_tickets_organizer_manage" ON public.event_tickets;

-- Single SELECT policy covering both public view and organizer access
CREATE POLICY "event_tickets_select" ON public.event_tickets
  FOR SELECT
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.visibility = 'public'
    ))
    OR
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

-- Separate INSERT/UPDATE/DELETE for organizers only
CREATE POLICY "event_tickets_insert" ON public.event_tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

CREATE POLICY "event_tickets_update" ON public.event_tickets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );

CREATE POLICY "event_tickets_delete" ON public.event_tickets
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_tickets.event_id 
      AND e.organizer_id = (select auth.uid())
    )
  );