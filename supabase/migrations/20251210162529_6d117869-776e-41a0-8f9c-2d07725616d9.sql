-- Simplify conversation_participants RLS to avoid recursion
DROP POLICY IF EXISTS "cp_select_own_conversations" ON conversation_participants;

-- Simple policy: you can see participant records where you are a participant
-- To see other participants in your conversations, we'll use SECURITY DEFINER functions
CREATE POLICY "cp_select_own_records" ON conversation_participants
FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- Update get_conversation_details to be SECURITY DEFINER so it can bypass RLS
DROP FUNCTION IF EXISTS get_conversation_details(uuid, uuid);

CREATE OR REPLACE FUNCTION get_conversation_details(p_conversation_id uuid, p_user_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_user_username text,
  other_user_full_name text,
  other_user_avatar_url text,
  other_user_headline text,
  last_message_content text,
  last_message_at timestamptz,
  participant_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user is actually a participant in this conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  ) THEN
    RETURN; -- Return empty if not a participant
  END IF;

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

-- Also update get_user_conversations to be SECURITY DEFINER
DROP FUNCTION IF EXISTS get_user_conversations(uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_user_username text,
  other_user_full_name text,
  other_user_avatar_url text,
  other_user_headline text,
  last_message_content text,
  last_message_at timestamptz,
  unread_count bigint,
  participant_status text,
  is_muted boolean,
  is_pinned boolean,
  origin_type text,
  origin_id uuid,
  origin_metadata jsonb,
  last_message_preview text
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
    COALESCE(unread.count, 0)::bigint as unread_count,
    my_cp.status as participant_status,
    COALESCE(my_cp.is_muted, false) as is_muted,
    COALESCE(my_cp.is_pinned, false) as is_pinned,
    NULL::text as origin_type,
    NULL::uuid as origin_id,
    NULL::jsonb as origin_metadata,
    last_msg.content as last_message_preview
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
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages_new m
    WHERE m.conversation_id = c.id
    AND m.sender_id != p_user_id
    AND m.created_at > my_cp.last_read_at
  ) unread ON true
  ORDER BY c.last_message_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;