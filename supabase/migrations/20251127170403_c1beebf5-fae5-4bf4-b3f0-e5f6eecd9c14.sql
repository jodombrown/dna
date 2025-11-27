-- DNA | FEED v2.0 — Canonical get_universal_feed RPC
-- Force-drop any existing version with defaults, then recreate canonical function

DROP FUNCTION IF EXISTS public.get_universal_feed(
  uuid,
  text,
  uuid,
  uuid,
  uuid,
  integer,
  integer,
  text
);

CREATE OR REPLACE FUNCTION public.get_universal_feed(
  p_viewer_id    uuid,
  p_tab          text,
  p_author_id    uuid,
  p_space_id     uuid,
  p_event_id     uuid,
  p_limit        integer,
  p_offset       integer,
  p_ranking_mode text
)
RETURNS TABLE (
  id                   uuid,
  author_id            uuid,
  author_username      text,
  author_full_name     text,
  author_avatar_url    text,
  content              text,
  title                text,
  subtitle             text,
  image_url            text,
  post_type            text,
  privacy_level        text,
  linked_entity_type   text,
  linked_entity_id     uuid,
  space_id             uuid,
  event_id             uuid,
  created_at           timestamptz,
  updated_at           timestamptz,
  likes_count          bigint,
  comments_count       bigint,
  user_has_liked       boolean,
  user_has_bookmarked  boolean
)
LANGUAGE sql
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      p.id,
      p.author_id,
      prof.username       AS author_username,
      prof.full_name      AS author_full_name,
      prof.avatar_url     AS author_avatar_url,
      p.content,
      p.title,
      p.subtitle,
      p.image_url,
      lower(p.post_type)  AS post_type,
      p.privacy_level,
      p.linked_entity_type,
      p.linked_entity_id,
      p.space_id,
      p.event_id,
      p.created_at,
      p.updated_at,
      COALESCE(l.likes_count, 0)      AS likes_count,
      COALESCE(c.comments_count, 0)   AS comments_count,
      COALESCE(ul.user_has_liked, false)        AS user_has_liked,
      COALESCE(ub.user_has_bookmarked, false)   AS user_has_bookmarked
    FROM public.posts p
    JOIN public.profiles prof
      ON prof.id = p.author_id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::bigint AS likes_count
      FROM public.post_likes
      GROUP BY post_id
    ) l ON l.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::bigint AS comments_count
      FROM public.comments
      GROUP BY post_id
    ) c ON c.post_id = p.id
    LEFT JOIN (
      SELECT post_id, TRUE AS user_has_liked
      FROM public.post_likes
      WHERE user_id = p_viewer_id
    ) ul ON ul.post_id = p.id
    LEFT JOIN (
      SELECT post_id, TRUE AS user_has_bookmarked
      FROM public.post_bookmarks
      WHERE user_id = p_viewer_id
    ) ub ON ub.post_id = p.id
    WHERE
      p.is_deleted = FALSE
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id  IS NULL OR p.space_id  = p_space_id)
      AND (p_event_id  IS NULL OR p.event_id  = p_event_id)
  ),
  tab_filtered AS (
    SELECT b.*
    FROM base b
    LEFT JOIN public.post_bookmarks pb
      ON pb.post_id = b.id AND pb.user_id = p_viewer_id
    WHERE
      CASE p_tab
        WHEN 'my_posts' THEN b.author_id = COALESCE(p_author_id, p_viewer_id)
        WHEN 'bookmarks' THEN pb.post_id IS NOT NULL
        WHEN 'network' THEN EXISTS (
          SELECT 1 FROM public.connections c
          WHERE c.status = 'accepted'
            AND (
              (c.requester_id = p_viewer_id AND c.recipient_id = b.author_id) OR
              (c.recipient_id = p_viewer_id AND c.requester_id = b.author_id)
            )
        )
        ELSE TRUE
      END
  )
  SELECT
    id,
    author_id,
    author_username,
    author_full_name,
    author_avatar_url,
    content,
    title,
    subtitle,
    image_url,
    post_type,
    privacy_level,
    linked_entity_type,
    linked_entity_id,
    space_id,
    event_id,
    created_at,
    updated_at,
    likes_count,
    comments_count,
    user_has_liked,
    user_has_bookmarked
  FROM tab_filtered
  ORDER BY
    CASE WHEN p_ranking_mode = 'top' THEN likes_count ELSE 0 END DESC,
    created_at DESC,
    id DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;