-- Fix Auth RLS Initialization Plan issues by wrapping auth functions in SELECT
-- This prevents re-evaluation for each row and improves query performance

-- 1. Fix rate_limit_checks policies
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limit_checks;
CREATE POLICY "Users can view own rate limits"
ON public.rate_limit_checks
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- 2. Fix content_flags policies - also consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "Users can create content flags" ON public.content_flags;
DROP POLICY IF EXISTS "Users can report content" ON public.content_flags;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.content_flags;
DROP POLICY IF EXISTS "Admins can update reports" ON public.content_flags;

-- Consolidated INSERT policy (combines the two duplicate policies)
CREATE POLICY "Users can create content flags"
ON public.content_flags
FOR INSERT
TO authenticated
WITH CHECK (flagged_by = (SELECT auth.uid()));

-- Optimized SELECT policies
CREATE POLICY "Admins can view all reports"
ON public.content_flags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Admins can update reports"
ON public.content_flags
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.user_type = 'admin'
  )
);

-- 3. Fix analytics_events policies
DROP POLICY IF EXISTS "Users can track their own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;

CREATE POLICY "Users can track their own events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.user_type = 'admin'
  )
);

-- 4. Fix events policies - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Group members can view group events" ON public.events;
DROP POLICY IF EXISTS "Users can view accessible events" ON public.events;

-- Consolidated SELECT policy (combines both viewing scenarios)
CREATE POLICY "Users can view accessible events"
ON public.events
FOR SELECT
TO authenticated
USING (
  -- Public events
  is_public = true
  -- OR group events where user is a member and not banned
  OR (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = events.group_id
      AND gm.user_id = (SELECT auth.uid())
      AND gm.is_banned = false
    )
  )
  -- OR events created by the user
  OR organizer_id = (SELECT auth.uid())
);

-- 5. Fix event_reminder_logs policies - consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Admins can view all reminder logs" ON public.event_reminder_logs;
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.event_reminder_logs;

-- Consolidated SELECT policy
CREATE POLICY "Users can view reminder logs"
ON public.event_reminder_logs
FOR SELECT
TO authenticated
USING (
  -- Users can view their own logs
  user_id = (SELECT auth.uid())
  -- OR admins can view all logs
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND 'admin' = ANY(profiles.roles)
  )
);

-- 6. Fix cron_job_logs policies
DROP POLICY IF EXISTS "Admins can view cron logs" ON public.cron_job_logs;

CREATE POLICY "Admins can view cron logs"
ON public.cron_job_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND 'admin' = ANY(profiles.roles)
  )
);

-- 7. Remove duplicate index on event_attendees
-- Keep idx_event_attendees_event_status as it's more specific
DROP INDEX IF EXISTS public.idx_event_attendees_event;