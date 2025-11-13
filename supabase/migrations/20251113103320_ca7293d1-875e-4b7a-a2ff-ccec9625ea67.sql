-- =========================================
-- Mutual Connections RPC for Social Proof
-- =========================================

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
  -- Return users who are connected to both the viewer and the target user
  -- Exclude blocked users in either direction
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline
  FROM profiles p
  WHERE p.id IN (
    -- Users connected to viewer
    SELECT CASE 
      WHEN c1.requester_id = p_viewer_id THEN c1.recipient_id
      ELSE c1.requester_id
    END
    FROM connections c1
    WHERE (c1.requester_id = p_viewer_id OR c1.recipient_id = p_viewer_id)
      AND c1.status = 'accepted'
  )
  AND p.id IN (
    -- Users connected to target
    SELECT CASE 
      WHEN c2.requester_id = p_target_user_id THEN c2.recipient_id
      ELSE c2.requester_id
    END
    FROM connections c2
    WHERE (c2.requester_id = p_target_user_id OR c2.recipient_id = p_target_user_id)
      AND c2.status = 'accepted'
  )
  -- Exclude blocked users
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (bu.blocker_id = p_viewer_id AND bu.blocked_id = p.id)
       OR (bu.blocker_id = p.id AND bu.blocked_id = p_viewer_id)
  )
  ORDER BY p.full_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_mutual_connections(UUID, UUID, INT) TO authenticated;