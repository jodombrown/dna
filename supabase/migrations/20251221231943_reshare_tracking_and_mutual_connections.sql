-- =============================================================================
-- DNA Interconnection Features: Reshare Tracking + Mutual Connections Enhancements
-- =============================================================================

-- Part 1: Add reshare_count column to posts if not exists
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'reshare_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN reshare_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Part 2: Create/Update functions to increment/decrement reshare counts
-- =============================================================================

-- Function to increment reshare count
CREATE OR REPLACE FUNCTION increment_reshare_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE posts
  SET reshare_count = COALESCE(reshare_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- Function to decrement reshare count
CREATE OR REPLACE FUNCTION decrement_reshare_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE posts
  SET reshare_count = GREATEST(COALESCE(reshare_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$;

-- Part 3: Trigger to auto-update reshare_count when posts are created/deleted
-- =============================================================================

-- Trigger function to handle reshare count on insert
CREATE OR REPLACE FUNCTION handle_reshare_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.original_post_id IS NOT NULL AND NEW.post_type = 'reshare' THEN
    PERFORM increment_reshare_count(NEW.original_post_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function to handle reshare count on delete/soft-delete
CREATE OR REPLACE FUNCTION handle_reshare_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle soft delete (is_deleted changed to true)
  IF TG_OP = 'UPDATE' AND OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
    IF NEW.original_post_id IS NOT NULL AND NEW.post_type = 'reshare' THEN
      PERFORM decrement_reshare_count(NEW.original_post_id);
    END IF;
  END IF;

  -- Handle hard delete
  IF TG_OP = 'DELETE' THEN
    IF OLD.original_post_id IS NOT NULL AND OLD.post_type = 'reshare' THEN
      PERFORM decrement_reshare_count(OLD.original_post_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_reshare_insert ON posts;
DROP TRIGGER IF EXISTS on_reshare_delete ON posts;

-- Create triggers
CREATE TRIGGER on_reshare_insert
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_reshare_insert();

CREATE TRIGGER on_reshare_delete
  AFTER UPDATE OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_reshare_delete();

-- Part 4: Update the universal feed function to include reshare tracking
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 30,
  p_offset integer DEFAULT 0,
  p_ranking_mode text DEFAULT 'latest'
)
RETURNS TABLE(
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
  link_url text,
  link_title text,
  link_description text,
  link_metadata jsonb,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  event_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  likes_count bigint,
  comments_count bigint,
  reshare_count bigint,
  user_has_liked boolean,
  user_has_bookmarked boolean,
  user_has_reshared boolean,
  original_post_id uuid,
  original_author_id uuid,
  original_author_username text,
  original_author_full_name text,
  original_author_avatar_url text,
  original_author_headline text,
  original_content text,
  original_image_url text,
  original_created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
    p.link_url,
    p.link_title,
    p.link_description,
    p.link_metadata,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,
    p.updated_at,
    COALESCE(likes.like_count, 0)::bigint AS likes_count,
    COALESCE(comments.comment_count, 0)::bigint AS comments_count,
    COALESCE(p.reshare_count, 0)::bigint AS reshare_count,
    EXISTS(
      SELECT 1 FROM post_reactions pr
      WHERE pr.post_id = p.id AND pr.user_id = p_viewer_id
    ) AS user_has_liked,
    EXISTS(
      SELECT 1 FROM post_bookmarks pb
      WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id
    ) AS user_has_bookmarked,
    -- Check if the current user has reshared this post
    EXISTS(
      SELECT 1 FROM posts reshare
      WHERE reshare.original_post_id = p.id
        AND reshare.author_id = p_viewer_id
        AND reshare.post_type = 'reshare'
        AND reshare.is_deleted = FALSE
    ) AS user_has_reshared,
    -- Original post data for reshares
    p.original_post_id,
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
    -- Filter by author if provided
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    -- Filter by space if provided
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    -- Filter by event if provided
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
    -- Tab-based filtering
    AND (
      CASE
        -- All: public posts + user's own posts + connections' posts
        WHEN p_tab = 'all' THEN
          (p.privacy_level = 'public')
          OR (p.author_id = p_viewer_id)
          OR (p.privacy_level = 'connections' AND EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
               OR  (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          ))
        -- For You: personalized feed (connections + interests)
        WHEN p_tab = 'for_you' THEN
          (p.privacy_level = 'public')
          OR (p.author_id = p_viewer_id)
          OR EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
               OR  (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          )
        -- Network: only connections' posts
        WHEN p_tab = 'network' THEN
          EXISTS(
            SELECT 1 FROM connections c
            WHERE ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
               OR  (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
          )
        -- My Posts: only user's own posts
        WHEN p_tab = 'my_posts' THEN
          p.author_id = p_viewer_id
        -- Bookmarks: posts user has bookmarked
        WHEN p_tab = 'bookmarks' THEN
          EXISTS(
            SELECT 1 FROM post_bookmarks pb
            WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id
          )
        ELSE
          (p.privacy_level = 'public')
      END
    )
  ORDER BY
    CASE WHEN p_ranking_mode = 'top' THEN COALESCE(likes.like_count, 0) END DESC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Part 5: Function to check if user has reshared a post
-- =============================================================================

CREATE OR REPLACE FUNCTION check_user_reshared(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM posts
    WHERE original_post_id = p_post_id
      AND author_id = p_user_id
      AND post_type = 'reshare'
      AND is_deleted = FALSE
  );
END;
$$;

-- Part 6: Function to get reshare count for a post
-- =============================================================================

CREATE OR REPLACE FUNCTION get_reshare_count(p_post_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COALESCE(reshare_count, 0) INTO count_result
  FROM posts
  WHERE id = p_post_id;

  RETURN COALESCE(count_result, 0);
END;
$$;

-- Part 7: Function to delete (undo) a reshare
-- =============================================================================

CREATE OR REPLACE FUNCTION delete_reshare(
  p_user_id UUID,
  p_original_post_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reshare_id UUID;
BEGIN
  -- Find and soft-delete the reshare
  SELECT id INTO reshare_id
  FROM posts
  WHERE original_post_id = p_original_post_id
    AND author_id = p_user_id
    AND post_type = 'reshare'
    AND is_deleted = FALSE
  LIMIT 1;

  IF reshare_id IS NOT NULL THEN
    UPDATE posts
    SET is_deleted = TRUE
    WHERE id = reshare_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Part 8: Enhanced mutual connections function with count
-- =============================================================================

-- Get mutual connection count (optimized for speed)
CREATE OR REPLACE FUNCTION get_mutual_connection_count(
  user_a UUID,
  user_b UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM (
    -- User A's connections
    SELECT
      CASE
        WHEN c.requester_id = user_a THEN c.recipient_id
        ELSE c.requester_id
      END as connection_id
    FROM connections c
    WHERE c.status = 'accepted'
      AND (c.requester_id = user_a OR c.recipient_id = user_a)

    INTERSECT

    -- User B's connections
    SELECT
      CASE
        WHEN c.requester_id = user_b THEN c.recipient_id
        ELSE c.requester_id
      END as connection_id
    FROM connections c
    WHERE c.status = 'accepted'
      AND (c.requester_id = user_b OR c.recipient_id = user_b)
  ) as mutual;

  RETURN COALESCE(count_result, 0);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_reshare_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_reshare_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_reshared(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reshare_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_reshare(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_mutual_connection_count(UUID, UUID) TO authenticated;

-- Part 9: Backfill existing reshare counts
-- =============================================================================
UPDATE posts p
SET reshare_count = (
  SELECT COUNT(*)
  FROM posts reshares
  WHERE reshares.original_post_id = p.id
    AND reshares.post_type = 'reshare'
    AND reshares.is_deleted = FALSE
)
WHERE EXISTS (
  SELECT 1 FROM posts reshares
  WHERE reshares.original_post_id = p.id
    AND reshares.post_type = 'reshare'
);
