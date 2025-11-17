-- Fix get_universal_feed function to resolve ambiguous post_id reference
DROP FUNCTION IF EXISTS get_universal_feed(uuid, text, uuid, uuid, uuid, integer, integer, text, text);

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_cursor text DEFAULT NULL,
  p_ranking_mode text DEFAULT 'latest'
)
RETURNS TABLE (
  post_id uuid,
  post_type text,
  content text,
  image_url text,
  created_at timestamptz,
  author_id uuid,
  author_full_name text,
  author_avatar_url text,
  author_headline text,
  like_count bigint,
  comment_count bigint,
  viewer_has_liked boolean,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  space_title text,
  space_image_url text,
  event_id uuid,
  event_title text,
  event_image_url text,
  privacy_level text,
  reshare_count bigint,
  original_post_id uuid,
  original_author_id uuid,
  original_author_full_name text,
  original_author_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH viewer_network AS (
    SELECT 
      CASE 
        WHEN c.requester_id = p_viewer_id THEN c.recipient_id
        ELSE c.requester_id
      END as connection_id
    FROM connections c
    WHERE (c.requester_id = p_viewer_id OR c.recipient_id = p_viewer_id)
      AND c.status = 'accepted'
  )
  SELECT 
    p.id as post_id,
    p.post_type,
    p.content,
    p.image_url,
    p.created_at,
    p.author_id,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url,
    prof.headline as author_headline,
    COALESCE(pl.like_count, 0)::bigint as like_count,
    COALESCE(pc.comment_count, 0)::bigint as comment_count,
    EXISTS(
      SELECT 1 FROM post_likes 
      WHERE post_id = p.id AND user_id = p_viewer_id
    ) as viewer_has_liked,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    s.title as space_title,
    s.image_url as space_image_url,
    p.event_id,
    e.title as event_title,
    e.image_url as event_image_url,
    p.privacy_level,
    COALESCE(rs.reshare_count, 0)::bigint as reshare_count,
    p.original_post_id,
    rp.author_id as original_author_id,
    rp_prof.full_name as original_author_full_name,
    rp_prof.avatar_url as original_author_avatar_url
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN spaces s ON p.space_id = s.id
  LEFT JOIN events e ON p.event_id = e.id
  LEFT JOIN posts rp ON p.original_post_id = rp.id
  LEFT JOIN profiles rp_prof ON rp.author_id = rp_prof.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint as like_count 
    FROM post_likes 
    WHERE post_id = p.id
  ) pl ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint as comment_count 
    FROM post_comments 
    WHERE post_id = p.id
  ) pc ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint as reshare_count 
    FROM posts 
    WHERE original_post_id = p.id
  ) rs ON true
  WHERE 
    -- Privacy filter
    (p.privacy_level = 'public' 
     OR p.author_id = p_viewer_id
     OR (p.privacy_level = 'connections' AND EXISTS(SELECT 1 FROM viewer_network WHERE connection_id = p.author_id))
     OR (p.privacy_level = 'space' AND p.space_id IS NOT NULL)
     OR (p.privacy_level = 'event' AND p.event_id IS NOT NULL))
    -- Tab filters
    AND (
      CASE 
        WHEN p_tab = 'all' THEN true
        WHEN p_tab = 'network' THEN p.author_id IN (SELECT connection_id FROM viewer_network)
        WHEN p_tab = 'my_posts' THEN p.author_id = p_viewer_id
        WHEN p_tab = 'bookmarks' THEN EXISTS(
          SELECT 1 FROM post_bookmarks 
          WHERE post_id = p.id AND user_id = p_viewer_id
        )
        ELSE true
      END
    )
    -- Context filters
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY 
    CASE 
      WHEN p_ranking_mode = 'top' THEN COALESCE(pl.like_count, 0) + COALESCE(pc.comment_count, 0) * 2
      ELSE 0
    END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;