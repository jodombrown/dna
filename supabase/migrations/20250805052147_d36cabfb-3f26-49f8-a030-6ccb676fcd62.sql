-- Fix multiple permissive RLS policies for optimal performance

-- Drop existing multiple policies for onboarding_feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.onboarding_feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.onboarding_feedback;

-- Create consolidated policy for onboarding_feedback
CREATE POLICY "Users can view own feedback, admins can view all" ON public.onboarding_feedback
  FOR SELECT USING (
    ((select auth.uid()) = user_id) OR 
    is_admin_user((select auth.uid()))
  );

-- Drop existing multiple policies for user_engagement_tracking  
DROP POLICY IF EXISTS "Users can view their own engagement events" ON public.user_engagement_tracking;
DROP POLICY IF EXISTS "Admins can view all engagement events" ON public.user_engagement_tracking;

-- Create consolidated policy for user_engagement_tracking
CREATE POLICY "Users can view own events, admins can view all" ON public.user_engagement_tracking
  FOR SELECT USING (
    ((select auth.uid()) = user_id) OR 
    is_admin_user((select auth.uid()))
  );

-- Drop existing multiple policies for reminder_logs
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.reminder_logs;
DROP POLICY IF EXISTS "Admins can view all reminder logs" ON public.reminder_logs;
DROP POLICY IF EXISTS "System can manage reminder logs" ON public.reminder_logs;

-- Create consolidated policies for reminder_logs
CREATE POLICY "Users can view own reminders, admins can view all" ON public.reminder_logs
  FOR SELECT USING (
    ((select auth.uid()) = user_id) OR 
    is_admin_user((select auth.uid()))
  );

-- Separate policy for system operations (INSERT, UPDATE, DELETE)
CREATE POLICY "System can manage all reminder logs" ON public.reminder_logs
  FOR ALL WITH CHECK (true);