-- Drop existing functions first
DROP FUNCTION IF EXISTS get_connection_status(uuid, uuid);
DROP FUNCTION IF EXISTS get_mutual_connections(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_connections(uuid, text, int, int);
DROP FUNCTION IF EXISTS get_connection_requests(uuid);

-- Drop old tables
DROP TABLE IF EXISTS connection_requests CASCADE;
DROP TABLE IF EXISTS connections CASCADE;

-- =====================================================
-- CONNECTIONS TABLE
-- =====================================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT CHECK (length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT no_self_connection CHECK (requester_id != recipient_id),
  CONSTRAINT unique_connection UNIQUE (requester_id, recipient_id)
);

CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created ON connections(created_at DESC);

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING ((SELECT auth.uid()) = requester_id OR (SELECT auth.uid()) = recipient_id);

CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY "Recipients can update connection status"
  ON connections FOR UPDATE
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================
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
  SELECT status, requester_id INTO conn_status, conn_requester
  FROM connections
  WHERE (requester_id = user1_id AND recipient_id = user2_id)
     OR (requester_id = user2_id AND recipient_id = user1_id)
  LIMIT 1;
  
  IF conn_status IS NULL THEN RETURN 'none'; END IF;
  IF conn_status = 'accepted' THEN RETURN 'accepted'; END IF;
  IF conn_status = 'declined' THEN RETURN 'declined'; END IF;
  
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
    (c1.requester_id = user1_id AND c1.recipient_id = p.id)
    OR (c1.recipient_id = user1_id AND c1.requester_id = p.id)
  )
  INNER JOIN connections c2 ON (
    (c2.requester_id = user2_id AND c2.recipient_id = p.id)
    OR (c2.recipient_id = user2_id AND c2.requester_id = p.id)
  )
  WHERE c1.status = 'accepted'
    AND c2.status = 'accepted'
    AND p.id != user1_id
    AND p.id != user2_id
  ORDER BY p.full_name
  LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_connections(
  user_id UUID,
  search_query TEXT DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  location TEXT,
  professional_role TEXT,
  connected_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline,
    p.location,
    p.professional_role,
    c.created_at as connected_at
  FROM profiles p
  INNER JOIN connections c ON (
    (c.requester_id = user_id AND c.recipient_id = p.id)
    OR (c.recipient_id = user_id AND c.requester_id = p.id)
  )
  WHERE c.status = 'accepted'
    AND (
      search_query IS NULL 
      OR p.full_name ILIKE '%' || search_query || '%'
      OR p.headline ILIKE '%' || search_query || '%'
    )
  ORDER BY c.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_connection_requests(user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  requester_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  location TEXT,
  professional_role TEXT,
  message TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as connection_id,
    p.id as requester_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline,
    p.location,
    p.professional_role,
    c.message,
    c.created_at
  FROM connections c
  INNER JOIN profiles p ON c.requester_id = p.id
  WHERE c.recipient_id = user_id
    AND c.status = 'pending'
  ORDER BY c.created_at DESC;
END;
$$;