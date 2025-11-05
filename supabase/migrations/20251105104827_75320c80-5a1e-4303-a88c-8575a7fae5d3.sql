-- Add blocked_users table for user blocking functionality
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create their own blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Create index for faster lookups
CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- RPC function to remove/disconnect a connection
CREATE OR REPLACE FUNCTION public.remove_connection(
  p_connection_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_requester_id UUID;
  v_recipient_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get connection details
  SELECT requester_id, recipient_id
  INTO v_requester_id, v_recipient_id
  FROM connections
  WHERE id = p_connection_id;

  -- Verify user is part of this connection
  IF v_requester_id != v_user_id AND v_recipient_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized to remove this connection';
  END IF;

  -- Delete the connection
  DELETE FROM connections WHERE id = p_connection_id;
END;
$$;

-- RPC function to block a user
CREATE OR REPLACE FUNCTION public.block_user(
  p_blocked_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_user_id = p_blocked_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;

  -- Insert block record
  INSERT INTO blocked_users (blocker_id, blocked_id, reason)
  VALUES (v_user_id, p_blocked_user_id, p_reason)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- Remove any existing connections
  DELETE FROM connections
  WHERE (requester_id = v_user_id AND recipient_id = p_blocked_user_id)
     OR (requester_id = p_blocked_user_id AND recipient_id = v_user_id);

  -- Remove any pending connection requests
  DELETE FROM connections
  WHERE ((requester_id = v_user_id AND recipient_id = p_blocked_user_id)
     OR (requester_id = p_blocked_user_id AND recipient_id = v_user_id))
    AND status = 'pending';
END;
$$;

-- RPC function to unblock a user
CREATE OR REPLACE FUNCTION public.unblock_user(
  p_blocked_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM blocked_users
  WHERE blocker_id = v_user_id
    AND blocked_id = p_blocked_user_id;
END;
$$;

-- RPC function to check if a user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(
  p_user_id UUID,
  p_other_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = p_user_id AND blocked_id = p_other_user_id)
       OR (blocker_id = p_other_user_id AND blocked_id = p_user_id)
  );
END;
$$;

-- RPC function to get blocked users list
CREATE OR REPLACE FUNCTION public.get_blocked_users(
  p_user_id UUID
)
RETURNS TABLE (
  block_id UUID,
  blocked_user_id UUID,
  blocked_username TEXT,
  blocked_full_name TEXT,
  blocked_avatar_url TEXT,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.id AS block_id,
    bu.blocked_id AS blocked_user_id,
    p.username AS blocked_username,
    p.full_name AS blocked_full_name,
    p.avatar_url AS blocked_avatar_url,
    bu.reason,
    bu.created_at AS blocked_at
  FROM blocked_users bu
  INNER JOIN profiles p ON bu.blocked_id = p.id
  WHERE bu.blocker_id = p_user_id
  ORDER BY bu.created_at DESC;
END;
$$;

-- Update get_connection_status to account for blocks
CREATE OR REPLACE FUNCTION public.get_connection_status(user1_id uuid, user2_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conn_status TEXT;
  conn_requester UUID;
  is_blocked BOOLEAN;
BEGIN
  -- Check if either user has blocked the other
  SELECT is_user_blocked(user1_id, user2_id) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN 'blocked';
  END IF;

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