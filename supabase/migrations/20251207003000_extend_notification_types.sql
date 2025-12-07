-- Migration: Extend Notification Types for Reactions & Mentions
-- Adds support for reaction, mention, reshare, and connection notifications

-- Drop the old constraint on action_type
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_action_type_check;

-- Add new constraint with extended action types
ALTER TABLE notifications
  ADD CONSTRAINT notifications_action_type_check
  CHECK (action_type IN (
    'like',           -- Legacy: simple like
    'comment',        -- Comment on post
    'follow',         -- User followed
    'tag',            -- Legacy: user tagged
    'reaction',       -- New: emoji reaction on post
    'mention',        -- New: @mention in post or comment
    'reshare',        -- New: post reshared
    'connection_request', -- New: connection request received
    'connection_accepted' -- New: connection request accepted
  ));

-- Create function to notify on reactions
CREATE OR REPLACE FUNCTION notify_on_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_post_author
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if user reacted to their own post
  IF v_post_author != NEW.user_id THEN
    -- Insert notification (ignore duplicates due to UNIQUE constraint)
    INSERT INTO notifications (
      recipient_id,
      actor_id,
      action_type,
      target_type,
      target_id
    )
    VALUES (
      v_post_author,
      NEW.user_id,
      'reaction',
      'post',
      NEW.post_id
    )
    ON CONFLICT (recipient_id, actor_id, action_type, target_type, target_id)
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for reaction notifications
DROP TRIGGER IF EXISTS trigger_notify_on_reaction ON post_reactions;
CREATE TRIGGER trigger_notify_on_reaction
  AFTER INSERT ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reaction();

-- Create function to notify on mentions (for future integration)
CREATE OR REPLACE FUNCTION notify_on_mention()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This will be populated when mention system creates mention records
  -- For now, it's a placeholder for future enhancement

  -- Don't notify if user mentioned themselves
  IF NEW.mentioned_user_id != NEW.author_id THEN
    INSERT INTO notifications (
      recipient_id,
      actor_id,
      action_type,
      target_type,
      target_id
    )
    VALUES (
      NEW.mentioned_user_id,
      NEW.author_id,
      'mention',
      NEW.mention_context_type, -- 'post' or 'comment'
      NEW.context_id
    )
    ON CONFLICT (recipient_id, actor_id, action_type, target_type, target_id)
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Note: mention trigger will be created when mentions table is created
-- For now, mentions are already creating notifications via the existing system

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION notify_on_reaction TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_mention TO authenticated;

-- Add comments
COMMENT ON FUNCTION notify_on_reaction IS 'Automatically creates notification when user reacts to a post';
COMMENT ON FUNCTION notify_on_mention IS 'Automatically creates notification when user is mentioned';
