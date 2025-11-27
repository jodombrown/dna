-- Fix search_path security warning for get_universal_feed
CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id UUID,
  p_tab TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_post_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_ranking_mode TEXT DEFAULT 'latest'
)
RETURNS TABLE(
  id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  post_type TEXT,
  privacy_level TEXT,
  image_url TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_bookmarked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    prof.avatar_url AS author_avatar_url,
    p.title,
    p.subtitle,
    p.content,
    p.post_type,
    p.privacy_level,
    p.image_url,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,
    p.updated_at,
    COALESCE(COUNT(DISTINCT pl.id), 0) AS likes_count,
    COALESCE(COUNT(DISTINCT pc.id), 0) AS comments_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_viewer_id) AS user_has_liked,
    EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id) AS user_has_bookmarked
  FROM posts p
  LEFT JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN post_likes pl ON p.id = pl.post_id
  LEFT JOIN post_comments pc ON p.id = pc.post_id
  WHERE
    p.is_deleted = false
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
    AND (p_post_type IS NULL OR p.post_type = p_post_type)
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
    AND (
      CASE p_tab
        WHEN 'all' THEN true
        WHEN 'network' THEN EXISTS(
          SELECT 1 FROM connections
          WHERE (requester_id = p_viewer_id AND recipient_id = p.author_id AND status = 'accepted')
             OR (recipient_id = p_viewer_id AND requester_id = p.author_id AND status = 'accepted')
        )
        WHEN 'my_posts' THEN p.author_id = p_viewer_id
        WHEN 'bookmarks' THEN EXISTS(
          SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id
        )
        ELSE true
      END
    )
  GROUP BY p.id, prof.id
  ORDER BY
    CASE WHEN p_ranking_mode = 'latest' THEN p.created_at END DESC,
    CASE WHEN p_ranking_mode = 'top' THEN COUNT(DISTINCT pl.id) END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;