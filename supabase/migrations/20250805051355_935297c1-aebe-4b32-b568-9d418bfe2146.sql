-- Phase 3 Sprint 1 Step 2: Automated Engagement Reminders Setup

-- Enable pg_cron extension (requires superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to find users eligible for reminders
CREATE OR REPLACE FUNCTION public.enqueue_reminders_for_all_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reminder_count INTEGER := 0;
  user_record RECORD;
  user_cohort TEXT;
  days_since_onboarding INTEGER;
  last_reminder_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Process users who completed onboarding but need engagement
  FOR user_record IN 
    SELECT 
      p.id as user_id,
      p.user_type,
      p.onboarding_completed_at,
      p.email,
      p.full_name,
      p.notification_preferences,
      COALESCE(p.last_seen_at, p.onboarding_completed_at) as last_activity
    FROM public.profiles p
    WHERE p.onboarding_completed_at IS NOT NULL
      AND p.onboarding_completed_at < (now() - INTERVAL '2 days') -- Allow 2-day grace period
      AND (p.notification_preferences->>'engagement_reminders')::boolean IS DISTINCT FROM false -- Opt-in or no preference set
  LOOP
    -- Calculate days since onboarding
    days_since_onboarding := EXTRACT(days FROM (now() - user_record.onboarding_completed_at));
    user_cohort := public.get_user_cohort(user_record.user_id);
    
    -- Check for 3-day reminder
    IF days_since_onboarding >= 3 AND days_since_onboarding < 7 THEN
      -- Check if 3-day reminder already sent
      SELECT MAX(scheduled_at) INTO last_reminder_date
      FROM public.reminder_logs 
      WHERE user_id = user_record.user_id 
        AND reminder_type = '3_day';
      
      IF last_reminder_date IS NULL OR last_reminder_date < (now() - INTERVAL '7 days') THEN
        INSERT INTO public.reminder_logs (
          user_id, reminder_type, scheduled_at, delivery_channel, 
          cohort, metadata
        ) VALUES (
          user_record.user_id,
          '3_day',
          now() + INTERVAL '10 minutes', -- Slight delay for processing
          'email',
          user_cohort,
          jsonb_build_object(
            'user_name', user_record.full_name,
            'user_type', user_record.user_type,
            'days_since_onboarding', days_since_onboarding,
            'last_activity', user_record.last_activity
          )
        );
        reminder_count := reminder_count + 1;
      END IF;
    END IF;
    
    -- Check for 7-day reminder
    IF days_since_onboarding >= 7 AND days_since_onboarding < 14 THEN
      SELECT MAX(scheduled_at) INTO last_reminder_date
      FROM public.reminder_logs 
      WHERE user_id = user_record.user_id 
        AND reminder_type = '7_day';
      
      IF last_reminder_date IS NULL OR last_reminder_date < (now() - INTERVAL '14 days') THEN
        INSERT INTO public.reminder_logs (
          user_id, reminder_type, scheduled_at, delivery_channel,
          cohort, metadata
        ) VALUES (
          user_record.user_id,
          '7_day', 
          now() + INTERVAL '15 minutes',
          'email',
          user_cohort,
          jsonb_build_object(
            'user_name', user_record.full_name,
            'user_type', user_record.user_type,
            'days_since_onboarding', days_since_onboarding,
            'last_activity', user_record.last_activity
          )
        );
        reminder_count := reminder_count + 1;
      END IF;
    END IF;
    
    -- Check for 14-day reminder
    IF days_since_onboarding >= 14 THEN
      SELECT MAX(scheduled_at) INTO last_reminder_date
      FROM public.reminder_logs 
      WHERE user_id = user_record.user_id 
        AND reminder_type = '14_day';
      
      IF last_reminder_date IS NULL OR last_reminder_date < (now() - INTERVAL '21 days') THEN
        INSERT INTO public.reminder_logs (
          user_id, reminder_type, scheduled_at, delivery_channel,
          cohort, metadata  
        ) VALUES (
          user_record.user_id,
          '14_day',
          now() + INTERVAL '20 minutes', 
          'email',
          user_cohort,
          jsonb_build_object(
            'user_name', user_record.full_name,
            'user_type', user_record.user_type, 
            'days_since_onboarding', days_since_onboarding,
            'last_activity', user_record.last_activity
          )
        );
        reminder_count := reminder_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  -- Log the enqueue operation
  INSERT INTO public.user_engagement_tracking (
    user_id, event_type, event_context
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- System user
    'reminders_enqueued',
    jsonb_build_object('reminder_count', reminder_count, 'enqueued_at', now())
  );
  
  RETURN reminder_count;
END;
$$;

-- Function to get pending reminders ready for sending  
CREATE OR REPLACE FUNCTION public.get_pending_reminders(batch_size INTEGER DEFAULT 50)
RETURNS TABLE (
  reminder_id UUID,
  user_id UUID,
  user_email TEXT,
  reminder_type TEXT,
  cohort TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rl.id as reminder_id,
    rl.user_id,
    p.email as user_email,
    rl.reminder_type,
    rl.cohort,
    rl.metadata
  FROM public.reminder_logs rl
  JOIN public.profiles p ON p.id = rl.user_id
  WHERE rl.status = 'pending'
    AND rl.scheduled_at <= now()
    AND p.email IS NOT NULL
    AND (p.notification_preferences->>'engagement_reminders')::boolean IS DISTINCT FROM false
  ORDER BY rl.scheduled_at ASC
  LIMIT batch_size;
END;
$$;

-- Function to mark reminder as sent/failed
CREATE OR REPLACE FUNCTION public.update_reminder_status(
  reminder_id UUID,
  new_status TEXT,
  error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.reminder_logs
  SET 
    status = new_status,
    sent_at = CASE WHEN new_status = 'sent' THEN now() ELSE sent_at END,
    metadata = CASE 
      WHEN error_message IS NOT NULL 
      THEN metadata || jsonb_build_object('error', error_message)
      ELSE metadata
    END
  WHERE id = reminder_id
    AND status = 'pending';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

-- Add notification preferences to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN notification_preferences JSONB DEFAULT jsonb_build_object(
      'engagement_reminders', true,
      'community_updates', true,
      'direct_messages', true
    );
  END IF;
END $$;

-- Schedule the daily cron job (runs at 1 PM UTC daily)
SELECT cron.schedule(
  'daily-engagement-reminders',
  '0 13 * * *',
  'SELECT public.enqueue_reminders_for_all_users();'
);