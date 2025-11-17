-- DNA | FEED - Fix get_universal_feed by recreating with qualified columns
-- Step 1: Drop existing function with old return type
DROP FUNCTION IF EXISTS public.get_universal_feed(
  uuid, text, uuid, uuid, uuid, integer, integer
);

-- Step 2: Recreate function with stable, qualified implementation
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
  author_id uuid,
  content text,
  post_type text,
  privacy_level text,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  event_id uuid,
  image_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id AS post_id,
    p.author_id,
    p.content,
    p.post_type,
    p.privacy_level,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.image_url,
    p.created_at
  FROM public.posts AS p
  WHERE
    -- Tab filtering
    (
      p_tab = 'all'
      OR (p_tab = 'network' AND p.privacy_level IN ('public', 'connections'))
      OR (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
    )
    -- Optional filters
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;