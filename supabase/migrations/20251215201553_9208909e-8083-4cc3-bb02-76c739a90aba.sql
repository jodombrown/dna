-- Drop existing function first to allow return type change
DROP FUNCTION IF EXISTS public.get_user_conversations(uuid, integer, integer);

-- Recreate get_user_conversations with is_archived
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE(
  conversation_id uuid, 
  other_user_id uuid, 
  other_user_username text, 
  other_user_full_name text, 
  other_user_avatar_url text, 
  other_user_headline text, 
  last_message_content text, 
  last_message_at timestamp with time zone, 
  unread_count bigint, 
  participant_status text, 
  is_muted boolean, 
  is_pinned boolean,
  is_archived boolean,
  origin_type text, 
  origin_id uuid, 
  origin_metadata jsonb, 
  last_message_preview text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    COALESCE(my_cp.is_archived, false) as is_archived,
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