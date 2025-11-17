-- DNA | FEED - Enrich get_universal_feed to match frontend expectations
-- Drop and recreate with all columns required by UniversalFeedItem
DROP FUNCTION IF EXISTS public.get_universal_feed(
  uuid, text, uuid, uuid, uuid, integer, integer
);

CREATE FUNCTION public.get_universal_feed(
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
  id uuid,
  author_id uuid,
  author_username text,
  author_full_name text,
  author_display_name text,
  author_avatar_url text,
  content text,
  post_type text,
  privacy_level text,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  event_id uuid,
  image_url text,
  media_url text,
  like_count integer,
  comment_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  WITH base AS (
    SELECT
      p.id AS post_id,
      p.id AS id,
      p.author_id,
      p.content,
      p.post_type,
      p.privacy_level,
      p.linked_entity_type,
      p.linked_entity_id,
      p.space_id,
      p.event_id,
      p.image_url,
      p.created_at,
      p.updated_at
    FROM public.posts AS p
    WHERE
      (
        p_tab = 'all'
        OR (p_tab = 'network' AND p.privacy_level IN ('public', 'connections'))
        OR (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
      )
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id IS NULL OR p.space_id = p_space_id)
      AND (p_event_id IS NULL OR p.event_id = p_event_id)
  )
  SELECT
    b.post_id,
    b.id,
    b.author_id,
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    COALESCE(prof.full_name, prof.username) AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    b.content,
    b.post_type,
    b.privacy_level,
    b.linked_entity_type,
    b.linked_entity_id,
    b.space_id,
    b.event_id,
    b.image_url,
    b.image_url AS media_url,
    COALESCE(lc.like_count, 0) AS like_count,
    COALESCE(cc.comment_count, 0) AS comment_count,
    b.created_at,
    b.updated_at
  FROM base b
  LEFT JOIN public.profiles AS prof ON prof.id = b.author_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS like_count
    FROM public.post_likes pl
    WHERE pl.post_id = b.post_id
  ) lc ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS comment_count
    FROM public.post_comments pc
    WHERE pc.post_id = b.post_id
  ) cc ON true
  ORDER BY b.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;