-- Fix security warnings by setting search_path on functions

DROP FUNCTION IF EXISTS get_connection_status(uuid, uuid);
DROP FUNCTION IF EXISTS get_mutual_connections(uuid, uuid);

CREATE OR REPLACE FUNCTION get_connection_status(user1_id UUID, user2_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conn_status TEXT;
  conn_requester UUID;
BEGIN
  SELECT status, sender_id INTO conn_status, conn_requester
  FROM connection_requests
  WHERE (sender_id = user1_id AND receiver_id = user2_id)
     OR (sender_id = user2_id AND receiver_id = user1_id)
  LIMIT 1;
  
  IF conn_status IS NULL THEN
    SELECT status INTO conn_status
    FROM connections
    WHERE ((a = user1_id AND b = user2_id) OR (a = user2_id AND b = user1_id))
      AND status = 'accepted'
    LIMIT 1;
    
    IF conn_status = 'accepted' THEN
      RETURN 'accepted';
    END IF;
    
    RETURN 'none';
  END IF;
  
  IF conn_status = 'accepted' THEN
    RETURN 'accepted';
  END IF;
  
  IF conn_status = 'declined' THEN
    RETURN 'declined';
  END IF;
  
  IF conn_status = 'pending' THEN
    IF conn_requester = user1_id THEN
      RETURN 'pending_sent';
    ELSE
      RETURN 'pending_received';
    END IF;
  END IF;
  
  RETURN 'none';
END;
$$;

CREATE OR REPLACE FUNCTION get_mutual_connections(user1_id UUID, user2_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline
  FROM profiles p
  INNER JOIN connections c1 ON (
    (c1.a = user1_id AND c1.b = p.id)
    OR (c1.b = user1_id AND c1.a = p.id)
  )
  INNER JOIN connections c2 ON (
    (c2.a = user2_id AND c2.b = p.id)
    OR (c2.b = user2_id AND c2.a = p.id)
  )
  WHERE c1.status = 'accepted'
    AND c2.status = 'accepted'
    AND p.id != user1_id
    AND p.id != user2_id
  ORDER BY p.full_name
  LIMIT 10;
END;
$$;