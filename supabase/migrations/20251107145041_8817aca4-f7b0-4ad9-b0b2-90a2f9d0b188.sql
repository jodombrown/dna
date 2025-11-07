-- ============================================
-- NOTIFICATION TRIGGERS FOR SOCIAL FEATURES
-- ============================================

-- 1. Post Reaction Notifications
-- Notify post author when someone reacts to their post
CREATE OR REPLACE FUNCTION notify_post_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author_id UUID;
  v_reactor_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Get reactor name
  SELECT full_name INTO v_reactor_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notification (don't notify if reacting to own post)
  IF v_post_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_post_author_id,
      NEW.user_id,
      'reaction',
      'New Reaction',
      v_reactor_name || ' reacted ' || NEW.emoji || ' to your post',
      '/dna/connect/feed',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_post_reaction ON post_reactions;

-- Create trigger for post reactions
CREATE TRIGGER trigger_notify_post_reaction
  AFTER INSERT ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_reaction();


-- 2. Post Share Notifications
-- Notify post author when someone shares their post
CREATE OR REPLACE FUNCTION notify_post_share()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author_id UUID;
  v_sharer_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Get sharer name
  SELECT full_name INTO v_sharer_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notification (don't notify if sharing own post)
  IF v_post_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_post_author_id,
      NEW.user_id,
      'share',
      'Post Shared',
      v_sharer_name || ' shared your post',
      '/dna/connect/feed',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_post_share ON post_shares;

-- Create trigger for post shares
CREATE TRIGGER trigger_notify_post_share
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_share();


-- 3. Message Notifications (update existing)
-- Update the existing message notification to use new schema
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
BEGIN
  -- Get recipient (the other participant in conversation)
  SELECT user_id INTO v_recipient_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  -- Get sender name
  SELECT full_name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification if recipient found
  IF v_recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      v_recipient_id,
      NEW.sender_id,
      'message',
      'New Message',
      v_sender_name || ' sent you a message',
      '/messages',
      'message',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger for messages
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages_new;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages_new
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- 4. Comment Notifications (enhance existing)
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Get commenter name
  SELECT full_name INTO v_commenter_name
  FROM profiles
  WHERE id = NEW.author_id;

  -- Create notification (don't notify if commenting on own post)
  IF v_post_author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_post_author_id,
      NEW.author_id,
      'comment',
      'New Comment',
      v_commenter_name || ' commented on your post',
      '/dna/connect/feed',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_post_comment ON comments;

CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();


-- 5. Connection Request Notifications (already exists, just ensure it's set)
-- This should already be in place from previous migrations
-- Verify trigger exists
DROP TRIGGER IF EXISTS trigger_notify_connection_request ON connections;

CREATE TRIGGER trigger_notify_connection_request
  AFTER INSERT ON connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_connection_request();


-- 6. Connection Accepted Notifications (already exists)
DROP TRIGGER IF EXISTS trigger_notify_connection_accepted ON connections;

CREATE TRIGGER trigger_notify_connection_accepted
  AFTER UPDATE ON connections
  FOR EACH ROW
  WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
  EXECUTE FUNCTION notify_connection_accepted();


-- Comment: The following triggers are already in place from previous migrations:
-- - notify_event_invite() - Event invitations
-- - notify_event_rsvp() - Event RSVPs
-- - notify_profile_view() - Profile views
-- - notify_join_request_approved() - Group join approvals
-- - notify_new_join_request() - Group join requests