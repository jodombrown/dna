-- Migration: Add @mention system
-- Enables user mentions in posts with notifications

-- Create post_mentions table
CREATE TABLE IF NOT EXISTS post_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentioned_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, mentioned_user_id)
);

-- Create indexes
CREATE INDEX idx_post_mentions_post_id ON post_mentions(post_id);
CREATE INDEX idx_post_mentions_user_id ON post_mentions(mentioned_user_id);

-- RLS policies
ALTER TABLE post_mentions ENABLE ROW LEVEL SECURITY;

-- Anyone can view mentions
CREATE POLICY "Mentions are viewable by everyone"
  ON post_mentions FOR SELECT
  USING (true);

-- Authenticated users can insert mentions (via trigger)
CREATE POLICY "Mentions can be inserted by authenticated users"
  ON post_mentions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to extract @mentions from text and resolve to user IDs
CREATE OR REPLACE FUNCTION extract_mentions(content TEXT)
RETURNS TABLE (
  username TEXT,
  user_id UUID
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    LOWER(substring(match FROM 2)) AS username,
    p.id AS user_id
  FROM regexp_matches(content, '@([A-Za-z0-9_]+)', 'g') AS match
  INNER JOIN profiles p ON LOWER(p.username) = LOWER(substring(match FROM 2))
  WHERE p.username IS NOT NULL;
END;
$$;

-- Function to sync mentions for a post
CREATE OR REPLACE FUNCTION sync_post_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mention_record RECORD;
BEGIN
  -- Delete old mentions for this post
  DELETE FROM post_mentions WHERE post_id = NEW.id;

  -- Insert new mentions
  FOR mention_record IN
    SELECT username, user_id FROM extract_mentions(NEW.content)
  LOOP
    INSERT INTO post_mentions (post_id, mentioned_user_id, mentioned_username)
    VALUES (NEW.id, mention_record.user_id, mention_record.username)
    ON CONFLICT (post_id, mentioned_user_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger to auto-extract mentions on post insert/update
CREATE TRIGGER sync_mentions_on_post_change
  AFTER INSERT OR UPDATE OF content
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_post_mentions();

-- Function to create notification for mention
CREATE OR REPLACE FUNCTION notify_mentioned_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_author_id UUID;
  post_author_name TEXT;
BEGIN
  -- Get post author info
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if author mentions themselves
  IF post_author_id = NEW.mentioned_user_id THEN
    RETURN NEW;
  END IF;

  -- Get author name
  SELECT full_name INTO post_author_name
  FROM profiles
  WHERE id = post_author_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    related_type,
    actor_id
  )
  VALUES (
    NEW.mentioned_user_id,
    'mention',
    'You were mentioned',
    post_author_name || ' mentioned you in a post',
    NEW.post_id,
    'post',
    post_author_id
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to create notification when user is mentioned
CREATE TRIGGER notify_on_mention
  AFTER INSERT
  ON post_mentions
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentioned_users();

-- Grant permissions
GRANT EXECUTE ON FUNCTION extract_mentions TO authenticated;

-- Add comments
COMMENT ON TABLE post_mentions IS 'Stores @mentions from posts, linking to mentioned users';
COMMENT ON FUNCTION extract_mentions IS 'Extracts @mentions from content and resolves usernames to user IDs';
COMMENT ON FUNCTION sync_post_mentions IS 'Trigger function to automatically extract and store mentions';
COMMENT ON FUNCTION notify_mentioned_users IS 'Creates notifications for mentioned users';
