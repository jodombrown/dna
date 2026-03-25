-- =============================================================
-- Messaging Group Chat: Schema enhancements + missing RPCs
-- =============================================================

-- 1. Add missing columns to messages_new for media, typing, replies
ALTER TABLE public.messages_new
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages_new(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Add check constraint separately (IF NOT EXISTS not supported for constraints)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_new_message_type_check'
  ) THEN
    ALTER TABLE public.messages_new ADD CONSTRAINT messages_new_message_type_check
      CHECK (message_type IN ('text', 'media', 'system'));
  END IF;
END $$;

-- Unique constraint for deduplication by client_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_new_client_id
  ON public.messages_new(conversation_id, client_id)
  WHERE client_id IS NOT NULL;

-- 2. Add description and avatar columns to conversations_new for group info
ALTER TABLE public.conversations_new
  ADD COLUMN IF NOT EXISTS description text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT NULL;

-- 3. RPC: update_group_read_cursor
CREATE OR REPLACE FUNCTION public.update_group_read_cursor(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();
END;
$$;

-- 4. RPC: get_group_unread_count
CREATE OR REPLACE FUNCTION public.get_group_unread_count(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_read timestamptz;
  v_count integer;
BEGIN
  SELECT last_read_at INTO v_last_read
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();

  IF v_last_read IS NULL THEN
    SELECT count(*)::integer INTO v_count
    FROM messages_new
    WHERE conversation_id = p_conversation_id
      AND sender_id != auth.uid()
      AND is_deleted = false;
  ELSE
    SELECT count(*)::integer INTO v_count
    FROM messages_new
    WHERE conversation_id = p_conversation_id
      AND sender_id != auth.uid()
      AND is_deleted = false
      AND created_at > v_last_read;
  END IF;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- 5. RPC: update_group_info
CREATE OR REPLACE FUNCTION public.update_group_info(
  p_conversation_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_participant boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;

  UPDATE conversations_new
  SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = p_conversation_id
    AND conversation_type = 'group';
END;
$$;

-- 6. RPC: soft_delete_group_message
CREATE OR REPLACE FUNCTION public.soft_delete_group_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id uuid;
  v_conversation_id uuid;
  v_is_creator boolean;
BEGIN
  SELECT sender_id, conversation_id INTO v_sender_id, v_conversation_id
  FROM messages_new
  WHERE id = p_message_id;

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Message not found';
  END IF;

  IF v_sender_id = auth.uid() THEN
    UPDATE messages_new SET is_deleted = true, deleted_at = now() WHERE id = p_message_id;
    RETURN;
  END IF;

  SELECT (created_by = auth.uid()) INTO v_is_creator
  FROM conversations_new
  WHERE id = v_conversation_id;

  IF v_is_creator THEN
    UPDATE messages_new SET is_deleted = true, deleted_at = now() WHERE id = p_message_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Not authorized to delete this message';
END;
$$;

-- 7. RPC: send_group_message (supports media + system messages)
CREATE OR REPLACE FUNCTION public.send_group_message(
  p_conversation_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text',
  p_media_urls jsonb DEFAULT '[]'::jsonb,
  p_reply_to_id uuid DEFAULT NULL,
  p_client_id uuid DEFAULT NULL,
  p_payload jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
  v_is_participant boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;

  INSERT INTO messages_new (
    conversation_id, sender_id, content, message_type,
    media_urls, reply_to_id, client_id, payload
  ) VALUES (
    p_conversation_id, auth.uid(), p_content, p_message_type,
    p_media_urls, p_reply_to_id, p_client_id, p_payload
  )
  RETURNING id INTO v_message_id;

  UPDATE conversations_new
  SET last_message_at = now(), updated_at = now()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

-- 8. RPC: get_group_messages (with sender profiles + cursor pagination)
CREATE OR REPLACE FUNCTION public.get_group_messages(
  p_conversation_id uuid,
  p_limit integer DEFAULT 30,
  p_before_id uuid DEFAULT NULL
)
RETURNS TABLE(
  message_id uuid,
  sender_id uuid,
  sender_username text,
  sender_full_name text,
  sender_avatar_url text,
  content text,
  message_type text,
  media_urls jsonb,
  reply_to_id uuid,
  payload jsonb,
  client_id uuid,
  created_at timestamptz,
  is_deleted boolean,
  edited_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;

  RETURN QUERY
  SELECT
    m.id AS message_id,
    m.sender_id,
    COALESCE(p.username, '') AS sender_username,
    COALESCE(p.full_name, 'Unknown') AS sender_full_name,
    COALESCE(p.avatar_url, '') AS sender_avatar_url,
    m.content,
    m.message_type,
    m.media_urls,
    m.reply_to_id,
    m.payload,
    m.client_id,
    m.created_at,
    m.is_deleted,
    m.edited_at
  FROM messages_new m
  LEFT JOIN profiles p ON p.id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND (p_before_id IS NULL OR m.created_at < (
      SELECT mn.created_at FROM messages_new mn WHERE mn.id = p_before_id
    ))
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 9. RPC: get_group_conversations_for_user
CREATE OR REPLACE FUNCTION public.get_group_conversations_for_user()
RETURNS TABLE(
  conversation_id uuid,
  title text,
  description text,
  avatar_url text,
  conversation_type text,
  created_by uuid,
  created_at timestamptz,
  last_message_at timestamptz,
  participant_count bigint,
  unread_count integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS conversation_id,
    c.title,
    c.description,
    c.avatar_url,
    c.conversation_type,
    c.created_by,
    c.created_at,
    c.last_message_at,
    (SELECT count(*) FROM conversation_participants cp2 WHERE cp2.conversation_id = c.id) AS participant_count,
    public.get_group_unread_count(c.id) AS unread_count
  FROM conversations_new c
  JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = auth.uid()
  WHERE c.conversation_type = 'group'
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- 10. Create message-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-media',
  'message-media',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-media');

CREATE POLICY "Conversation members can read message media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-media'
  AND EXISTS(
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid()
      AND cp.conversation_id::text = (storage.foldername(name))[1]
  )
);

-- 11. Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_new_conversation_created
  ON public.messages_new(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON public.conversation_participants(user_id, conversation_id);