-- Fix IDOR (insecure direct object reference) across SECURITY DEFINER RPCs
-- that accept a caller-identifying parameter (p_user_id / p_profile_id) but
-- never verify it matches the actual authenticated caller.
--
-- Background: these functions run with the definer's privileges and bypass
-- RLS entirely. Historically their only "access control" was an internal
-- check that the *supplied* p_user_id is a participant/owner of the target
-- row -- but since p_user_id is attacker-controlled, any authenticated
-- caller could pass another user's UUID (trivially discoverable from post
-- authorship, comments, profile URLs, etc.) and read that user's private
-- conversations, messages, notifications, drafts, blocked-users list, or
-- profile-viewer list.
--
-- Fix: every function below now rejects the call outright unless the
-- supplied identifying parameter matches auth.uid(). No signatures or
-- return types change, so this is a drop-in, non-breaking replacement for
-- every legitimate caller (which already always passes the caller's own id).
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding C1.

-- 1. get_user_conversations
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
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
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

-- 2. get_conversation_messages
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
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
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

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

-- 3. get_conversation_details
CREATE OR REPLACE FUNCTION public.get_conversation_details(p_conversation_id uuid, p_user_id uuid)
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
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

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

-- 4. get_message_requests
CREATE OR REPLACE FUNCTION public.get_message_requests(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  conversation_id UUID,
  origin_type VARCHAR,
  origin_metadata JSONB,
  requester_id UUID,
  requester_username TEXT,
  requester_full_name TEXT,
  requester_avatar_url TEXT,
  requester_headline TEXT,
  preview_content TEXT,
  requested_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    c.id as conversation_id,
    c.origin_type,
    c.origin_metadata,
    p.id as requester_id,
    p.username as requester_username,
    p.full_name as requester_full_name,
    p.avatar_url as requester_avatar_url,
    p.headline as requester_headline,
    LEFT(m.content, 150) as preview_content, -- Limited preview per PRD
    c.created_at as requested_at
  FROM conversations_new c
  INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
  INNER JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id
  INNER JOIN profiles p ON cp_other.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT content
    FROM messages_new
    WHERE conversation_id = c.id
    ORDER BY created_at ASC
    LIMIT 1
  ) m ON true
  WHERE cp.user_id = p_user_id
    AND cp.status = 'pending'
    AND cp_other.user_id != p_user_id
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM user_restrictions ur
      WHERE ur.user_id = p_user_id
        AND ur.target_user_id = cp_other.user_id
        AND ur.restriction_type = 'block'
    )
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 5. get_user_notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_user_id uuid,
  p_unread_only boolean DEFAULT false,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  notification_id uuid,
  actor_id uuid,
  actor_username text,
  actor_full_name text,
  actor_avatar_url text,
  type text,
  title text,
  message text,
  action_url text,
  entity_type text,
  entity_id uuid,
  read boolean,
  is_read boolean,
  created_at timestamp with time zone,
  read_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    n.id AS notification_id,
    p.id AS actor_id,
    p.username AS actor_username,
    p.full_name AS actor_full_name,
    p.avatar_url AS actor_avatar_url,
    n.type,
    n.title,
    n.message,
    n.link_url AS action_url,
    COALESCE(n.payload->>'entity_type', 'notification')::TEXT AS entity_type,
    COALESCE(
      (n.payload->>'entity_id')::UUID,
      (n.payload->>'post_id')::UUID,
      n.id
    ) AS entity_id,
    n.read,
    n.read AS is_read,
    n.created_at,
    CASE WHEN n.read THEN n.updated_at ELSE NULL END AS read_at
  FROM notifications n
  LEFT JOIN profiles p ON p.id = COALESCE(
    (n.payload->>'actor_id')::UUID,
    (n.payload->>'commenter_id')::UUID,
    (n.payload->>'sender_id')::UUID,
    (n.payload->>'from_user_id')::UUID,
    (n.payload->>'requester_id')::UUID,
    (n.payload->>'liker_id')::UUID
  )
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- 6. get_blocked_users
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
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

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

-- 7. get_profile_viewers (identifying parameter is p_profile_id, not p_user_id)
CREATE OR REPLACE FUNCTION public.get_profile_viewers(
  p_profile_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  viewer_id UUID,
  viewer_username TEXT,
  viewer_full_name TEXT,
  viewer_avatar_url TEXT,
  viewer_headline TEXT,
  view_count BIGINT,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_profile_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    pv.viewer_id,
    p.username AS viewer_username,
    p.full_name AS viewer_full_name,
    p.avatar_url AS viewer_avatar_url,
    p.headline AS viewer_headline,
    COUNT(pv.id) AS view_count,
    MAX(pv.viewed_at) AS last_viewed_at,
    EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_profile_id AND c.recipient_id = pv.viewer_id)
         OR (c.recipient_id = p_profile_id AND c.requester_id = pv.viewer_id))
        AND c.status = 'accepted'
    ) AS is_connected
  FROM profile_views pv
  INNER JOIN profiles p ON pv.viewer_id = p.id
  WHERE pv.profile_id = p_profile_id
    AND pv.viewer_id IS NOT NULL
    AND pv.viewer_id != p_profile_id
  GROUP BY pv.viewer_id, p.username, p.full_name, p.avatar_url, p.headline
  ORDER BY last_viewed_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 8. get_user_drafts
CREATE OR REPLACE FUNCTION public.get_user_drafts(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  post_type TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.post_type,
    d.media_urls,
    d.created_at,
    d.updated_at
  FROM draft_posts d
  WHERE d.author_id = p_user_id
  ORDER BY d.updated_at DESC
  LIMIT p_limit;
END;
$$;
