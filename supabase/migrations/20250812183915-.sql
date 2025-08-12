-- Migration: Fix RLS performance warnings and duplicate index
-- 1) Replace auth.uid() with (select auth.uid()) in RLS policies flagged by linter
-- 2) Consolidate duplicate permissive SELECT policies on connection_intentions
-- 3) Drop duplicate index on connection_preferences

-- Connections: INSERT policy
DROP POLICY IF EXISTS "connections_insert_participants" ON public.connections;
CREATE POLICY "connections_insert_participants"
ON public.connections
FOR INSERT
WITH CHECK ((a = (select auth.uid())) OR (b = (select auth.uid())));

-- Connection Intentions: consolidate SELECT and update expressions
DROP POLICY IF EXISTS "ci_select_participants" ON public.connection_intentions;
DROP POLICY IF EXISTS "Intentions readable by owner or shared to participants" ON public.connection_intentions;
CREATE POLICY "Intentions readable by owner or shared to participants"
ON public.connection_intentions
FOR SELECT
USING (
  (by_user = (select auth.uid()))
  OR (
    visibility = 'shared'
    AND public.is_participant_of_connection(connection_id, (select auth.uid()))
  )
);

-- Connection Intentions: INSERT policy
DROP POLICY IF EXISTS "ci_insert_owner_participant" ON public.connection_intentions;
CREATE POLICY "ci_insert_owner_participant"
ON public.connection_intentions
FOR INSERT
WITH CHECK (
  by_user = (select auth.uid())
  AND public.is_connection_participant(connection_id)
);

-- Connection Intentions: UPDATE policy
DROP POLICY IF EXISTS "ci_update_owner_participant" ON public.connection_intentions;
CREATE POLICY "ci_update_owner_participant"
ON public.connection_intentions
FOR UPDATE
USING (
  by_user = (select auth.uid())
  AND public.is_connection_participant(connection_id)
)
WITH CHECK (
  by_user = (select auth.uid())
  AND public.is_connection_participant(connection_id)
);

-- Connection Preferences: INSERT/SELECT/UPDATE policies
DROP POLICY IF EXISTS "Prefs insert by owner participant" ON public.connection_preferences;
CREATE POLICY "Prefs insert by owner participant"
ON public.connection_preferences
FOR INSERT
WITH CHECK (
  user_id = (select auth.uid())
  AND public.is_participant_of_connection(connection_id, (select auth.uid()))
);

DROP POLICY IF EXISTS "Prefs readable by owner" ON public.connection_preferences;
CREATE POLICY "Prefs readable by owner"
ON public.connection_preferences
FOR SELECT
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Prefs update by owner participant" ON public.connection_preferences;
CREATE POLICY "Prefs update by owner participant"
ON public.connection_preferences
FOR UPDATE
USING (
  user_id = (select auth.uid())
  AND public.is_participant_of_connection(connection_id, (select auth.uid()))
)
WITH CHECK (
  user_id = (select auth.uid())
  AND public.is_participant_of_connection(connection_id, (select auth.uid()))
);

-- Connection Events: INSERT policy
DROP POLICY IF EXISTS "ce_insert_participants" ON public.connection_events;
CREATE POLICY "ce_insert_participants"
ON public.connection_events
FOR INSERT
WITH CHECK (
  public.is_connection_participant(connection_id)
  AND actor = (select auth.uid())
);

-- ADIN Recommendations: INSERT/SELECT/UPDATE policies
DROP POLICY IF EXISTS "ar_user_owned_insert" ON public.adin_recommendations;
CREATE POLICY "ar_user_owned_insert"
ON public.adin_recommendations
FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "ar_user_owned_select" ON public.adin_recommendations;
CREATE POLICY "ar_user_owned_select"
ON public.adin_recommendations
FOR SELECT
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "ar_user_owned_update" ON public.adin_recommendations;
CREATE POLICY "ar_user_owned_update"
ON public.adin_recommendations
FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- ADIN Nudges: SELECT/UPDATE policies
DROP POLICY IF EXISTS "Nudges readable by owner" ON public.adin_nudges;
CREATE POLICY "Nudges readable by owner"
ON public.adin_nudges
FOR SELECT
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Nudges update by owner" ON public.adin_nudges;
CREATE POLICY "Nudges update by owner"
ON public.adin_nudges
FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Duplicate index cleanup on connection_preferences
DROP INDEX IF EXISTS public.uniq_conn_prefs;