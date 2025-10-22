-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_new_last_message ON conversations_new(last_message_at DESC);

-- Updated at trigger
CREATE TRIGGER update_conversations_new_updated_at
  BEFORE UPDATE ON conversations_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONVERSATION_PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_last_read ON conversation_participants(last_read_at);

-- =====================================================
-- MESSAGES TABLE (NEW)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations_new(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_new_conversation ON messages_new(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_new_sender ON messages_new(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_new_created ON messages_new(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_messages_new_updated_at
  BEFORE UPDATE ON messages_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations_new
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages_new
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Conversations: Users can view conversations they're part of
ALTER TABLE conversations_new ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations_new FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations_new FOR INSERT
  WITH CHECK (true);

-- Conversation Participants: Users can view participants in their conversations
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participant record"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: Users can view messages in their conversations
ALTER TABLE messages_new ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages_new FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages_new.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages_new FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages_new.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages_new FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- RPC FUNCTION: get_or_create_conversation
-- =====================================================
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
BEGIN
  -- Verify users are connected
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE ((requester_id = user1_id AND recipient_id = user2_id) OR
           (requester_id = user2_id AND recipient_id = user1_id))
      AND status = 'accepted'
  ) INTO connection_exists;

  IF NOT connection_exists THEN
    RAISE EXCEPTION 'Users must be connected to message each other';
  END IF;

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
    INSERT INTO conversations_new DEFAULT VALUES
    RETURNING id INTO conversation_id;

    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id), (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_user_conversations
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_username TEXT,
  other_user_full_name TEXT,
  other_user_avatar_url TEXT,
  other_user_headline TEXT,
  last_message_content TEXT,
  last_message_sender_id UUID,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as conversation_id,
    p.id as other_user_id,
    p.username as other_user_username,
    p.full_name as other_user_full_name,
    p.avatar_url as other_user_avatar_url,
    p.headline as other_user_headline,
    m.content as last_message_content,
    m.sender_id as last_message_sender_id,
    c.last_message_at,
    (
      SELECT COUNT(*)
      FROM messages_new msg
      WHERE msg.conversation_id = c.id
        AND msg.created_at > cp.last_read_at
        AND msg.sender_id != p_user_id
    ) as unread_count
  FROM conversations_new c
  INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
  INNER JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id
  INNER JOIN profiles p ON cp_other.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT content, sender_id
    FROM messages_new
    WHERE conversation_id = c.id
      AND is_deleted = false
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  WHERE cp.user_id = p_user_id
    AND cp_other.user_id != p_user_id
  ORDER BY c.last_message_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_conversation_messages
-- =====================================================
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
  created_at TIMESTAMPTZ,
  is_deleted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id
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
    m.created_at,
    m.is_deleted
  FROM messages_new m
  INNER JOIN profiles p ON m.sender_id = p.id
  WHERE m.conversation_id = p_conversation_id
    AND (p_before_timestamp IS NULL OR m.created_at < p_before_timestamp)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- RPC FUNCTION: mark_conversation_read
-- =====================================================
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_total_unread_count
-- =====================================================
CREATE OR REPLACE FUNCTION get_total_unread_count(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COALESCE(SUM(unread_count), 0) INTO total_count
  FROM (
    SELECT COUNT(*) as unread_count
    FROM messages_new m
    INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.user_id = p_user_id
      AND m.sender_id != p_user_id
      AND m.created_at > cp.last_read_at
      AND m.is_deleted = false
    GROUP BY m.conversation_id
  ) counts;

  RETURN total_count;
END;
$$;