-- Fix remaining multiple permissive policies for reminder_logs
-- The issue is that "FOR ALL" policy also covers SELECT, creating overlap

-- Drop the overly broad system policy
DROP POLICY IF EXISTS "System can manage all reminder logs" ON public.reminder_logs;

-- Create specific system policies for non-SELECT operations only
CREATE POLICY "System can insert reminder logs" ON public.reminder_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update reminder logs" ON public.reminder_logs
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "System can delete reminder logs" ON public.reminder_logs
  FOR DELETE USING (true);