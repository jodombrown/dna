-- PRD 3B Part 1: Connection Request System RPC Functions

-- Get connection status between two users
CREATE OR REPLACE FUNCTION get_connection_status(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_request_status text;
  v_sender_id uuid;
  v_connection_status text;
BEGIN
  -- Check for existing connection request
  SELECT status, sender_id INTO v_request_status, v_sender_id
  FROM connection_requests
  WHERE 
    (sender_id = p_user1_id AND receiver_id = p_user2_id)
    OR (sender_id = p_user2_id AND receiver_id = p_user1_id)
  LIMIT 1;
  
  -- Check for accepted connection
  SELECT status INTO v_connection_status
  FROM connections
  WHERE 
    (a = p_user1_id AND b = p_user2_id)
    OR (a = p_user2_id AND b = p_user1_id)
  LIMIT 1;
  
  -- Return status
  IF v_connection_status = 'accepted' THEN
    RETURN 'accepted';
  ELSIF v_request_status = 'rejected' THEN
    RETURN 'declined';
  ELSIF v_request_status = 'pending' AND v_sender_id = p_user1_id THEN
    RETURN 'pending_sent';
  ELSIF v_request_status = 'pending' AND v_sender_id = p_user2_id THEN
    RETURN 'pending_received';
  ELSE
    RETURN 'none';
  END IF;
END;
$$;

-- Get mutual connections between two users
CREATE OR REPLACE FUNCTION get_mutual_connections(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  headline text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user1_connections AS (
    SELECT 
      CASE 
        WHEN a = p_user1_id THEN b
        ELSE a
      END as connection_id
    FROM connections
    WHERE (a = p_user1_id OR b = p_user1_id)
      AND status = 'accepted'
  ),
  user2_connections AS (
    SELECT 
      CASE 
        WHEN a = p_user2_id THEN b
        ELSE a
      END as connection_id
    FROM connections
    WHERE (a = p_user2_id OR b = p_user2_id)
      AND status = 'accepted'
  )
  SELECT DISTINCT 
    p.id, 
    p.full_name, 
    p.username, 
    p.avatar_url, 
    p.headline
  FROM profiles p
  INNER JOIN user1_connections u1 ON p.id = u1.connection_id
  INNER JOIN user2_connections u2 ON p.id = u2.connection_id
  WHERE p.id NOT IN (p_user1_id, p_user2_id)
  LIMIT 10;
END;
$$;

-- Get user's accepted connections
CREATE OR REPLACE FUNCTION get_user_connections(
  p_user_id uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  headline text,
  location text,
  connected_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.headline,
    p.location,
    c.created_at as connected_at
  FROM profiles p
  INNER JOIN connections c
    ON (
      (c.a = p_user_id AND c.b = p.id)
      OR (c.b = p_user_id AND c.a = p.id)
    )
    AND c.status = 'accepted'
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get pending connection requests (received by user)
CREATE OR REPLACE FUNCTION get_connection_requests(
  p_user_id uuid
)
RETURNS TABLE (
  connection_id uuid,
  requester_id uuid,
  requester_name text,
  requester_username text,
  requester_avatar text,
  requester_headline text,
  message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id as connection_id,
    p.id as requester_id,
    p.full_name as requester_name,
    p.username as requester_username,
    p.avatar_url as requester_avatar,
    p.headline as requester_headline,
    cr.message,
    cr.created_at
  FROM connection_requests cr
  INNER JOIN profiles p ON cr.sender_id = p.id
  WHERE cr.receiver_id = p_user_id
    AND cr.status = 'pending'
  ORDER BY cr.created_at DESC;
END;
$$;