-- DNA | FEED - Fix ambiguous column references in get_universal_feed
-- Resolves error: "column reference 'space_id' is ambiguous"

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  post_id uuid,
  author_id uuid,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  content text,
  media_url text,
  post_type text,
  privacy_level text,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  space_title text,
  event_id uuid,
  event_title text,
  created_at timestamptz,
  updated_at timestamptz,
  like_count bigint,
  comment_count bigint,
  share_count bigint,
  view_count bigint,
  bookmark_count bigint,
  has_liked boolean,
  has_bookmarked boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH user_connections AS (
    SELECT recipient_id AS connected_user_id FROM connections 
    WHERE requester_id = p_viewer_id AND status = 'accepted'
    UNION
    SELECT requester_id AS connected_user_id FROM connections 
    WHERE recipient_id = p_viewer_id AND status = 'accepted'
  ),
  user_spaces AS (
    SELECT cm.space_id FROM collaboration_memberships cm
    WHERE cm.user_id = p_viewer_id AND cm.status = 'approved'
  ),
  user_events AS (
    SELECT ea.event_id FROM event_attendees ea
    WHERE ea.user_id = p_viewer_id AND ea.status = 'going'
  )
  SELECT 
    p.id AS post_id,
    p.author_id,
    prof.username AS author_username,
    prof.display_name AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    p.content,
    p.media_url,
    p.post_type,
    p.privacy_level,
    p.linked_entity_type::text,
    p.linked_entity_id,
    p.space_id,
    cs.title AS space_title,
    p.event_id,
    e.title AS event_title,
    p.created_at,
    p.updated_at,
    COALESCE(pl.like_count, 0) AS like_count,
    COALESCE(pc.comment_count, 0) AS comment_count,
    COALESCE(ps.share_count, 0) AS share_count,
    COALESCE(pv.view_count, 0) AS view_count,
    COALESCE(pb.bookmark_count, 0) AS bookmark_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_viewer_id) AS has_liked,
    EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id) AS has_bookmarked
  FROM posts p
  LEFT JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN collaboration_spaces cs ON p.space_id = cs.id
  LEFT JOIN events e ON p.event_id = e.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id = p.id
  ) pl ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS comment_count FROM post_comments WHERE post_id = p.id
  ) pc ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS share_count FROM post_shares WHERE post_id = p.id
  ) ps ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS view_count FROM post_views WHERE post_id = p.id
  ) pv ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS bookmark_count FROM post_bookmarks WHERE post_id = p.id
  ) pb ON true
  WHERE 
    -- Privacy filtering
    (p.privacy_level = 'public' OR
     p.privacy_level = 'connections' AND p.author_id IN (SELECT connected_user_id FROM user_connections) OR
     p.author_id = p_viewer_id)
    -- Tab filtering
    AND (
      p_tab = 'all' OR
      (p_tab = 'network' AND (
        p.author_id IN (SELECT connected_user_id FROM user_connections) OR
        p.space_id IN (SELECT us.space_id FROM user_spaces us) OR
        p.event_id IN (SELECT ue.event_id FROM user_events ue)
      )) OR
      (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
    )
    -- Context filtering (fixed ambiguous column references)
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;