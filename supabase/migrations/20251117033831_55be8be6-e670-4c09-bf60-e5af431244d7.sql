-- Drop and recreate get_universal_feed with correct column qualifications
DROP FUNCTION IF EXISTS get_universal_feed(uuid,text,uuid,uuid,uuid,text,integer,integer);

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_user_id uuid,
  p_feed_type text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_hashtag text DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  content text,
  media_url text,
  media_type text,
  post_type text,
  privacy text,
  created_at timestamptz,
  updated_at timestamptz,
  is_deleted boolean,
  space_id uuid,
  event_id uuid,
  author_full_name text,
  author_username text,
  author_avatar_url text,
  like_count bigint,
  comment_count bigint,
  is_liked_by_user boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.author_id,
    p.content,
    p.media_url,
    p.media_type,
    p.post_type,
    p.privacy,
    p.created_at,
    p.updated_at,
    p.is_deleted,
    p.space_id,
    p.event_id,
    pr.full_name as author_full_name,
    pr.username as author_username,
    pr.avatar_url as author_avatar_url,
    COALESCE(pl.like_count, 0) as like_count,
    COALESCE(pc.comment_count, 0) as comment_count,
    EXISTS(
      SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id
    ) as is_liked_by_user
  FROM posts p
  INNER JOIN profiles pr ON p.author_id = pr.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM post_likes
    GROUP BY post_id
  ) pl ON p.id = pl.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments
    WHERE is_deleted = false
    GROUP BY post_id
  ) pc ON p.id = pc.post_id
  WHERE 
    p.is_deleted = false
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
    AND (p_hashtag IS NULL OR p.content ILIKE '%#' || p_hashtag || '%')
    AND (
      CASE p_feed_type
        WHEN 'all' THEN true
        WHEN 'network' THEN EXISTS(
          SELECT 1 FROM connections c 
          WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id)
             OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
             AND c.status = 'accepted'
        )
        WHEN 'my_posts' THEN p.author_id = p_user_id
        ELSE true
      END
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;