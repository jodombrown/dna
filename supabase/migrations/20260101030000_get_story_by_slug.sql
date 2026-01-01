-- Create RPC function to get a story by slug or UUID
-- This function uses SECURITY DEFINER to bypass RLS and apply consistent visibility logic
-- matching the get_universal_feed function

CREATE OR REPLACE FUNCTION public.get_story_by_slug(
  p_identifier text,
  p_viewer_id uuid DEFAULT NULL
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
  subtitle text,
  post_type text,
  privacy_level text,
  image_url text,
  slug text,
  space_id uuid,
  event_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean,
  user_has_bookmarked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_uuid boolean;
BEGIN
  -- Check if identifier is a UUID
  v_is_uuid := p_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    prof.avatar_url AS author_avatar_url,
    prof.headline AS author_headline,
    p.content,
    p.title,
    p.subtitle,
    p.post_type,
    p.privacy_level,
    p.image_url,
    p.slug,
    p.space_id,
    p.event_id,
    p.created_at,
    p.updated_at,
    COALESCE(likes.like_count, 0)::bigint AS likes_count,
    COALESCE(comments.comment_count, 0)::bigint AS comments_count,
    CASE
      WHEN p_viewer_id IS NULL THEN false
      ELSE EXISTS(
        SELECT 1 FROM post_reactions pr
        WHERE pr.post_id = p.id AND pr.user_id = p_viewer_id
      )
    END AS user_has_liked,
    CASE
      WHEN p_viewer_id IS NULL THEN false
      ELSE EXISTS(
        SELECT 1 FROM post_bookmarks pb
        WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id
      )
    END AS user_has_bookmarked
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
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
    -- Match by UUID or slug
    AND (
      (v_is_uuid AND p.id = p_identifier::uuid)
      OR (NOT v_is_uuid AND p.slug = p_identifier)
    )
    -- Apply visibility rules (same as get_universal_feed)
    AND (
      -- Public posts are visible to everyone
      p.privacy_level = 'public'
      -- Owner can always see their own posts
      OR (p_viewer_id IS NOT NULL AND p.author_id = p_viewer_id)
      -- Connections can see connection-level posts
      OR (
        p_viewer_id IS NOT NULL
        AND p.privacy_level = 'connections'
        AND EXISTS(
          SELECT 1 FROM connections c
          WHERE ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
             OR  (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
            AND c.status = 'accepted'
        )
      )
    )
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_story_by_slug(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_story_by_slug(text, uuid) TO anon;
