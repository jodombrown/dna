-- Drop and recreate get_conversation_messages with fixed column reference
DROP FUNCTION IF EXISTS get_conversation_messages(UUID, UUID, INT, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION get_conversation_messages(
  p_conversation_id UUID,
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_before_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  message_id UUID,
  sender_id UUID,
  sender_username TEXT,
  sender_full_name TEXT,
  sender_avatar_url TEXT,
  content TEXT,
  content_type VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  is_deleted BOOLEAN,
  delivered_at TIMESTAMPTZ,
  is_read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is participant (using explicit table alias to avoid ambiguity)
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id AND cp.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  RETURN QUERY
  SELECT
    m.id as message_id,
    m.sender_id,
    p.username as sender_username,
    p.full_name as sender_full_name,
    p.avatar_url as sender_avatar_url,
    m.content,
    m.content_type,
    m.metadata,
    m.created_at,
    m.is_deleted,
    m.delivered_at,
    EXISTS (
      SELECT 1 FROM message_read_receipts rr
      WHERE rr.message_id = m.id
        AND rr.user_id != m.sender_id
    ) as is_read
  FROM messages_new m
  INNER JOIN profiles p ON m.sender_id = p.id
  WHERE m.conversation_id = p_conversation_id
    AND (p_before_timestamp IS NULL OR m.created_at < p_before_timestamp)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Create a simple function to get conversation details by ID for direct lookup
CREATE OR REPLACE FUNCTION get_conversation_details(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_username TEXT,
  other_user_full_name TEXT,
  other_user_avatar_url TEXT,
  other_user_headline TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMPTZ,
  participant_status TEXT
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
    other_p.username as other_user_username,
    other_p.full_name as other_user_full_name,
    other_p.avatar_url as other_user_avatar_url,
    other_p.headline as other_user_headline,
    last_msg.content as last_message_content,
    c.last_message_at,
    my_cp.status as participant_status
  FROM conversations_new c
  INNER JOIN conversation_participants my_cp ON my_cp.conversation_id = c.id AND my_cp.user_id = p_user_id
  INNER JOIN conversation_participants other_cp ON other_cp.conversation_id = c.id AND other_cp.user_id != p_user_id
  INNER JOIN profiles other_p ON other_cp.user_id = other_p.id
  LEFT JOIN LATERAL (
    SELECT m.content
    FROM messages_new m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  WHERE c.id = p_conversation_id;
END;
$$;