-- Drop all existing get_universal_feed function overloads
DROP FUNCTION IF EXISTS public.get_universal_feed(uuid, text, uuid, uuid, uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_universal_feed(uuid, text, uuid, uuid, uuid, integer, integer, text, text);
DROP FUNCTION IF EXISTS public.get_universal_feed(uuid, text, uuid, uuid, uuid, integer, integer, timestamp with time zone, text);

-- Create single unified get_universal_feed function
CREATE OR REPLACE FUNCTION public.get_universal_feed(
  p_viewer_id UUID,
  p_tab TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0,
  p_ranking_mode TEXT DEFAULT 'latest'
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
    COALESCE(prof.username, '') AS author_username,
    COALESCE(prof.full_name, '') AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    p.content,
    p.image_url AS media_url,
    COALESCE(p.post_type, 'post') AS post_type,
    COALESCE(p.privacy_level, 'public') AS privacy_level,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    s.title AS space_title,
    p.event_id,
    e.title AS event_title,
    p.created_at,
    p.updated_at,
    COALESCE(
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id),
      0
    ) AS like_count,
    COALESCE(
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id),
      0
    ) AS comment_count,
    0::BIGINT AS share_count,
    0::BIGINT AS view_count,
    0::BIGINT AS bookmark_count,
    EXISTS(
      SELECT 1 FROM post_likes 
      WHERE post_id = p.id AND user_id = p_viewer_id
    ) AS has_liked,
    FALSE AS has_bookmarked
  FROM posts p
  LEFT JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN collaboration_spaces s ON p.space_id = s.id
  LEFT JOIN events e ON p.event_id = e.id
  WHERE 
    p.is_deleted = FALSE
    -- Tab filtering
    AND (
      (p_tab = 'all' AND (p.privacy_level = 'public' OR p.author_id = p_viewer_id))
      OR (p_tab = 'network' AND (
        p.privacy_level = 'public' 
        OR p.author_id = p_viewer_id
        OR EXISTS(
          SELECT 1 FROM connections 
          WHERE status = 'accepted'
          AND (
            (requester_id = p_viewer_id AND recipient_id = p.author_id)
            OR (requester_id = p.author_id AND recipient_id = p_viewer_id)
          )
        )
      ))
      OR (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
      OR (p_tab = 'bookmarks' AND FALSE) -- Bookmarks not implemented yet
    )
    -- Author filter
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    -- Space filter
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    -- Event filter
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY 
    CASE 
      WHEN p_ranking_mode = 'latest' THEN p.created_at
      ELSE p.created_at
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_universal_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_universal_feed TO anon;