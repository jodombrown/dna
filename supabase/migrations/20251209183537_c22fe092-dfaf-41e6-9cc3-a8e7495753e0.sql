-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_or_create_conversation(uuid, uuid);

-- Create get_or_create_conversation function for direct messaging
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user_id uuid,
  p_other_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Check if conversation already exists between these two users
  SELECT c.id INTO v_conversation_id
  FROM conversations_new c
  WHERE EXISTS (
    SELECT 1 FROM conversation_participants cp1 
    WHERE cp1.conversation_id = c.id AND cp1.user_id = p_user_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = c.id AND cp2.user_id = p_other_user_id
  )
  AND (
    SELECT COUNT(*) FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id
  ) = 2
  LIMIT 1;

  -- If no conversation exists, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations_new (id, created_at, updated_at, last_message_at)
    VALUES (gen_random_uuid(), now(), now(), now())
    RETURNING id INTO v_conversation_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at)
    VALUES 
      (v_conversation_id, p_user_id, now(), now()),
      (v_conversation_id, p_other_user_id, now(), now());
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Create send_message function
CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
BEGIN
  -- Verify sender is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = p_conversation_id AND user_id = p_sender_id
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Insert the message
  INSERT INTO messages_new (id, conversation_id, sender_id, content, created_at)
  VALUES (gen_random_uuid(), p_conversation_id, p_sender_id, p_content, now())
  RETURNING id INTO v_message_id;

  -- Update conversation last_message_at
  UPDATE conversations_new 
  SET last_message_at = now(), updated_at = now()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

-- Create function to get conversations with last message preview
CREATE OR REPLACE FUNCTION public.get_user_conversations_with_preview(
  p_user_id uuid
)
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  other_user_username text,
  last_message_content text,
  last_message_at timestamptz,
  last_message_sender_id uuid,
  unread_count bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    other_p.id as other_user_id,
    other_p.full_name as other_user_name,
    other_p.avatar_url as other_user_avatar,
    other_p.username as other_user_username,
    latest_msg.content as last_message_content,
    c.last_message_at,
    latest_msg.sender_id as last_message_sender_id,
    COALESCE(unread.count, 0) as unread_count,
    c.created_at
  FROM conversations_new c
  INNER JOIN conversation_participants my_cp ON my_cp.conversation_id = c.id AND my_cp.user_id = p_user_id
  INNER JOIN conversation_participants other_cp ON other_cp.conversation_id = c.id AND other_cp.user_id != p_user_id
  INNER JOIN profiles other_p ON other_p.id = other_cp.user_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.sender_id
    FROM messages_new m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) latest_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages_new m
    WHERE m.conversation_id = c.id 
    AND m.sender_id != p_user_id
    AND m.created_at > my_cp.last_read_at
  ) unread ON true
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Create function to check if user can message another user
CREATE OR REPLACE FUNCTION public.can_message_user(
  p_sender_id uuid,
  p_recipient_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if blocked
  IF EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (blocker_id = p_recipient_id AND blocked_id = p_sender_id)
    OR (blocker_id = p_sender_id AND blocked_id = p_recipient_id)
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_message(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversations_with_preview(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_message_user(uuid, uuid) TO authenticated;