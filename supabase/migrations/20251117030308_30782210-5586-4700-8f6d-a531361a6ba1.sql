-- Fix ambiguous column reference in get_universal_feed
DROP FUNCTION IF EXISTS get_universal_feed(UUID, TEXT, UUID, UUID, UUID, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_user_id UUID,
  p_feed_type TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_hashtag TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  author_headline TEXT,
  content TEXT,
  post_type TEXT,
  privacy_level TEXT,
  image_url TEXT,
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  views_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_saved BOOLEAN,
  is_connection BOOLEAN,
  original_post_id UUID,
  shared_by TEXT,
  share_commentary TEXT,
  original_author_id UUID,
  original_author_username TEXT,
  original_author_full_name TEXT,
  original_author_avatar_url TEXT,
  original_author_headline TEXT,
  original_content TEXT,
  original_image_url TEXT,
  original_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH user_connections AS (
    SELECT 
      CASE 
        WHEN requester_id = p_user_id THEN recipient_id
        WHEN recipient_id = p_user_id THEN requester_id
      END as connected_user_id
    FROM connections
    WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
      AND status = 'accepted'
  ),
  user_spaces AS (
    SELECT DISTINCT sm.space_id
    FROM space_members sm
    WHERE sm.user_id = p_user_id AND sm.status = 'active'
  ),
  filtered_posts AS (
    SELECT p.*
    FROM posts p
    WHERE p.is_deleted = false
      AND (p.privacy_level = 'public' OR p.author_id = p_user_id)
      AND (
        p_feed_type = 'all' OR
        (p_feed_type = 'network' AND (
          p.author_id IN (SELECT connected_user_id FROM user_connections) OR
          p.space_id IN (SELECT space_id FROM user_spaces) OR
          p.author_id = p_user_id
        )) OR
        (p_feed_type = 'my_posts' AND p.author_id = p_user_id)
      )
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id IS NULL OR p.space_id = p_space_id)
      AND (p_event_id IS NULL OR p.event_id = p_event_id)
      AND (p_hashtag IS NULL OR p.content ILIKE '%' || p_hashtag || '%')
  )
  SELECT 
    fp.id as post_id,
    fp.author_id,
    prof.username as author_username,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url,
    prof.headline as author_headline,
    fp.content,
    fp.post_type,
    fp.privacy_level,
    fp.image_url,
    fp.link_url,
    fp.link_title,
    fp.link_description,
    fp.linked_entity_type,
    fp.linked_entity_id,
    fp.space_id,
    fp.event_id,
    fp.created_at,
    COALESCE(like_counts.count, 0)::BIGINT as likes_count,
    COALESCE(comment_counts.count, 0)::BIGINT as comments_count,
    COALESCE(share_counts.count, 0)::BIGINT as shares_count,
    COALESCE(view_counts.count, 0)::BIGINT as views_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = fp.id AND user_id = p_user_id) as user_has_liked,
    EXISTS(SELECT 1 FROM saved_posts WHERE post_id = fp.id AND user_id = p_user_id) as user_has_saved,
    EXISTS(SELECT 1 FROM user_connections WHERE connected_user_id = fp.author_id) as is_connection,
    CASE WHEN fp.post_type = 'reshare' THEN fp.linked_entity_id ELSE NULL END as original_post_id,
    CASE WHEN fp.post_type = 'reshare' THEN prof.username ELSE NULL END as shared_by,
    CASE WHEN fp.post_type = 'reshare' THEN fp.content ELSE NULL END as share_commentary,
    op.author_id as original_author_id,
    op_prof.username as original_author_username,
    op_prof.full_name as original_author_full_name,
    op_prof.avatar_url as original_author_avatar_url,
    op_prof.headline as original_author_headline,
    op.content as original_content,
    op.image_url as original_image_url,
    op.created_at as original_created_at
  FROM filtered_posts fp
  LEFT JOIN profiles prof ON fp.author_id = prof.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_likes WHERE post_id = fp.id
  ) like_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_comments WHERE post_id = fp.id AND is_deleted = false
  ) comment_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_shares WHERE post_id = fp.id
  ) share_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_views WHERE post_id = fp.id
  ) view_counts ON true
  LEFT JOIN posts op ON (fp.post_type = 'reshare' AND fp.linked_entity_type = 'post' AND op.id = fp.linked_entity_id)
  LEFT JOIN profiles op_prof ON op.author_id = op_prof.id
  ORDER BY fp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;