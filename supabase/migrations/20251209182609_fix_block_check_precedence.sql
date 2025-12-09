-- Fix operator precedence bug in block checks
--
-- The original queries had:
--   WHERE (cond1) OR (cond2) AND restriction_type = 'block'
--
-- Due to AND having higher precedence than OR, this parsed as:
--   WHERE (cond1) OR ((cond2) AND restriction_type = 'block')
--
-- This caused mute restrictions to incorrectly trigger the block check.
-- Fix: Add parentheses around the OR clause.

-- Fix can_message_user function
CREATE OR REPLACE FUNCTION can_message_user(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS TABLE (
  can_message BOOLEAN,
  is_connected BOOLEAN,
  is_blocked BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_connected BOOLEAN;
  v_is_blocked BOOLEAN;
BEGIN
  -- Check if blocked (fixed: parentheses around OR clause)
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE ((user_id = p_user_id AND target_user_id = p_target_user_id)
       OR (user_id = p_target_user_id AND target_user_id = p_user_id))
      AND restriction_type = 'block'
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN QUERY SELECT false, false, true, 'User is blocked'::TEXT;
    RETURN;
  END IF;

  -- Check if connected
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE ((requester_id = p_user_id AND recipient_id = p_target_user_id) OR
           (requester_id = p_target_user_id AND recipient_id = p_user_id))
      AND status = 'accepted'
  ) INTO v_is_connected;

  IF v_is_connected THEN
    RETURN QUERY SELECT true, true, false, 'Connected - can message directly'::TEXT;
  ELSE
    -- Can send message request
    RETURN QUERY SELECT true, false, false, 'Not connected - will send message request'::TEXT;
  END IF;
END;
$$;

-- Fix get_or_create_conversation_contextual function
CREATE OR REPLACE FUNCTION get_or_create_conversation_contextual(
  p_user1_id UUID,
  p_user2_id UUID,
  p_origin_type VARCHAR DEFAULT NULL,
  p_origin_id UUID DEFAULT NULL,
  p_origin_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_connection_exists BOOLEAN;
  v_is_blocked BOOLEAN;
BEGIN
  -- Check if either user has blocked the other (fixed: parentheses around OR clause)
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE ((user_id = p_user1_id AND target_user_id = p_user2_id)
       OR (user_id = p_user2_id AND target_user_id = p_user1_id))
      AND restriction_type = 'block'
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'Cannot message this user';
  END IF;

  -- Check if users are connected
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE ((requester_id = p_user1_id AND recipient_id = p_user2_id) OR
           (requester_id = p_user2_id AND recipient_id = p_user1_id))
      AND status = 'accepted'
  ) INTO v_connection_exists;

  -- Check if conversation already exists
  SELECT c.id INTO v_conversation_id
  FROM conversations_new c
  INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id = p_user1_id
    AND cp2.user_id = p_user2_id
    AND (
      SELECT COUNT(*) FROM conversation_participants
      WHERE conversation_id = c.id
    ) = 2
  LIMIT 1;

  -- If conversation doesn't exist, create it
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations_new (
      type,
      origin_type,
      origin_id,
      origin_metadata
    )
    VALUES (
      'direct',
      p_origin_type,
      p_origin_id,
      p_origin_metadata
    )
    RETURNING id INTO v_conversation_id;

    -- Add participants with appropriate status
    IF v_connection_exists THEN
      -- Connected users: both active
      INSERT INTO conversation_participants (conversation_id, user_id, status)
      VALUES
        (v_conversation_id, p_user1_id, 'active'),
        (v_conversation_id, p_user2_id, 'active');
    ELSE
      -- Not connected: initiator active, recipient pending (message request)
      INSERT INTO conversation_participants (conversation_id, user_id, status)
      VALUES
        (v_conversation_id, p_user1_id, 'active'),
        (v_conversation_id, p_user2_id, 'pending');
    END IF;
  END IF;

  RETURN v_conversation_id;
END;
$$;
