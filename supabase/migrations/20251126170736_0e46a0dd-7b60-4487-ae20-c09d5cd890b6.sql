-- Add p_post_type parameter to get_universal_feed for story filtering
-- Drop all possible overloads
DROP FUNCTION IF EXISTS public.get_universal_feed(uuid,text,uuid,uuid,uuid,integer,integer,text);
DROP FUNCTION IF EXISTS public.get_universal_feed(uuid,text,uuid,uuid,uuid,text,integer,integer,text);
DROP FUNCTION IF EXISTS public.get_universal_feed CASCADE;

CREATE FUNCTION public.get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_post_type text DEFAULT NULL,
  p_limit integer DEFAULT 30,
  p_offset integer DEFAULT 0,
  p_ranking_mode text DEFAULT 'latest'
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  author_username text,
  author_full_name text,
  author_avatar_url text,
  author_headline text,
  content text,
  title text,
  post_type text,
  privacy_level text,
  image_url text,
  link_url text,
  link_title text,
  link_description text,
  created_at timestamptz,
  updated_at timestamptz,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean,
  user_has_bookmarked boolean,
  is_connection boolean,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  event_id uuid
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
    prof.username as author_username,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url,
    prof.headline as author_headline,
    p.content,
    p.title,
    p.post_type,
    p.privacy_level,
    p.image_url,
    p.link_url,
    p.link_title,
    p.link_description,
    p.created_at,
    p.updated_at,
    COALESCE(pl.likes_count, 0) as likes_count,
    COALESCE(pc.comments_count, 0) as comments_count,
    EXISTS(
      SELECT 1 FROM post_likes 
      WHERE post_id = p.id AND user_id = p_viewer_id
    ) as user_has_liked,
    EXISTS(
      SELECT 1 FROM post_bookmarks 
      WHERE post_id = p.id AND user_id = p_viewer_id
    ) as user_has_bookmarked,
    EXISTS(
      SELECT 1 FROM connections 
      WHERE (requester_id = p_viewer_id AND recipient_id = p.author_id AND status = 'accepted')
         OR (recipient_id = p_viewer_id AND requester_id = p.author_id AND status = 'accepted')
    ) as is_connection,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id
  FROM posts p
  INNER JOIN profiles prof ON prof.id = p.author_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as likes_count 
    FROM post_likes 
    WHERE post_id = p.id
  ) pl ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as comments_count 
    FROM post_comments 
    WHERE post_id = p.id AND is_deleted = false
  ) pc ON true
  WHERE 
    p.is_deleted = false
    AND (
      CASE 
        WHEN p_tab = 'all' THEN true
        WHEN p_tab = 'network' THEN 
          EXISTS(
            SELECT 1 FROM connections 
            WHERE (requester_id = p_viewer_id AND recipient_id = p.author_id AND status = 'accepted')
               OR (recipient_id = p_viewer_id AND requester_id = p.author_id AND status = 'accepted')
          )
        WHEN p_tab = 'my_posts' THEN p.author_id = p_viewer_id
        WHEN p_tab = 'bookmarks' THEN 
          EXISTS(
            SELECT 1 FROM post_bookmarks 
            WHERE post_id = p.id AND user_id = p_viewer_id
          )
        ELSE true
      END
    )
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
    AND (p_post_type IS NULL OR p.post_type = p_post_type)
  ORDER BY 
    CASE 
      WHEN p_ranking_mode = 'latest' THEN p.created_at
      ELSE p.created_at
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_universal_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_universal_feed TO anon;