-- Migration: Add get_popular_posts RPC for showing trending content to new users
-- This helps solve the cold start problem by showing engaging content

CREATE OR REPLACE FUNCTION get_popular_posts(
  p_limit INTEGER DEFAULT 10,
  p_viewer_id UUID DEFAULT NULL
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
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  bookmark_count BIGINT,
  engagement_score NUMERIC,
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
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,

    -- Engagement counts
    (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id AND pc.is_deleted = FALSE) AS comment_count,
    (SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id) AS share_count,
    (SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id) AS bookmark_count,

    -- Engagement score: (likes*1 + comments*3 + shares*5 + bookmarks*2) / age_in_hours
    -- This prioritizes recent, highly-engaged content
    (
      (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) * 1.0 +
      (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id AND pc.is_deleted = FALSE) * 3.0 +
      (SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id) * 5.0 +
      (SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id) * 2.0
    ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 1.0) AS engagement_score,

    -- User engagement flags (if viewer provided)
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
    -- Only published posts
    p.status = 'published'
    AND p.is_deleted = FALSE

    -- Only public posts (since this is for discovery)
    AND p.privacy_level = 'public'

    -- Only posts from last 7 days to keep it fresh
    AND p.created_at >= NOW() - INTERVAL '7 days'

    -- Optional: Only from profiles with decent completion (they're likely real users)
    AND prof.profile_completion_percentage >= 40

  -- Sort by engagement score descending
  ORDER BY engagement_score DESC, p.created_at DESC

  LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_popular_posts TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_popular_posts IS 'Returns popular/trending posts from the last 7 days, sorted by engagement score. Used for cold start / new user experience.';
