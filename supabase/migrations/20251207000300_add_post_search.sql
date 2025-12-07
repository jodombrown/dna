-- Migration: Add full-text post search
-- Enables searching posts by content, author, hashtags with filters

-- Function to search posts with filters
CREATE OR REPLACE FUNCTION search_posts(
  p_query TEXT,
  p_viewer_id UUID DEFAULT NULL,
  p_author_id UUID DEFAULT NULL,
  p_post_type TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
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
  WHERE
    p.status = 'published'
    AND p.is_deleted = FALSE

    -- Privacy filtering
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

    -- Text search (case-insensitive search in content and author name)
    AND (
      p_query IS NULL OR
      p_query = '' OR
      LOWER(p.content) LIKE '%' || LOWER(p_query) || '%' OR
      LOWER(prof.full_name) LIKE '%' || LOWER(p_query) || '%' OR
      LOWER(prof.username) LIKE '%' || LOWER(p_query) || '%'
    )

    -- Author filter
    AND (p_author_id IS NULL OR p.author_id = p_author_id)

    -- Post type filter
    AND (p_post_type IS NULL OR p.post_type = p_post_type)

    -- Date range filters
    AND (p_date_from IS NULL OR p.created_at >= p_date_from)
    AND (p_date_to IS NULL OR p.created_at <= p_date_to)

  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_posts TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION search_posts IS 'Full-text search for posts with optional filters for author, post type, and date range';
