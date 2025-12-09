-- Drop existing function and recreate with link data columns
DROP FUNCTION IF EXISTS get_universal_feed(uuid, text, uuid, uuid, uuid, integer, integer, text);

CREATE FUNCTION get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_ranking_mode text DEFAULT 'latest'
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  author_username text,
  author_full_name text,
  author_avatar_url text,
  content text,
  title text,
  subtitle text,
  image_url text,
  post_type text,
  privacy_level text,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  event_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean,
  user_has_bookmarked boolean,
  link_url text,
  link_title text,
  link_description text,
  link_metadata jsonb
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
    p.link_metadata
  FROM posts p
  JOIN profiles pr ON pr.id = p.author_id
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