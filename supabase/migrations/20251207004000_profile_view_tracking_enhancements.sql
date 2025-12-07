-- Migration: Profile View Tracking Enhancements
-- Adds function to record profile views and notifications

-- Create function to record a profile view
CREATE OR REPLACE FUNCTION public.record_profile_view(
  p_viewer_id UUID,
  p_profile_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_view TIMESTAMP WITH TIME ZONE;
  v_should_notify BOOLEAN := false;
BEGIN
  -- Don't record if viewing own profile
  IF p_viewer_id = p_profile_id THEN
    RETURN;
  END IF;

  -- Check last view time to prevent spam (only record if >1 hour since last view)
  SELECT MAX(viewed_at) INTO v_last_view
  FROM profile_views
  WHERE viewer_id = p_viewer_id
    AND profile_id = p_profile_id;

  IF v_last_view IS NULL OR v_last_view < (NOW() - INTERVAL '1 hour') THEN
    -- Record the view
    INSERT INTO profile_views (viewer_id, profile_id, viewed_at)
    VALUES (p_viewer_id, p_profile_id, NOW());

    -- Only notify on first view of the day
    IF v_last_view IS NULL OR v_last_view < (NOW() - INTERVAL '24 hours') THEN
      v_should_notify := true;
    END IF;

    -- Create notification if appropriate
    IF v_should_notify THEN
      INSERT INTO notifications (
        recipient_id,
        actor_id,
        action_type,
        target_type,
        target_id
      )
      VALUES (
        p_profile_id,
        p_viewer_id,
        'profile_view',
        'user',
        p_viewer_id
      )
      ON CONFLICT (recipient_id, actor_id, action_type, target_type, target_id)
      DO UPDATE SET created_at = NOW();
    END IF;
  END IF;
END;
$$;

-- Add profile_view to notification action types if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notifications_action_type_check'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_action_type_check
      CHECK (action_type IN (
        'like', 'comment', 'follow', 'tag', 'reaction', 'mention',
        'reshare', 'connection_request', 'connection_accepted', 'profile_view'
      ));
  ELSE
    -- Drop existing constraint and recreate with profile_view
    ALTER TABLE notifications
      DROP CONSTRAINT IF EXISTS notifications_action_type_check;

    ALTER TABLE notifications
      ADD CONSTRAINT notifications_action_type_check
      CHECK (action_type IN (
        'like', 'comment', 'follow', 'tag', 'reaction', 'mention',
        'reshare', 'connection_request', 'connection_accepted', 'profile_view'
      ));
  END IF;
END $$;

-- Create function to get profile view count
CREATE OR REPLACE FUNCTION public.get_profile_view_count(
  p_profile_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_views BIGINT,
  unique_viewers BIGINT,
  views_today BIGINT,
  views_this_week BIGINT,
  views_this_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_views,
    COUNT(DISTINCT viewer_id)::BIGINT AS unique_viewers,
    COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE)::BIGINT AS views_today,
    COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT AS views_this_week,
    COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT AS views_this_month
  FROM profile_views
  WHERE profile_id = p_profile_id
    AND viewed_at >= (NOW() - (p_days || ' days')::INTERVAL);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.record_profile_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_view_count TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.record_profile_view IS 'Records a profile view with spam prevention (max 1 per hour) and notification (max 1 per day)';
COMMENT ON FUNCTION public.get_profile_view_count IS 'Returns profile view statistics including total, unique viewers, and time-based breakdowns';
