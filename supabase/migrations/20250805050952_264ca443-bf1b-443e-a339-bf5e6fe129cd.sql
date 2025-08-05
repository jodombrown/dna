-- Phase 3 Sprint 1: Engagement tracking tables (avoiding duplicate notifications table)

-- Create user_engagement_tracking table
CREATE TABLE IF NOT EXISTS public.user_engagement_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_context JSONB DEFAULT '{}',
  cohort TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminder_logs table  
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_channel TEXT,
  message_template TEXT,
  cohort TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Add constraints and checks for reminder_logs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_logs_status_check') THEN
    ALTER TABLE public.reminder_logs ADD CONSTRAINT reminder_logs_status_check 
      CHECK (status IN ('pending', 'sent', 'failed', 'skipped'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_logs_delivery_channel_check') THEN
    ALTER TABLE public.reminder_logs ADD CONSTRAINT reminder_logs_delivery_channel_check 
      CHECK (delivery_channel IN ('email', 'in_app', 'sms') OR delivery_channel IS NULL);
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_engagement_tracking_user_event ON public.user_engagement_tracking(user_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_type_scheduled ON public.reminder_logs(user_id, reminder_type, scheduled_at);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_tracking_cohort ON public.user_engagement_tracking(cohort, created_at);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status_scheduled ON public.reminder_logs(status, scheduled_at);

-- Enable RLS on new tables
ALTER TABLE public.user_engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_engagement_tracking
DROP POLICY IF EXISTS "Users can view their own engagement events" ON public.user_engagement_tracking;
CREATE POLICY "Users can view their own engagement events" ON public.user_engagement_tracking
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all engagement events" ON public.user_engagement_tracking;
CREATE POLICY "Admins can view all engagement events" ON public.user_engagement_tracking
  FOR SELECT USING (is_admin_user((select auth.uid())));

DROP POLICY IF EXISTS "System can create engagement events" ON public.user_engagement_tracking;
CREATE POLICY "System can create engagement events" ON public.user_engagement_tracking
  FOR INSERT WITH CHECK (true);

-- RLS Policies for reminder_logs
DROP POLICY IF EXISTS "Users can view their own reminder logs" ON public.reminder_logs;
CREATE POLICY "Users can view their own reminder logs" ON public.reminder_logs
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all reminder logs" ON public.reminder_logs;
CREATE POLICY "Admins can view all reminder logs" ON public.reminder_logs
  FOR SELECT USING (is_admin_user((select auth.uid())));

DROP POLICY IF EXISTS "System can manage reminder logs" ON public.reminder_logs;
CREATE POLICY "System can manage reminder logs" ON public.reminder_logs
  FOR ALL WITH CHECK (true);

-- Create helper functions for engagement tracking
CREATE OR REPLACE FUNCTION public.log_engagement_event(
  target_user_id UUID,
  event_type_param TEXT,
  event_context_param JSONB DEFAULT '{}',
  cohort_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.user_engagement_tracking (
    user_id, event_type, event_context, cohort
  ) VALUES (
    target_user_id, event_type_param, event_context_param, cohort_param
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Function to get user cohort based on profile data
CREATE OR REPLACE FUNCTION public.get_user_cohort(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
  cohort_result TEXT;
BEGIN
  SELECT user_type, selected_pillars, onboarding_completed_at 
  INTO user_profile
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF user_profile IS NULL THEN
    RETURN 'unknown';
  END IF;
  
  -- Determine cohort based on user_type and other factors
  IF user_profile.user_type = 'founder' OR user_profile.user_type = 'entrepreneur' THEN
    cohort_result := 'founder';
  ELSIF user_profile.user_type = 'professional' THEN
    cohort_result := 'professional';
  ELSIF user_profile.user_type = 'student' THEN
    cohort_result := 'student';
  ELSIF user_profile.user_type = 'investor' THEN
    cohort_result := 'investor';
  ELSE
    cohort_result := 'general';
  END IF;
  
  -- Add new user flag if recently onboarded (within 30 days)
  IF user_profile.onboarding_completed_at IS NOT NULL 
     AND user_profile.onboarding_completed_at > (now() - INTERVAL '30 days') THEN
    cohort_result := cohort_result || '_new';
  END IF;
  
  RETURN cohort_result;
END;
$$;