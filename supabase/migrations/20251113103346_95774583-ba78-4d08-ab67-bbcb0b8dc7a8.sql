-- Fix search_path security warnings for all ADIN and mutual connections functions

-- Update get_users_needing_connection_nudges with security definer search_path
CREATE OR REPLACE FUNCTION get_users_needing_connection_nudges()
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  username TEXT,
  connections_count INT,
  account_age_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.username,
    COALESCE(
      (SELECT COUNT(*)::INT 
       FROM connections c 
       WHERE (c.requester_id = p.id OR c.recipient_id = p.id) 
       AND c.status = 'accepted'
      ), 0
    ) as connections_count,
    EXTRACT(DAY FROM (NOW() - p.created_at))::INT as account_age_days
  FROM profiles p
  WHERE p.created_at <= NOW() - INTERVAL '3 days'
    AND p.profile_completion_percentage >= 40
    AND NOT EXISTS (
      SELECT 1 FROM connections c 
      WHERE (c.requester_id = p.id OR c.recipient_id = p.id) 
      AND c.status = 'accepted'
    )
    AND NOT EXISTS (
      SELECT 1 FROM adin_nudges n
      WHERE n.user_id = p.id
      AND n.nudge_type = 'first_connections'
      AND n.created_at > NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_inactive_users_for_reengagement with security definer search_path
CREATE OR REPLACE FUNCTION get_inactive_users_for_reengagement(
  p_days_inactive INT DEFAULT 7
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  username TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  days_inactive INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.username,
    p.last_seen_at,
    EXTRACT(DAY FROM (NOW() - p.last_seen_at))::INT as days_inactive
  FROM profiles p
  WHERE p.last_seen_at IS NOT NULL
    AND p.last_seen_at <= NOW() - MAKE_INTERVAL(days => p_days_inactive)
    AND p.profile_completion_percentage >= 40
    AND NOT EXISTS (
      SELECT 1 FROM adin_nudges n
      WHERE n.user_id = p.id
      AND n.nudge_type = 'reengagement'
      AND n.created_at > NOW() - INTERVAL '14 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_mutual_connections with security definer search_path
CREATE OR REPLACE FUNCTION get_mutual_connections(
  p_viewer_id UUID,
  p_target_user_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline
  FROM profiles p
  WHERE p.id IN (
    SELECT CASE 
      WHEN c1.requester_id = p_viewer_id THEN c1.recipient_id
      ELSE c1.requester_id
    END
    FROM connections c1
    WHERE (c1.requester_id = p_viewer_id OR c1.recipient_id = p_viewer_id)
      AND c1.status = 'accepted'
  )
  AND p.id IN (
    SELECT CASE 
      WHEN c2.requester_id = p_target_user_id THEN c2.recipient_id
      ELSE c2.requester_id
    END
    FROM connections c2
    WHERE (c2.requester_id = p_target_user_id OR c2.recipient_id = p_target_user_id)
      AND c2.status = 'accepted'
  )
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (bu.blocker_id = p_viewer_id AND bu.blocked_id = p.id)
       OR (bu.blocker_id = p.id AND bu.blocked_id = p_viewer_id)
  )
  ORDER BY p.full_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;