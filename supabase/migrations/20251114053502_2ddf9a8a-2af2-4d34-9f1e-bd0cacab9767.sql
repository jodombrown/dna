-- Add event_reminders preference to notification_preferences if not exists
DO $$
BEGIN
  -- Update existing profiles to include event_reminders in notification_preferences
  UPDATE public.profiles
  SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || '{"event_reminders": true}'::jsonb
  WHERE notification_preferences IS NULL 
     OR NOT notification_preferences ? 'event_reminders';
END $$;

-- Set default for new profiles
ALTER TABLE public.profiles 
ALTER COLUMN notification_preferences 
SET DEFAULT jsonb_build_object(
  'engagement_reminders', true,
  'community_updates', true,
  'direct_messages', true,
  'event_reminders', true
);