-- =============================================
-- FIX 1: Comment Trigger - Use correct column name (user_id not author_id)
-- =============================================

-- Drop all related triggers first
DROP TRIGGER IF EXISTS notify_post_comment_trigger ON post_comments;
DROP TRIGGER IF EXISTS trigger_notify_post_comment ON comments;

-- Drop function with CASCADE to handle any remaining dependencies
DROP FUNCTION IF EXISTS notify_post_comment() CASCADE;

-- Recreate the function with correct column reference for post_comments table
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if commenting on own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter name
  SELECT COALESCE(full_name, username, 'Someone') INTO commenter_name 
  FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification for post author
  INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
  VALUES (
    post_author_id,
    'comment',
    'New comment on your post',
    commenter_name || ' commented on your post',
    '/dna/feed',
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger on post_comments table
CREATE TRIGGER notify_post_comment_trigger
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();

-- =============================================
-- FIX 2: Conversation Participants RLS - Remove recursive policy
-- =============================================

-- Drop the recursive policy
DROP POLICY IF EXISTS "conversation_participants_select" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversation_participants;

-- Create new non-recursive policy: users can only see participants in conversations they're part of
CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR 
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants cp2 
    WHERE cp2.user_id = (SELECT auth.uid())
  )
);