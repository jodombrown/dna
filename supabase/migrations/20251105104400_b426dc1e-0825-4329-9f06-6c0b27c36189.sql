-- Create RPC function to get user notifications with actor details
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_user_id UUID,
  p_unread_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  notification_id UUID,
  actor_id UUID,
  actor_username TEXT,
  actor_full_name TEXT,
  actor_avatar_url TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  action_url TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id AS notification_id,
    p.id AS actor_id,
    p.username AS actor_username,
    p.full_name AS actor_full_name,
    p.avatar_url AS actor_avatar_url,
    n.type,
    n.title,
    n.message,
    n.link_url AS action_url,
    'notification'::TEXT AS entity_type,
    n.id AS entity_id,
    n.is_read,
    n.created_at,
    CASE WHEN n.is_read THEN n.updated_at ELSE NULL END AS read_at
  FROM notifications n
  LEFT JOIN profiles p ON p.id = (n.payload->>'actor_id')::UUID
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create RPC function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(
  p_user_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_val BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO count_val
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false;
    
  RETURN COALESCE(count_val, 0);
END;
$$;

-- Create RPC function to mark specific notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true,
      read = true,
      updated_at = now()
  WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids);
END;
$$;

-- Create RPC function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true,
      read = true,
      updated_at = now()
  WHERE user_id = p_user_id
    AND is_read = false;
END;
$$;

-- Create helper function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't create notification if user is the actor
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    is_read,
    read,
    payload
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    false,
    false,
    jsonb_build_object(
      'actor_id', p_actor_id,
      'entity_type', p_entity_type,
      'entity_id', p_entity_id
    )
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Add notification for profile views (optional - only for first-time viewers)
CREATE OR REPLACE FUNCTION public.notify_profile_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_name TEXT;
  is_first_view BOOLEAN;
BEGIN
  -- Check if this is the first time this viewer viewed this profile
  SELECT NOT EXISTS (
    SELECT 1 FROM profile_views
    WHERE profile_id = NEW.profile_id
      AND viewer_id = NEW.viewer_id
      AND id != NEW.id
  ) INTO is_first_view;
  
  -- Only notify on first view
  IF is_first_view AND NEW.viewer_id IS NOT NULL THEN
    SELECT full_name INTO viewer_name FROM profiles WHERE id = NEW.viewer_id;
    
    PERFORM create_notification(
      NEW.profile_id,
      NEW.viewer_id,
      'profile_view',
      'Profile View',
      viewer_name || ' viewed your profile',
      '/dna/network?tab=connections',
      'profile',
      NEW.profile_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile view notifications
DROP TRIGGER IF EXISTS trigger_notify_profile_view ON profile_views;
CREATE TRIGGER trigger_notify_profile_view
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION notify_profile_view();