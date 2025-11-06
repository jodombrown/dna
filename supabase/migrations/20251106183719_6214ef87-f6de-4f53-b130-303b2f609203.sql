-- Drop and recreate get_feed_posts function to include original post data for reposts
DROP FUNCTION IF EXISTS get_feed_posts(UUID, TEXT, INT, INT);

CREATE FUNCTION get_feed_posts(
  p_user_id UUID,
  p_feed_type TEXT,
  p_limit INT DEFAULT 10,
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
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  is_connection BOOLEAN,
  original_post_id UUID,
  shared_by UUID,
  share_commentary TEXT,
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
    p.id AS post_id,
    p.author_id,
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    prof.avatar_url AS author_avatar_url,
    prof.headline AS author_headline,
    p.content,
    p.post_type,
    p.privacy_level,
    p.image_url,
    p.link_url,
    p.link_title,
    p.link_description,
    p.created_at,
    COALESCE(likes.like_count, 0) AS likes_count,
    COALESCE(comments.comment_count, 0) AS comments_count,
    EXISTS(
      SELECT 1 FROM post_reactions pr
      WHERE pr.post_id = p.id AND pr.user_id = p_user_id
    ) AS user_has_liked,
    EXISTS(
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_user_id AND c.receiver_id = p.author_id)
         OR  (c.receiver_id = p_user_id AND c.requester_id = p.author_id))
        AND c.status = 'accepted'
    ) AS is_connection,
    -- Repost fields
    p.original_post_id,
    p.shared_by,
    p.share_commentary,
    -- Original post data (if this is a repost)
    op.author_id AS original_author_id,
    op_prof.username AS original_author_username,
    op_prof.full_name AS original_author_full_name,
    op_prof.avatar_url AS original_author_avatar_url,
    op_prof.headline AS original_author_headline,
    op.content AS original_content,
    op.image_url AS original_image_url,
    op.created_at AS original_created_at
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN posts op ON p.original_post_id = op.id
  LEFT JOIN profiles op_prof ON op.author_id = op_prof.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS like_count
    FROM post_reactions
    GROUP BY post_id
  ) likes ON p.id = likes.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS comment_count
    FROM post_comments
    WHERE is_deleted = FALSE
    GROUP BY post_id
  ) comments ON p.id = comments.post_id
  WHERE p.is_deleted = FALSE
    AND (
      CASE 
        -- All public posts + user's own posts + connections' posts
        WHEN p_feed_type = 'all' THEN 
          (p.privacy_level = 'public')
          OR (p.author_id = p_user_id)
          OR (p.privacy_level = 'connections' AND EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_user_id AND c.receiver_id = p.author_id)
               OR  (c.receiver_id = p_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          ))
        -- Only connections' posts
        WHEN p_feed_type = 'connections' THEN
          EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_user_id AND c.receiver_id = p.author_id)
               OR  (c.receiver_id = p_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          )
        -- Only user's own posts
        WHEN p_feed_type = 'my_posts' THEN
          p.author_id = p_user_id
        ELSE FALSE
      END
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;