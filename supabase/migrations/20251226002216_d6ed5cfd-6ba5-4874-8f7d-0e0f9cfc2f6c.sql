-- Backfill hashtags for existing posts that have #tags in content
-- This will process all posts with hashtags that weren't linked

-- First, create a one-time function to process existing posts
CREATE OR REPLACE FUNCTION backfill_post_hashtags()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post RECORD;
BEGIN
  -- Find all posts with hashtags in content that don't have post_hashtags entries
  FOR v_post IN
    SELECT DISTINCT p.id, p.content, p.author_id
    FROM posts p
    WHERE p.content ~ '#[A-Za-z0-9_]+'
    AND p.is_deleted = false
    AND NOT EXISTS (
      SELECT 1 FROM post_hashtags ph WHERE ph.post_id = p.id
    )
  LOOP
    -- Process hashtags for this post (correct arg order: p_post_id, p_user_id, p_content)
    PERFORM process_post_hashtags(v_post.id, v_post.author_id, v_post.content);
  END LOOP;
END;
$$;

-- Run the backfill
SELECT backfill_post_hashtags();

-- Clean up the function after use
DROP FUNCTION IF EXISTS backfill_post_hashtags();