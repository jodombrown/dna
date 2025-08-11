-- Fix RLS policies to avoid per-row auth.uid() re-evaluation by wrapping in SELECT
-- and drop duplicate index on event_checkins

-- event_ticket_holds policies
ALTER POLICY "holds_delete_own"
ON public.event_ticket_holds
USING (user_id = (SELECT auth.uid()));

ALTER POLICY "holds_insert_own"
ON public.event_ticket_holds
WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY "holds_select_own"
ON public.event_ticket_holds
USING (user_id = (SELECT auth.uid()));

ALTER POLICY "holds_update_own"
ON public.event_ticket_holds
USING (user_id = (SELECT auth.uid()));

-- event_registrations policies
ALTER POLICY "registrations_delete_self"
ON public.event_registrations
USING (user_id = (SELECT auth.uid()));

ALTER POLICY "registrations_insert_self"
ON public.event_registrations
WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY "registrations_read_self_or_host"
ON public.event_registrations
USING (
  (user_id = (SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = public.event_registrations.event_id
      AND e.created_by = (SELECT auth.uid())
  )
);

ALTER POLICY "registrations_update_host"
ON public.event_registrations
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = public.event_registrations.event_id
      AND e.created_by = (SELECT auth.uid())
  )
);

-- events member access policy
ALTER POLICY "events_member_access"
ON public.events
USING (
  visibility = 'public'
  OR (visibility = 'members' AND (SELECT auth.uid()) IS NOT NULL)
  OR created_by = (SELECT auth.uid())
);

-- Drop duplicate index on event_checkins (keep the constraint-backed unique index)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'event_checkins' 
      AND indexname = 'idx_event_checkins_registration_unique') THEN
    EXECUTE 'DROP INDEX public.idx_event_checkins_registration_unique';
  END IF;
END$$;