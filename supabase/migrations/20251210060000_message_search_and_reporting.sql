-- =====================================================
-- DNA MESSAGING SYSTEM - Message Search & Reporting
-- Version 1.1 | December 2024
-- =====================================================
-- This migration adds:
-- - Message search RPC function
-- - Message reporting functionality
-- - Notification triggers for new messages
-- =====================================================

-- =====================================================
-- 1. MESSAGE SEARCH RPC
-- Search messages within conversations or globally
-- =====================================================

CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_conversation_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  sender_id UUID,
  sender_username TEXT,
  sender_full_name TEXT,
  sender_avatar_url TEXT,
  content TEXT,
  content_type VARCHAR,
  created_at TIMESTAMPTZ,
  -- Conversation context
  other_user_id UUID,
  other_user_username TEXT,
  other_user_full_name TEXT,
  other_user_avatar_url TEXT,
  -- Search relevance
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If searching within a specific conversation
  IF p_conversation_id IS NOT NULL THEN
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
      m.conversation_id,
      m.sender_id,
      p_sender.username as sender_username,
      p_sender.full_name as sender_full_name,
      p_sender.avatar_url as sender_avatar_url,
      m.content,
      m.content_type,
      m.created_at,
      -- Other user (for context)
      p_other.id as other_user_id,
      p_other.username as other_user_username,
      p_other.full_name as other_user_full_name,
      p_other.avatar_url as other_user_avatar_url,
      -- Simple text match score
      ts_rank(to_tsvector('english', COALESCE(m.content, '')), plainto_tsquery('english', p_query)) as rank
    FROM messages_new m
    INNER JOIN profiles p_sender ON m.sender_id = p_sender.id
    INNER JOIN conversation_participants cp_other ON m.conversation_id = cp_other.conversation_id
    INNER JOIN profiles p_other ON cp_other.user_id = p_other.id
    WHERE m.conversation_id = p_conversation_id
      AND m.is_deleted = false
      AND m.content IS NOT NULL
      AND cp_other.user_id != p_user_id
      AND (
        -- Full text search
        to_tsvector('english', m.content) @@ plainto_tsquery('english', p_query)
        OR
        -- Fallback to ILIKE for partial matches
        m.content ILIKE '%' || p_query || '%'
      )
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
  ELSE
    -- Global search across all user's conversations
    RETURN QUERY
    SELECT
      m.id as message_id,
      m.conversation_id,
      m.sender_id,
      p_sender.username as sender_username,
      p_sender.full_name as sender_full_name,
      p_sender.avatar_url as sender_avatar_url,
      m.content,
      m.content_type,
      m.created_at,
      -- Other user (for context)
      p_other.id as other_user_id,
      p_other.username as other_user_username,
      p_other.full_name as other_user_full_name,
      p_other.avatar_url as other_user_avatar_url,
      -- Simple text match score
      ts_rank(to_tsvector('english', COALESCE(m.content, '')), plainto_tsquery('english', p_query)) as rank
    FROM messages_new m
    INNER JOIN profiles p_sender ON m.sender_id = p_sender.id
    INNER JOIN conversation_participants cp_user ON m.conversation_id = cp_user.conversation_id
    INNER JOIN conversation_participants cp_other ON m.conversation_id = cp_other.conversation_id
    INNER JOIN profiles p_other ON cp_other.user_id = p_other.id
    WHERE cp_user.user_id = p_user_id
      AND cp_user.status = 'active'
      AND cp_other.user_id != p_user_id
      AND m.is_deleted = false
      AND m.content IS NOT NULL
      AND (
        -- Full text search
        to_tsvector('english', m.content) @@ plainto_tsquery('english', p_query)
        OR
        -- Fallback to ILIKE for partial matches
        m.content ILIKE '%' || p_query || '%'
      )
      -- Exclude blocked users
      AND NOT EXISTS (
        SELECT 1 FROM user_restrictions ur
        WHERE ur.user_id = p_user_id
          AND ur.target_user_id = m.sender_id
          AND ur.restriction_type = 'block'
      )
    ORDER BY
      ts_rank(to_tsvector('english', COALESCE(m.content, '')), plainto_tsquery('english', p_query)) DESC,
      m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
  END IF;
END;
$$;

-- Create index for full text search on messages
CREATE INDEX IF NOT EXISTS idx_messages_content_fts
ON messages_new
USING GIN (to_tsvector('english', COALESCE(content, '')));

-- =====================================================
-- 2. MESSAGE REPORTING
-- Allow users to report messages as spam/inappropriate
-- =====================================================

-- Create message_reports table
CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages_new(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),

  -- Each user can only report a message once
  CONSTRAINT unique_message_report UNIQUE (message_id, reporter_id),
  -- Valid reason types
  CONSTRAINT valid_report_reason CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'scam', 'other')),
  -- Valid status values
  CONSTRAINT valid_report_status CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_reports_message ON message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_reporter ON message_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;

-- Users can create their own reports
CREATE POLICY "users_create_reports"
ON message_reports FOR INSERT
WITH CHECK (reporter_id = (SELECT auth.uid()));

-- Users can view their own reports
CREATE POLICY "users_view_own_reports"
ON message_reports FOR SELECT
USING (reporter_id = (SELECT auth.uid()));

-- RPC to report a message
CREATE OR REPLACE FUNCTION report_message(
  p_message_id UUID,
  p_reason VARCHAR,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_report_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get conversation_id from message
  SELECT conversation_id INTO v_conversation_id
  FROM messages_new
  WHERE id = p_message_id;

  IF v_conversation_id IS NULL THEN
    RAISE EXCEPTION 'Message not found';
  END IF;

  -- Verify user is participant in the conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = v_conversation_id
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Cannot report own messages
  IF EXISTS (
    SELECT 1 FROM messages_new
    WHERE id = p_message_id AND sender_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Cannot report your own message';
  END IF;

  -- Create report
  INSERT INTO message_reports (message_id, reporter_id, reason, description)
  VALUES (p_message_id, v_user_id, p_reason, p_description)
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

-- =====================================================
-- 3. NEW MESSAGE NOTIFICATION TRIGGER
-- Creates notifications when users receive new messages
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_sender_username TEXT;
  v_sender_avatar TEXT;
  v_conversation_type VARCHAR;
  v_is_muted BOOLEAN;
BEGIN
  -- Get sender info
  SELECT full_name, username, avatar_url
  INTO v_sender_name, v_sender_username, v_sender_avatar
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Get conversation type
  SELECT type INTO v_conversation_type
  FROM conversations_new
  WHERE id = NEW.conversation_id;

  -- Get all recipients (participants except sender)
  FOR v_recipient_id, v_is_muted IN
    SELECT user_id, is_muted
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
      AND status = 'active'
  LOOP
    -- Skip muted conversations
    IF v_is_muted THEN
      CONTINUE;
    END IF;

    -- Check if recipient has blocked sender
    IF EXISTS (
      SELECT 1 FROM user_restrictions
      WHERE user_id = v_recipient_id
        AND target_user_id = NEW.sender_id
        AND restriction_type = 'block'
    ) THEN
      CONTINUE;
    END IF;

    -- Create notification
    INSERT INTO notifications (
      user_id,
      type,
      actor_id,
      actor_username,
      actor_full_name,
      actor_avatar_url,
      title,
      message,
      action_url,
      entity_type,
      entity_id
    ) VALUES (
      v_recipient_id,
      'new_message',
      NEW.sender_id,
      v_sender_username,
      v_sender_name,
      v_sender_avatar,
      'New message from ' || v_sender_name,
      LEFT(NEW.content, 100),
      '/dna/messages/' || NEW.conversation_id,
      'message',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new message notifications
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages_new;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages_new
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION search_messages TO authenticated;
GRANT EXECUTE ON FUNCTION report_message TO authenticated;
