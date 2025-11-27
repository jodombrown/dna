-- DNA | FEED v2.0 — Canonical get_universal_feed RPC
-- Drops all previous overloads and creates ONE function matching frontend contract

CREATE OR REPLACE FUNCTION public.get_universal_feed(
  p_viewer_id    uuid,
  p_tab          text DEFAULT 'all',
  p_author_id    uuid DEFAULT NULL,
  p_space_id     uuid DEFAULT NULL,
  p_event_id     uuid DEFAULT NULL,
  p_limit        integer DEFAULT 20,
  p_offset       integer DEFAULT 0,
  p_ranking_mode text DEFAULT 'latest'
)
RETURNS TABLE (
  id                  uuid,
  author_id           uuid,
  author_username     text,
  author_full_name    text,
  author_avatar_url   text,
  content             text,
  title               text,
  subtitle            text,
  image_url           text,
  post_type           text,
  privacy_level       text,
  linked_entity_type  text,
  linked_entity_id    uuid,
  space_id            uuid,
  event_id            uuid,
  created_at          timestamptz,
  updated_at          timestamptz,
  likes_count         bigint,
  comments_count      bigint,
  user_has_liked      boolean,
  user_has_bookmarked boolean
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
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    prof.avatar_url AS author_avatar_url,
    p.content,
    p.title,
    p.subtitle,
    p.image_url,
    p.post_type,
    p.privacy_level,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,
    p.updated_at,
    COALESCE(likes.count, 0) AS likes_count,
    COALESCE(comments.count, 0) AS comments_count,
    EXISTS(
      SELECT 1 FROM post_likes pl
      WHERE pl.post_id = p.id AND pl.user_id = p_viewer_id
    ) AS user_has_liked,
    EXISTS(
      SELECT 1 FROM post_bookmarks pb
      WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id
    ) AS user_has_bookmarked
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS count
    FROM post_likes
    GROUP BY post_id
  ) likes ON p.id = likes.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS count
    FROM post_comments
    WHERE is_deleted = false
    GROUP BY post_id
  ) comments ON p.id = comments.post_id
  LEFT JOIN post_bookmarks pb_filter ON (
    p_tab = 'bookmarks' AND pb_filter.post_id = p.id AND pb_filter.user_id = p_viewer_id
  )
  WHERE
    p.is_deleted = false
    -- Tab logic
    AND (
      CASE p_tab
        WHEN 'all' THEN true
        WHEN 'my_posts' THEN p.author_id = COALESCE(p_author_id, p_viewer_id)
        WHEN 'bookmarks' THEN pb_filter.post_id IS NOT NULL
        WHEN 'network' THEN EXISTS(
          SELECT 1 FROM connections c
          WHERE ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
             OR (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
            AND c.status = 'accepted'
        )
        ELSE true
      END
    )
    -- Optional contextual filters
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY
    CASE 
      WHEN p_ranking_mode = 'top' THEN COALESCE(likes.count, 0)
      ELSE 0
    END DESC,
    p.created_at DESC,
    p.id DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;