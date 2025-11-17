-- Fix get_universal_feed to remove non-existent view_count column
DROP FUNCTION IF EXISTS public.get_universal_feed(UUID, TEXT, UUID, UUID, UUID, INT, INT);

CREATE FUNCTION public.get_universal_feed(
  p_viewer_id UUID,
  p_tab TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  media_url TEXT,
  post_type TEXT,
  privacy_level TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  space_title TEXT,
  event_id UUID,
  event_title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  view_count BIGINT,
  bookmark_count BIGINT,
  has_liked BOOLEAN,
  has_bookmarked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS post_id,
    p.author_id,
    COALESCE(prof.username, 'unknown') AS author_username,
    COALESCE(prof.display_name, prof.username, 'Unknown User') AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    p.content,
    p.image_url AS media_url,
    p.post_type,
    p.privacy_level,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    s.name AS space_title,
    p.event_id,
    e.title AS event_title,
    p.created_at,
    p.updated_at,
    -- Fix: Use explicit table aliases in subqueries
    COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id), 0)::BIGINT AS like_count,
    COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id), 0)::BIGINT AS comment_count,
    COALESCE((SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id), 0)::BIGINT AS share_count,
    0::BIGINT AS view_count, -- Removed reference to non-existent p.view_count column
    COALESCE((SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id), 0)::BIGINT AS bookmark_count,
    EXISTS(SELECT 1 FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = p_viewer_id) AS has_liked,
    EXISTS(SELECT 1 FROM post_bookmarks pb2 WHERE pb2.post_id = p.id AND pb2.user_id = p_viewer_id) AS has_bookmarked
  FROM posts p
  LEFT JOIN profiles prof ON prof.id = p.author_id
  LEFT JOIN spaces s ON s.id = p.space_id
  LEFT JOIN events e ON e.id = p.event_id
  WHERE
    p.is_deleted = FALSE
    -- Privacy filter
    AND (
      p.privacy_level = 'public'
      OR p.author_id = p_viewer_id
      OR (
        p.privacy_level = 'connections'
        AND EXISTS (
          SELECT 1 FROM connections c
          WHERE (c.requester_id = p_viewer_id AND c.recipient_id = p.author_id AND c.status = 'accepted')
             OR (c.requester_id = p.author_id AND c.recipient_id = p_viewer_id AND c.status = 'accepted')
        )
      )
    )
    -- Tab filter
    AND (
      p_tab = 'all'
      OR (p_tab = 'network' AND EXISTS (
        SELECT 1 FROM connections c2
        WHERE (c2.requester_id = p_viewer_id AND c2.recipient_id = p.author_id AND c2.status = 'accepted')
           OR (c2.requester_id = p.author_id AND c2.recipient_id = p_viewer_id AND c2.status = 'accepted')
      ))
      OR (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
      OR (p_tab = 'bookmarks' AND EXISTS (
        SELECT 1 FROM post_bookmarks pb3
        WHERE pb3.post_id = p.id AND pb3.user_id = p_viewer_id
      ))
    )
    -- Context filters
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;