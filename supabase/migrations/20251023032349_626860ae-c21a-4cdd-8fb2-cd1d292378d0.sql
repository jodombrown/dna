-- Fix ambiguous column reference in get_feed_posts function
DROP FUNCTION IF EXISTS get_feed_posts(uuid, text, integer, integer);

CREATE OR REPLACE FUNCTION get_feed_posts(
  p_user_id uuid,
  p_feed_type text,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  post_id uuid,
  author_id uuid,
  author_username text,
  author_full_name text,
  author_avatar_url text,
  author_headline text,
  content text,
  post_type text,
  privacy_level text,
  image_url text,
  link_url text,
  link_title text,
  link_description text,
  created_at timestamp with time zone,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean,
  is_connection boolean
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
    COALESCE(like_counts.count, 0)::bigint AS likes_count,
    COALESCE(comment_counts.count, 0)::bigint AS comments_count,
    EXISTS(
      SELECT 1 FROM post_likes pl 
      WHERE pl.post_id = p.id AND pl.user_id = p_user_id
    ) AS user_has_liked,
    EXISTS(
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id)
         OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
        AND c.status = 'accepted'
    ) AS is_connection
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint AS count
    FROM post_likes pl
    WHERE pl.post_id = p.id
  ) like_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint AS count
    FROM post_comments pc
    WHERE pc.post_id = p.id
  ) comment_counts ON true
  WHERE p.is_deleted = false
    AND (
      CASE 
        WHEN p_feed_type = 'all' THEN 
          p.privacy_level = 'public'
        WHEN p_feed_type = 'connections' THEN
          EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id)
               OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          )
        WHEN p_feed_type = 'my_posts' THEN
          p.author_id = p_user_id
        ELSE false
      END
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;