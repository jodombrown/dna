-- =====================================================
-- DNA MESSAGING SYSTEM - PRD Implementation
-- Version 1.0 | December 2024
-- =====================================================
-- This migration implements the DNA Messaging System PRD requirements:
-- - Origin context tracking (where conversations started)
-- - Message request system (pending/accepted/declined)
-- - User restrictions (block/mute)
-- - Enhanced message metadata
-- - Read receipts
-- - Global user presence
-- =====================================================

-- =====================================================
-- 1. ALTER conversations_new TABLE
-- Add origin context and conversation type
-- =====================================================

ALTER TABLE conversations_new
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS origin_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS origin_id UUID,
ADD COLUMN IF NOT EXISTS origin_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Add index for origin lookups
CREATE INDEX IF NOT EXISTS idx_conversations_origin
ON conversations_new(origin_type, origin_id)
WHERE origin_type IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN conversations_new.type IS 'Conversation type: direct, group (future)';
COMMENT ON COLUMN conversations_new.origin_type IS 'Where conversation started: event, project, profile, post, null for direct';
COMMENT ON COLUMN conversations_new.origin_id IS 'ID of the origin entity (event, project, post)';
COMMENT ON COLUMN conversations_new.origin_metadata IS 'Additional origin context: title, date, etc.';
COMMENT ON COLUMN conversations_new.last_message_preview IS 'First 100 chars of last message for list preview';

-- =====================================================
-- 2. ALTER conversation_participants TABLE
-- Add status, mute, pin, and denormalized unread_count
-- =====================================================

ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- Add check constraint for valid status values
ALTER TABLE conversation_participants
DROP CONSTRAINT IF EXISTS valid_participant_status;

ALTER TABLE conversation_participants
ADD CONSTRAINT valid_participant_status
CHECK (status IN ('active', 'pending', 'declined'));

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_conversation_participants_status
ON conversation_participants(user_id, status);

-- Add index for pinned conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_pinned
ON conversation_participants(user_id, is_pinned)
WHERE is_pinned = true;

COMMENT ON COLUMN conversation_participants.status IS 'active = full access, pending = message request, declined = rejected request';
COMMENT ON COLUMN conversation_participants.is_muted IS 'If true, no notifications for this conversation';
COMMENT ON COLUMN conversation_participants.is_pinned IS 'If true, conversation pinned to top of list';
COMMENT ON COLUMN conversation_participants.unread_count IS 'Denormalized unread message count for performance';

-- =====================================================
-- 3. ALTER messages_new TABLE
-- Add content_type, metadata, and read receipt fields
-- =====================================================

-- First, alter the content column to allow null for non-text messages
ALTER TABLE messages_new
DROP CONSTRAINT IF EXISTS messages_new_content_check;

ALTER TABLE messages_new
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add check for valid content types
ALTER TABLE messages_new
ADD CONSTRAINT valid_content_type
CHECK (content_type IN ('text', 'image', 'file', 'link_preview', 'system'));

-- Re-add content constraint with content_type awareness
ALTER TABLE messages_new
ADD CONSTRAINT messages_content_check
CHECK (
  (content_type = 'text' AND content IS NOT NULL AND length(content) > 0 AND length(content) <= 5000)
  OR (content_type != 'text')
);

-- Add index for content type filtering
CREATE INDEX IF NOT EXISTS idx_messages_content_type
ON messages_new(conversation_id, content_type);

COMMENT ON COLUMN messages_new.content_type IS 'text, image, file, link_preview, system';
COMMENT ON COLUMN messages_new.metadata IS 'Attachment URLs, file info, link preview data';
COMMENT ON COLUMN messages_new.delivered_at IS 'When message was delivered to recipient device';
COMMENT ON COLUMN messages_new.read_at IS 'When recipient first read the message';

-- =====================================================
-- 4. CREATE user_restrictions TABLE
-- For block and mute functionality
-- =====================================================

CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restriction_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Cannot restrict yourself
  CONSTRAINT no_self_restriction CHECK (user_id != target_user_id),
  -- Only one restriction of each type per user pair
  CONSTRAINT unique_restriction UNIQUE (user_id, target_user_id, restriction_type),
  -- Valid restriction types
  CONSTRAINT valid_restriction_type CHECK (restriction_type IN ('block', 'mute'))
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_target ON user_restrictions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_type ON user_restrictions(user_id, restriction_type);

-- Enable RLS
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own restrictions
CREATE POLICY "users_manage_own_restrictions"
ON user_restrictions FOR ALL
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

COMMENT ON TABLE user_restrictions IS 'User block and mute restrictions for messaging';

-- =====================================================
-- 5. CREATE user_presence TABLE
-- For global online/offline status
-- =====================================================

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_presence_status CHECK (status IN ('online', 'away', 'offline'))
);

-- Index for status lookups
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status) WHERE status = 'online';

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Anyone can read presence (public)
CREATE POLICY "presence_select_public"
ON user_presence FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own presence
CREATE POLICY "presence_update_own"
ON user_presence FOR UPDATE
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can insert their own presence
CREATE POLICY "presence_insert_own"
ON user_presence FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_presence IS 'Global user online/offline status';

-- =====================================================
-- 6. CREATE message_read_receipts TABLE
-- For tracking individual read receipts
-- =====================================================

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_read_receipt UNIQUE (message_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user ON message_read_receipts(user_id);

-- Enable RLS
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Users can view read receipts for messages in their conversations
CREATE POLICY "read_receipts_select"
ON message_read_receipts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages_new m
    INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_read_receipts.message_id
    AND cp.user_id = (SELECT auth.uid())
  )
);

-- Users can only insert their own read receipts
CREATE POLICY "read_receipts_insert"
ON message_read_receipts FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

COMMENT ON TABLE message_read_receipts IS 'Tracks when each user read each message';

-- =====================================================
-- 7. UPDATE TRIGGER: broadcast_new_message
-- Enhanced to update preview and unread counts
-- =====================================================

CREATE OR REPLACE FUNCTION broadcast_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with last message preview
  UPDATE conversations_new SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  -- Increment unread count for other participants
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
  AND user_id != NEW.sender_id
  AND status = 'active';

  -- Mark as delivered immediately for now (real delivery tracking requires push notification callback)
  UPDATE messages_new
  SET delivered_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_broadcast_new_message ON messages_new;
CREATE TRIGGER trigger_broadcast_new_message
  AFTER INSERT ON messages_new
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_new_message();

-- =====================================================
-- 8. UPDATE RPC: mark_conversation_read
-- Reset unread count and create read receipts
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
  -- Update last_read_at and reset unread count
  UPDATE conversation_participants
  SET last_read_at = now(),
      unread_count = 0
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  -- Create read receipts for unread messages
  INSERT INTO message_read_receipts (message_id, user_id, read_at)
  SELECT m.id, p_user_id, now()
  FROM messages_new m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_read_receipts rr
      WHERE rr.message_id = m.id AND rr.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$;

-- =====================================================
-- 9. UPDATE RPC: get_user_conversations
-- Include origin context, status, mute, pin
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_status VARCHAR DEFAULT 'active',
  p_include_muted BOOLEAN DEFAULT true
)
RETURNS TABLE (
  conversation_id UUID,
  conversation_type VARCHAR,
  origin_type VARCHAR,
  origin_id UUID,
  origin_metadata JSONB,
  other_user_id UUID,
  other_user_username TEXT,
  other_user_full_name TEXT,
  other_user_avatar_url TEXT,
  other_user_headline TEXT,
  last_message_content TEXT,
  last_message_preview TEXT,
  last_message_sender_id UUID,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER,
  participant_status VARCHAR,
  is_muted BOOLEAN,
  is_pinned BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as conversation_id,
    c.type as conversation_type,
    c.origin_type,
    c.origin_id,
    c.origin_metadata,
    p.id as other_user_id,
    p.username as other_user_username,
    p.full_name as other_user_full_name,
    p.avatar_url as other_user_avatar_url,
    p.headline as other_user_headline,
    m.content as last_message_content,
    c.last_message_preview,
    m.sender_id as last_message_sender_id,
    c.last_message_at,
    cp.unread_count,
    cp.status as participant_status,
    cp.is_muted,
    cp.is_pinned
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
    AND (p_status IS NULL OR cp.status = p_status)
    AND (p_include_muted OR cp.is_muted = false)
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM user_restrictions ur
      WHERE ur.user_id = p_user_id
        AND ur.target_user_id = cp_other.user_id
        AND ur.restriction_type = 'block'
    )
  ORDER BY cp.is_pinned DESC, c.last_message_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- 10. UPDATE RPC: get_conversation_messages
-- Include content_type, metadata, and read status
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

-- =====================================================
-- 11. NEW RPC: get_or_create_conversation_contextual
-- Creates conversation with origin context
-- =====================================================

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
  -- Check if either user has blocked the other
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE (user_id = p_user1_id AND target_user_id = p_user2_id)
       OR (user_id = p_user2_id AND target_user_id = p_user1_id)
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

-- =====================================================
-- 12. NEW RPC: respond_to_message_request
-- Accept or decline message requests
-- =====================================================

CREATE OR REPLACE FUNCTION respond_to_message_request(
  p_conversation_id UUID,
  p_user_id UUID,
  p_accept BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has a pending request
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'No pending message request found';
  END IF;

  IF p_accept THEN
    -- Accept: change status to active
    UPDATE conversation_participants
    SET status = 'active',
        last_read_at = now()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;
  ELSE
    -- Decline: change status to declined
    UPDATE conversation_participants
    SET status = 'declined'
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$;

-- =====================================================
-- 13. NEW RPC: get_message_requests
-- Get pending message requests for a user
-- =====================================================

CREATE OR REPLACE FUNCTION get_message_requests(
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

-- =====================================================
-- 14. NEW RPC: block_user / unblock_user
-- Manage user blocks
-- =====================================================

CREATE OR REPLACE FUNCTION block_user(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cannot block yourself
  IF p_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;

  -- Insert block restriction
  INSERT INTO user_restrictions (user_id, target_user_id, restriction_type)
  VALUES (p_user_id, p_target_user_id, 'block')
  ON CONFLICT (user_id, target_user_id, restriction_type) DO NOTHING;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION unblock_user(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM user_restrictions
  WHERE user_id = p_user_id
    AND target_user_id = p_target_user_id
    AND restriction_type = 'block';

  RETURN true;
END;
$$;

-- =====================================================
-- 15. NEW RPC: toggle_conversation_mute / pin
-- Mute and pin conversation management
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_conversation_mute(
  p_conversation_id UUID,
  p_user_id UUID,
  p_mute BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_participants
  SET is_muted = p_mute
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_conversation_pin(
  p_conversation_id UUID,
  p_user_id UUID,
  p_pin BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_participants
  SET is_pinned = p_pin
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  RETURN true;
END;
$$;

-- =====================================================
-- 16. NEW RPC: update_user_presence
-- Update user's online status
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_status VARCHAR DEFAULT 'online'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, last_seen_at, updated_at)
  VALUES (p_user_id, p_status, now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = p_status,
    last_seen_at = now(),
    updated_at = now();

  RETURN true;
END;
$$;

-- =====================================================
-- 17. NEW RPC: get_users_presence
-- Get presence status for multiple users
-- =====================================================

CREATE OR REPLACE FUNCTION get_users_presence(
  p_user_ids UUID[]
)
RETURNS TABLE (
  user_id UUID,
  status VARCHAR,
  last_seen_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT up.user_id, up.status, up.last_seen_at
  FROM user_presence up
  WHERE up.user_id = ANY(p_user_ids);
END;
$$;

-- =====================================================
-- 18. NEW RPC: can_message_user
-- Check if user can message another user
-- =====================================================

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
  -- Check if blocked
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE (user_id = p_user_id AND target_user_id = p_target_user_id)
       OR (user_id = p_target_user_id AND target_user_id = p_user_id)
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

-- =====================================================
-- 19. Backfill existing data
-- Set default values for new columns
-- =====================================================

-- Set all existing participants to active status
UPDATE conversation_participants
SET status = 'active'
WHERE status IS NULL;

-- Initialize unread counts from existing data
UPDATE conversation_participants cp
SET unread_count = (
  SELECT COUNT(*)
  FROM messages_new m
  WHERE m.conversation_id = cp.conversation_id
    AND m.created_at > cp.last_read_at
    AND m.sender_id != cp.user_id
    AND m.is_deleted = false
);

-- Set all existing messages to text type
UPDATE messages_new
SET content_type = 'text'
WHERE content_type IS NULL;

-- Set last_message_preview for existing conversations
UPDATE conversations_new c
SET last_message_preview = (
  SELECT LEFT(m.content, 100)
  FROM messages_new m
  WHERE m.conversation_id = c.id
    AND m.is_deleted = false
  ORDER BY m.created_at DESC
  LIMIT 1
);

-- =====================================================
-- 20. Grant execute permissions on new functions
-- =====================================================

GRANT EXECUTE ON FUNCTION get_or_create_conversation_contextual TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_message_request TO authenticated;
GRANT EXECUTE ON FUNCTION get_message_requests TO authenticated;
GRANT EXECUTE ON FUNCTION block_user TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_conversation_mute TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_conversation_pin TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_presence TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_presence TO authenticated;
GRANT EXECUTE ON FUNCTION can_message_user TO authenticated;
