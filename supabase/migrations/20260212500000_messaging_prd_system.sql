-- ============================================================
-- DNA Messaging System — PRD Database Schema
-- The connective tissue that makes DNA a living network
--
-- Five conversation types mapped to the Five C's:
-- 1. Direct Message (CONNECT) — 1:1 personal conversation
-- 2. Group Conversation (CONNECT) — Multi-party discussion
-- 3. Event Thread (CONVENE) — Pre/during/post event comms
-- 4. Space Channel (COLLABORATE) — Project communication
-- 5. Opportunity Thread (CONTRIBUTE) — Need <> Offer negotiation
-- ============================================================

-- ============================================================
-- CONVERSATIONS (PRD)
-- ============================================================

CREATE TABLE IF NOT EXISTS messaging_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'event_thread', 'space_channel', 'opportunity_thread')),
  c_module TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT CHECK (context_type IN ('event', 'space', 'opportunity')),
  context_id UUID,
  participant_count INTEGER NOT NULL DEFAULT 0,
  participant_limit INTEGER NOT NULL DEFAULT 50,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  last_message_sender_id UUID,
  last_message_sender_name TEXT,
  message_count INTEGER DEFAULT 0,
  pinned_message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conversations_type ON messaging_conversations(type);
CREATE INDEX IF NOT EXISTS idx_msg_conversations_context ON messaging_conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_msg_conversations_last_message ON messaging_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_conversations_created_by ON messaging_conversations(created_by);

ALTER TABLE messaging_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messaging conversations" ON messaging_conversations
  FOR SELECT USING (
    id IN (SELECT conversation_id FROM messaging_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create messaging conversations" ON messaging_conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update messaging conversations" ON messaging_conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id FROM messaging_participants
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- CONVERSATION PARTICIPANTS (PRD)
-- ============================================================

CREATE TABLE IF NOT EXISTS messaging_participants (
  conversation_id UUID NOT NULL REFERENCES messaging_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'observer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  last_read_message_id UUID,
  unread_count INTEGER DEFAULT 0,
  mute_until TIMESTAMPTZ,
  is_typing BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  nickname TEXT,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_msg_participants_user ON messaging_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_msg_participants_unread ON messaging_participants(user_id, unread_count) WHERE unread_count > 0;

ALTER TABLE messaging_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own participation in messaging" ON messaging_participants
  FOR SELECT USING (
    auth.uid() = user_id
    OR conversation_id IN (
      SELECT conversation_id FROM messaging_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own messaging participation" ON messaging_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Conversation owners can insert messaging participants" ON messaging_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR conversation_id IN (
      SELECT conversation_id FROM messaging_participants
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete messaging participants" ON messaging_participants
  FOR DELETE USING (
    auth.uid() = user_id
    OR conversation_id IN (
      SELECT conversation_id FROM messaging_participants
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- MESSAGES (PRD)
-- ============================================================

CREATE TABLE IF NOT EXISTS messaging_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES messaging_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar_url TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  media JSONB DEFAULT '[]',
  reply_to_message_id UUID REFERENCES messaging_messages(id) ON DELETE SET NULL,
  reply_to_preview TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_system_message BOOLEAN DEFAULT FALSE,
  system_message_type TEXT,
  cross_c_references JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '[]',
  read_by UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_messages_conversation ON messaging_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_messages_sender ON messaging_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_messages_pinned ON messaging_messages(conversation_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_msg_messages_search ON messaging_messages USING gin(to_tsvector('english', content));

ALTER TABLE messaging_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messaging messages" ON messaging_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM messaging_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messaging messages" ON messaging_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM messaging_participants
      WHERE user_id = auth.uid() AND role != 'observer'
    )
  );

CREATE POLICY "Senders can update own messaging messages" ON messaging_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- ============================================================
-- MESSAGE SEARCH (Full-text search across conversations)
-- ============================================================

CREATE OR REPLACE FUNCTION search_messaging_messages(
  p_user_id UUID,
  p_query TEXT,
  p_conversation_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  conversation_title TEXT,
  sender_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    c.title,
    m.sender_name,
    m.content,
    m.created_at,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', p_query)) as rank
  FROM messaging_messages m
  JOIN messaging_conversations c ON c.id = m.conversation_id
  JOIN messaging_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = p_user_id
  WHERE to_tsvector('english', m.content) @@ plainto_tsquery('english', p_query)
    AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Create a direct conversation between two users
CREATE OR REPLACE FUNCTION create_direct_messaging_conversation(
  p_user_id UUID,
  p_recipient_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_user_name TEXT;
  v_recipient_name TEXT;
BEGIN
  -- Check if direct conversation already exists
  SELECT mc.id INTO v_conversation_id
  FROM messaging_conversations mc
  WHERE mc.type = 'direct'
    AND mc.id IN (
      SELECT mp1.conversation_id
      FROM messaging_participants mp1
      JOIN messaging_participants mp2 ON mp1.conversation_id = mp2.conversation_id
      WHERE mp1.user_id = p_user_id AND mp2.user_id = p_recipient_id
    )
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Get user names
  SELECT full_name INTO v_user_name FROM profiles WHERE id = p_user_id;
  SELECT full_name INTO v_recipient_name FROM profiles WHERE id = p_recipient_id;

  -- Create conversation
  INSERT INTO messaging_conversations (type, c_module, created_by, participant_count, participant_limit)
  VALUES ('direct', 'CONNECT', p_user_id, 2, 2)
  RETURNING id INTO v_conversation_id;

  -- Add participants
  INSERT INTO messaging_participants (conversation_id, user_id, role)
  VALUES
    (v_conversation_id, p_user_id, 'owner'),
    (v_conversation_id, p_recipient_id, 'member');

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a group conversation
CREATE OR REPLACE FUNCTION create_group_messaging_conversation(
  p_creator_id UUID,
  p_title TEXT,
  p_participant_ids UUID[],
  p_image_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_id UUID;
BEGIN
  -- Create conversation
  INSERT INTO messaging_conversations (
    type, c_module, title, image_url, created_by,
    participant_count, participant_limit
  )
  VALUES (
    'group', 'CONNECT', p_title, p_image_url, p_creator_id,
    array_length(p_participant_ids, 1) + 1, 50
  )
  RETURNING id INTO v_conversation_id;

  -- Add creator as owner
  INSERT INTO messaging_participants (conversation_id, user_id, role)
  VALUES (v_conversation_id, p_creator_id, 'owner');

  -- Add other participants as members
  FOREACH v_participant_id IN ARRAY p_participant_ids
  LOOP
    INSERT INTO messaging_participants (conversation_id, user_id, role)
    VALUES (v_conversation_id, v_participant_id, 'member')
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an event thread
CREATE OR REPLACE FUNCTION create_event_messaging_thread(
  p_event_id UUID,
  p_organizer_id UUID,
  p_title TEXT
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Check if thread already exists for this event
  SELECT id INTO v_conversation_id
  FROM messaging_conversations
  WHERE context_type = 'event' AND context_id = p_event_id AND type = 'event_thread'
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create conversation
  INSERT INTO messaging_conversations (
    type, c_module, title, created_by, context_type, context_id,
    participant_count, participant_limit
  )
  VALUES (
    'event_thread', 'CONVENE', p_title, p_organizer_id,
    'event', p_event_id, 1, 500
  )
  RETURNING id INTO v_conversation_id;

  -- Add organizer as owner
  INSERT INTO messaging_participants (conversation_id, user_id, role)
  VALUES (v_conversation_id, p_organizer_id, 'owner');

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a space channel
CREATE OR REPLACE FUNCTION create_space_messaging_channel(
  p_space_id UUID,
  p_creator_id UUID,
  p_channel_name TEXT DEFAULT 'General'
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Create channel
  INSERT INTO messaging_conversations (
    type, c_module, title, created_by, context_type, context_id,
    participant_count, participant_limit
  )
  VALUES (
    'space_channel', 'COLLABORATE', p_channel_name, p_creator_id,
    'space', p_space_id, 1, 200
  )
  RETURNING id INTO v_conversation_id;

  -- Add creator as owner
  INSERT INTO messaging_participants (conversation_id, user_id, role)
  VALUES (v_conversation_id, p_creator_id, 'owner');

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an opportunity thread
CREATE OR REPLACE FUNCTION create_opportunity_messaging_thread(
  p_opportunity_id UUID,
  p_poster_id UUID,
  p_interested_user_id UUID,
  p_title TEXT
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Check if thread already exists for this pair
  SELECT mc.id INTO v_conversation_id
  FROM messaging_conversations mc
  WHERE mc.context_type = 'opportunity'
    AND mc.context_id = p_opportunity_id
    AND mc.type = 'opportunity_thread'
    AND mc.id IN (
      SELECT mp1.conversation_id
      FROM messaging_participants mp1
      JOIN messaging_participants mp2 ON mp1.conversation_id = mp2.conversation_id
      WHERE mp1.user_id = p_poster_id AND mp2.user_id = p_interested_user_id
    )
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create conversation
  INSERT INTO messaging_conversations (
    type, c_module, title, created_by, context_type, context_id,
    participant_count, participant_limit
  )
  VALUES (
    'opportunity_thread', 'CONTRIBUTE', p_title, p_poster_id,
    'opportunity', p_opportunity_id, 2, 2
  )
  RETURNING id INTO v_conversation_id;

  -- Add poster as owner and interested user as observer (until accepted)
  INSERT INTO messaging_participants (conversation_id, user_id, role)
  VALUES
    (v_conversation_id, p_poster_id, 'owner'),
    (v_conversation_id, p_interested_user_id, 'member');

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update messaging metadata for DIA (frequency tracking)
CREATE OR REPLACE FUNCTION update_messaging_metadata(
  p_user_a UUID,
  p_user_b UUID,
  p_timestamp TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE network_edges
  SET
    last_interaction_date = p_timestamp,
    communication_frequency = CASE
      WHEN last_interaction_date > NOW() - INTERVAL '1 day' THEN 'daily'
      WHEN last_interaction_date > NOW() - INTERVAL '7 days' THEN 'weekly'
      WHEN last_interaction_date > NOW() - INTERVAL '30 days' THEN 'monthly'
      ELSE 'quarterly'
    END,
    updated_at = NOW()
  WHERE (user_id = p_user_a AND connected_user_id = p_user_b)
     OR (user_id = p_user_b AND connected_user_id = p_user_a);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-add event attendees to event thread
CREATE OR REPLACE FUNCTION add_attendee_to_event_messaging_thread()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  SELECT id INTO v_conversation_id
  FROM messaging_conversations
  WHERE context_type = 'event' AND context_id = NEW.event_id AND type = 'event_thread'
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO messaging_participants (conversation_id, user_id, role)
    VALUES (v_conversation_id, NEW.user_id, 'member')
    ON CONFLICT DO NOTHING;

    UPDATE messaging_conversations
    SET participant_count = participant_count + 1
    WHERE id = v_conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-add Space members to Space general channel
CREATE OR REPLACE FUNCTION add_member_to_space_messaging_channel()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  SELECT id INTO v_conversation_id
  FROM messaging_conversations
  WHERE context_type = 'space' AND context_id = NEW.space_id
    AND type = 'space_channel' AND title LIKE '%General%'
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO messaging_participants (conversation_id, user_id, role)
    VALUES (v_conversation_id, NEW.user_id, 'member')
    ON CONFLICT DO NOTHING;

    UPDATE messaging_conversations
    SET participant_count = participant_count + 1
    WHERE id = v_conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto-adding participants (safe: only if tables exist)
DO $$
BEGIN
  -- Event attendee trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_attendees') THEN
    DROP TRIGGER IF EXISTS trg_add_attendee_to_event_messaging_thread ON event_attendees;
    CREATE TRIGGER trg_add_attendee_to_event_messaging_thread
      AFTER INSERT ON event_attendees
      FOR EACH ROW
      EXECUTE FUNCTION add_attendee_to_event_messaging_thread();
  END IF;

  -- Space member trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'space_members') THEN
    DROP TRIGGER IF EXISTS trg_add_member_to_space_messaging_channel ON space_members;
    CREATE TRIGGER trg_add_member_to_space_messaging_channel
      AFTER INSERT ON space_members
      FOR EACH ROW
      EXECUTE FUNCTION add_member_to_space_messaging_channel();
  END IF;
END;
$$;

-- ============================================================
-- MESSAGING METADATA for DIA tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS messaging_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES messaging_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  first_message_at TIMESTAMPTZ,
  average_response_time_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_msg_metadata_user ON messaging_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_msg_metadata_conversation ON messaging_metadata(conversation_id);

ALTER TABLE messaging_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messaging metadata" ON messaging_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update messaging metadata" ON messaging_metadata
  FOR ALL USING (true);
