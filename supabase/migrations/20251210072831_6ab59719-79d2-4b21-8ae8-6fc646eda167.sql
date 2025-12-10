-- Drop existing function and recreate with original post data support
DROP FUNCTION IF EXISTS get_universal_feed(uuid,text,uuid,uuid,uuid,integer,integer,text);

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id UUID,
  p_tab TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_ranking_mode TEXT DEFAULT 'latest'
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  post_type TEXT,
  privacy_level TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_bookmarked BOOLEAN,
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  link_metadata JSONB,
  original_post_id UUID,
  original_author_id UUID,
  original_author_username TEXT,
  original_author_full_name TEXT,
  original_author_avatar_url TEXT,
  original_author_headline TEXT,
  original_content TEXT,
  original_image_url TEXT,
  original_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    pr.username AS author_username,
    COALESCE(pr.full_name, pr.first_name || ' ' || pr.last_name, 'Unknown User') AS author_full_name,
    pr.avatar_url AS author_avatar_url,
    p.content,
    p.title,
    p.subtitle,
    p.image_url,
    p.post_type::text,
    COALESCE(p.privacy_level, 'public')::text AS privacy_level,
    p.linked_entity_type::text,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,
    p.updated_at,
    COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id), 0) AS likes_count,
    COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comments_count,
    EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_viewer_id) AS user_has_liked,
    EXISTS(SELECT 1 FROM post_bookmarks pb WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id) AS user_has_bookmarked,
    p.link_url,
    p.link_title,
    p.link_description,
    p.link_metadata,
    p.original_post_id,
    op.author_id AS original_author_id,
    opr.username AS original_author_username,
    COALESCE(opr.full_name, opr.first_name || ' ' || opr.last_name, 'Unknown User') AS original_author_full_name,
    opr.avatar_url AS original_author_avatar_url,
    opr.headline AS original_author_headline,
    op.content AS original_content,
    op.image_url AS original_image_url,
    op.created_at AS original_created_at
  FROM posts p
  JOIN profiles pr ON pr.id = p.author_id
  LEFT JOIN posts op ON op.id = p.original_post_id
  LEFT JOIN profiles opr ON opr.id = op.author_id
  WHERE 
    p.is_deleted = FALSE
    AND (
      (p_tab = 'all') OR
      (p_tab = 'my_posts' AND p.author_id = p_viewer_id) OR
      (p_tab = 'bookmarks' AND EXISTS(SELECT 1 FROM post_bookmarks pb WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id)) OR
      (p_tab = 'network' AND (
        p.author_id = p_viewer_id OR
        EXISTS(SELECT 1 FROM connections c WHERE c.status = 'accepted' AND ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id) OR (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id)))
      )) OR
      (p_tab = 'for_you')
    )
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY
    CASE WHEN p_ranking_mode = 'latest' THEN p.created_at END DESC,
    CASE WHEN p_ranking_mode = 'top' THEN (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;