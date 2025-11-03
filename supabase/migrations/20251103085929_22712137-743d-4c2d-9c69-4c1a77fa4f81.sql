-- Fix all functions missing search_path to prevent SQL injection

-- 1. Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Update group post count
CREATE OR REPLACE FUNCTION update_group_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET post_count = post_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 3. Update group post like count
CREATE OR REPLACE FUNCTION update_group_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. Update group post comment count
CREATE OR REPLACE FUNCTION update_group_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. Auto-add group owner
CREATE OR REPLACE FUNCTION auto_add_group_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

-- 6. Update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- 7. Notify connection accepted
CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM create_notification(
      NEW.requester_id,
      NEW.recipient_id,
      'connection_accepted',
      'Connection Accepted',
      (SELECT full_name FROM profiles WHERE id = NEW.recipient_id) || ' accepted your connection request',
      '/dna/connect/network',
      'connection',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 8. Notify connection request
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_notification(
    NEW.recipient_id,
    NEW.requester_id,
    'connection_request',
    'New Connection Request',
    (SELECT full_name FROM profiles WHERE id = NEW.requester_id) || ' sent you a connection request',
    '/dna/connect/network?tab=requests',
    'connection',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- 9. Notify post like
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
BEGIN
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  PERFORM create_notification(
    post_author_id,
    NEW.user_id,
    'post_like',
    'New Like',
    (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' liked your post',
    '/dna/connect/feed',
    'post',
    NEW.post_id
  );
  RETURN NEW;
END;
$$;

-- 10. Notify post comment
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
BEGIN
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  PERFORM create_notification(
    post_author_id,
    NEW.author_id,
    'post_comment',
    'New Comment',
    (SELECT full_name FROM profiles WHERE id = NEW.author_id) || ' commented on your post',
    '/dna/connect/feed',
    'post',
    NEW.post_id
  );
  RETURN NEW;
END;
$$;

-- 11. Notify new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
BEGIN
  SELECT user_id INTO recipient_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      recipient_id,
      NEW.sender_id,
      'new_message',
      'New Message',
      (SELECT full_name FROM profiles WHERE id = NEW.sender_id) || ' sent you a message',
      '/dna/connect/messages/' || NEW.conversation_id,
      'message',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 12. Notify event invite
CREATE OR REPLACE FUNCTION notify_event_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_title TEXT;
  organizer_name TEXT;
BEGIN
  SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
  SELECT full_name INTO organizer_name FROM profiles WHERE id = (SELECT organizer_id FROM events WHERE id = NEW.event_id);

  PERFORM create_notification(
    NEW.user_id,
    (SELECT organizer_id FROM events WHERE id = NEW.event_id),
    'event_invite',
    'Event Invitation',
    organizer_name || ' invited you to ' || event_title,
    '/dna/convene/events/' || NEW.event_id,
    'event',
    NEW.event_id
  );
  RETURN NEW;
END;
$$;

-- 13. Notify event RSVP
CREATE OR REPLACE FUNCTION notify_event_rsvp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_title TEXT;
  event_organizer UUID;
  attendee_name TEXT;
BEGIN
  IF NEW.status IN ('going', 'maybe') AND OLD.status != NEW.status THEN
    SELECT title, organizer_id INTO event_title, event_organizer 
    FROM events WHERE id = NEW.event_id;
    
    SELECT full_name INTO attendee_name FROM profiles WHERE id = NEW.user_id;

    PERFORM create_notification(
      event_organizer,
      NEW.user_id,
      'event_invite',
      'New RSVP',
      attendee_name || ' is ' || NEW.status || ' for ' || event_title,
      '/dna/convene/events/' || NEW.event_id,
      'event',
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END;
$$;