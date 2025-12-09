-- Update the original get_or_create_conversation RPC to support message requests
--
-- Previously, this function required users to be connected before messaging.
-- Now it allows non-connected users to send message requests (pending status).
-- This ensures all existing UI code that calls this function works with the new system.

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  connection_exists BOOLEAN;
  is_blocked BOOLEAN;
BEGIN
  -- Check if either user has blocked the other
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE ((user_id = user1_id AND target_user_id = user2_id)
       OR (user_id = user2_id AND target_user_id = user1_id))
      AND restriction_type = 'block'
  ) INTO is_blocked;

  IF is_blocked THEN
    RAISE EXCEPTION 'Cannot message this user';
  END IF;

  -- Check if users are connected
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE ((requester_id = user1_id AND recipient_id = user2_id) OR
           (requester_id = user2_id AND recipient_id = user1_id))
      AND status = 'accepted'
  ) INTO connection_exists;

  -- Check if conversation already exists
  SELECT c.id INTO conversation_id
  FROM conversations_new c
  INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND (
      SELECT COUNT(*) FROM conversation_participants
      WHERE conversation_id = c.id
    ) = 2
  LIMIT 1;

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO conversations_new (type)
    VALUES ('direct')
    RETURNING id INTO conversation_id;

    -- Add participants with appropriate status based on connection
    IF connection_exists THEN
      -- Connected users: both active
      INSERT INTO conversation_participants (conversation_id, user_id, status)
      VALUES
        (conversation_id, user1_id, 'active'),
        (conversation_id, user2_id, 'active');
    ELSE
      -- Not connected: initiator active, recipient pending (message request)
      INSERT INTO conversation_participants (conversation_id, user_id, status)
      VALUES
        (conversation_id, user1_id, 'active'),
        (conversation_id, user2_id, 'pending');
    END IF;
  END IF;

  RETURN conversation_id;
END;
$$;
