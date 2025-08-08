-- Fix RLS performance warnings and duplicate policies/indexes for notifications
BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean up duplicate/old policies to avoid multiple permissive policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Recreate SELECT policy with optimized auth call
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
ON public.notifications
FOR SELECT
USING ((select auth.uid()) = user_id);

-- Recreate UPDATE policy with optimized auth call
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING ((select auth.uid()) = user_id);

-- Ensure a single INSERT policy exists
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Drop duplicate index if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname='public' AND tablename='notifications' AND indexname='idx_notifications_user_created_at'
  ) THEN
    DROP INDEX public.idx_notifications_user_created_at;
  END IF;
END $$;

-- Ensure primary user/created_at index exists
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

COMMIT;