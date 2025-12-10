-- =====================================================
-- FIX 1: Remove recursive conversation_participants policies
-- =====================================================

-- Drop all existing policies on conversation_participants
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they join" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert_fixed" ON conversation_participants;

-- Create simple non-recursive policies
CREATE POLICY "cp_select_own" ON conversation_participants
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "cp_insert_self" ON conversation_participants
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- FIX 2: Fix notify_post_comment trigger to use correct column name
-- =====================================================

-- Drop and recreate the function with correct column name (link_url, not action_url)
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Create notification for post author using link_url (correct column)
  INSERT INTO notifications (user_id, type, title, message, link_url, payload)
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
$$;