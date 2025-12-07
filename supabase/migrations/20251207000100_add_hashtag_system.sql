-- Migration: Add hashtag indexing system
-- Enables hashtag extraction, storage, and discovery

-- Create post_hashtags table
CREATE TABLE IF NOT EXISTS post_hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, hashtag)
);

-- Create indexes for fast lookups
CREATE INDEX idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag);
CREATE INDEX idx_post_hashtags_hashtag_lower ON post_hashtags(LOWER(hashtag));

-- RLS policies
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

-- Anyone can view hashtags
CREATE POLICY "Hashtags are viewable by everyone"
  ON post_hashtags FOR SELECT
  USING (true);

-- Only post authors (via trigger) can insert hashtags
CREATE POLICY "Hashtags can be inserted by authenticated users"
  ON post_hashtags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to extract hashtags from text
CREATE OR REPLACE FUNCTION extract_hashtags(content TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  hashtags TEXT[];
BEGIN
  -- Extract all hashtags using regex (matches #word)
  -- Hashtags must start with # and contain alphanumeric characters or underscores
  SELECT array_agg(DISTINCT LOWER(substring(match FROM 2)))
  INTO hashtags
  FROM regexp_matches(content, '#([A-Za-z0-9_]+)', 'g') AS match;

  RETURN COALESCE(hashtags, ARRAY[]::TEXT[]);
END;
$$;

-- Function to sync hashtags for a post
CREATE OR REPLACE FUNCTION sync_post_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hashtag_array TEXT[];
  hashtag TEXT;
BEGIN
  -- Extract hashtags from new content
  hashtag_array := extract_hashtags(NEW.content);

  -- Delete old hashtags for this post
  DELETE FROM post_hashtags WHERE post_id = NEW.id;

  -- Insert new hashtags
  IF array_length(hashtag_array, 1) > 0 THEN
    FOREACH hashtag IN ARRAY hashtag_array
    LOOP
      INSERT INTO post_hashtags (post_id, hashtag)
      VALUES (NEW.id, hashtag)
      ON CONFLICT (post_id, hashtag) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to auto-extract hashtags on post insert/update
CREATE TRIGGER sync_hashtags_on_post_change
  AFTER INSERT OR UPDATE OF content
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_post_hashtags();

-- Function to get posts by hashtag
CREATE OR REPLACE FUNCTION get_posts_by_hashtag(
  p_hashtag TEXT,
  p_viewer_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  author_headline TEXT,
  content TEXT,
  media_url TEXT,
  post_type TEXT,
  privacy_level TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  bookmark_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_bookmarked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    prof.full_name AS author_name,
    prof.username AS author_username,
    prof.avatar_url AS author_avatar,
    prof.headline AS author_headline,
    p.content,
    p.media_url,
    p.post_type,
    p.privacy_level,
    p.created_at,
    p.updated_at,

    (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id AND pc.is_deleted = FALSE) AS comment_count,
    (SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id) AS share_count,
    (SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id) AS bookmark_count,

    CASE
      WHEN p_viewer_id IS NOT NULL THEN
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_viewer_id)
      ELSE FALSE
    END AS user_has_liked,

    CASE
      WHEN p_viewer_id IS NOT NULL THEN
        EXISTS(SELECT 1 FROM post_bookmarks pb WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id)
      ELSE FALSE
    END AS user_has_bookmarked

  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  INNER JOIN post_hashtags ph ON p.id = ph.post_id
  WHERE
    LOWER(ph.hashtag) = LOWER(p_hashtag)
    AND p.status = 'published'
    AND p.is_deleted = FALSE
    AND (
      p.privacy_level = 'public' OR
      (p.privacy_level = 'connections' AND p_viewer_id IS NOT NULL AND (
        EXISTS(SELECT 1 FROM connections WHERE status = 'accepted' AND (
          (requester_id = p_viewer_id AND recipient_id = p.author_id) OR
          (requester_id = p.author_id AND recipient_id = p_viewer_id)
        ))
      )) OR
      p.author_id = p_viewer_id
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get trending hashtags
CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  hashtag TEXT,
  post_count BIGINT,
  recent_post_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ph.hashtag,
    COUNT(DISTINCT ph.post_id) AS post_count,
    COUNT(DISTINCT ph.post_id) FILTER (
      WHERE p.created_at >= NOW() - (p_days || ' days')::INTERVAL
    ) AS recent_post_count
  FROM post_hashtags ph
  INNER JOIN posts p ON ph.post_id = p.id
  WHERE
    p.status = 'published'
    AND p.is_deleted = FALSE
    AND p.privacy_level = 'public'
    AND p.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY ph.hashtag
  HAVING COUNT(DISTINCT ph.post_id) >= 2  -- Must have at least 2 posts
  ORDER BY recent_post_count DESC, post_count DESC
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION extract_hashtags TO authenticated;
GRANT EXECUTE ON FUNCTION get_posts_by_hashtag TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_trending_hashtags TO authenticated, anon;

-- Add comments
COMMENT ON TABLE post_hashtags IS 'Stores extracted hashtags from posts for discovery and search';
COMMENT ON FUNCTION extract_hashtags IS 'Extracts hashtags from post content using regex';
COMMENT ON FUNCTION sync_post_hashtags IS 'Trigger function to automatically extract and store hashtags';
COMMENT ON FUNCTION get_posts_by_hashtag IS 'Retrieves all posts with a specific hashtag';
COMMENT ON FUNCTION get_trending_hashtags IS 'Returns trending hashtags based on recent post count';
