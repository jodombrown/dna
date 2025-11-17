-- Fix 1: Update post_type constraint to include all feed types
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
  CHECK (post_type IN ('update', 'article', 'question', 'celebration', 'post', 'story', 'event', 'space', 'need', 'community_post', 'reshare'));

-- Fix 2: Correct ambiguous post_id reference in get_universal_feed
DROP FUNCTION IF EXISTS get_universal_feed(UUID, TEXT, UUID, UUID, UUID, INT, INT, TIMESTAMPTZ, TEXT);

CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id UUID,
  p_tab TEXT DEFAULT 'all',
  p_author_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_ranking_mode TEXT DEFAULT 'latest'
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  media_url TEXT,
  post_type TEXT,
  privacy_level TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  space_title TEXT,
  event_id UUID,
  event_title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  view_count BIGINT,
  bookmark_count BIGINT,
  has_liked BOOLEAN,
  has_bookmarked BOOLEAN,
  ranking_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH base_posts AS (
    SELECT 
      p.id,
      p.author_id,
      p.content,
      p.image_url,
      p.post_type,
      p.privacy_level,
      p.linked_entity_type,
      p.linked_entity_id,
      p.space_id,
      p.event_id,
      p.created_at,
      p.updated_at,
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) AS like_count,
      COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id), 0) AS comment_count,
      COALESCE((SELECT COUNT(*) FROM posts WHERE original_post_id = p.id), 0) AS share_count,
      COALESCE(p.view_count, 0) AS view_count,
      COALESCE((SELECT COUNT(*) FROM post_bookmarks WHERE post_id = p.id), 0) AS bookmark_count
    FROM posts p
    WHERE 
      p.is_deleted = false
      AND (p_cursor IS NULL OR p.created_at < p_cursor)
      AND (
        p_tab = 'all'
        OR (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
        OR (p_tab = 'network' AND EXISTS (
          SELECT 1 FROM connections c
          WHERE c.status = 'accepted'
          AND ((c.requester_id = p_viewer_id AND c.recipient_id = p.author_id)
            OR (c.recipient_id = p_viewer_id AND c.requester_id = p.author_id))
        ))
        OR (p_tab = 'bookmarks' AND EXISTS (
          SELECT 1 FROM post_bookmarks pb
          WHERE pb.post_id = p.id AND pb.user_id = p_viewer_id
        ))
      )
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id IS NULL OR p.space_id = p_space_id)
      AND (p_event_id IS NULL OR p.event_id = p_event_id)
      AND (p.privacy_level = 'public' OR p.author_id = p_viewer_id OR p.privacy_level = 'connections')
  ),
  ranked_posts AS (
    SELECT 
      bp.*,
      CASE 
        WHEN p_ranking_mode = 'top' THEN
          GREATEST(0, 100 - (EXTRACT(EPOCH FROM (NOW() - bp.created_at)) / (7 * 24 * 3600) * 100))
          + (bp.like_count * 3)
          + (bp.comment_count * 5)
          + (bp.share_count * 10)
          + (bp.bookmark_count * 7)
          + CASE 
              WHEN EXISTS (
                SELECT 1 FROM connections c
                WHERE c.status = 'accepted'
                AND ((c.requester_id = p_viewer_id AND c.recipient_id = bp.author_id)
                  OR (c.recipient_id = p_viewer_id AND c.requester_id = bp.author_id))
              ) THEN 50
              ELSE 0
            END
          + CASE bp.post_type
              WHEN 'event' THEN 30
              WHEN 'need' THEN 25
              WHEN 'story' THEN 20
              WHEN 'space' THEN 15
              ELSE 0
            END
        ELSE 
          EXTRACT(EPOCH FROM bp.created_at)
      END AS ranking_score
    FROM base_posts bp
  )
  SELECT 
    rp.id AS post_id,
    rp.author_id,
    COALESCE(prof.username, 'unknown') AS author_username,
    COALESCE(prof.display_name, prof.username, 'User') AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    rp.content,
    rp.image_url AS media_url,
    rp.post_type,
    rp.privacy_level,
    rp.linked_entity_type,
    rp.linked_entity_id,
    rp.space_id,
    cs.title AS space_title,
    rp.event_id,
    ev.title AS event_title,
    rp.created_at,
    rp.updated_at,
    rp.like_count,
    rp.comment_count,
    rp.share_count,
    rp.view_count,
    rp.bookmark_count,
    EXISTS (
      SELECT 1 FROM post_likes pl
      WHERE pl.post_id = rp.id AND pl.user_id = p_viewer_id
    ) AS has_liked,
    EXISTS (
      SELECT 1 FROM post_bookmarks pb
      WHERE pb.post_id = rp.id AND pb.user_id = p_viewer_id
    ) AS has_bookmarked,
    rp.ranking_score
  FROM ranked_posts rp
  LEFT JOIN profiles prof ON prof.id = rp.author_id
  LEFT JOIN collaboration_spaces cs ON cs.id = rp.space_id
  LEFT JOIN events ev ON ev.id = rp.event_id
  ORDER BY 
    CASE 
      WHEN p_ranking_mode = 'top' THEN rp.ranking_score
      ELSE EXTRACT(EPOCH FROM rp.created_at)
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Fix 3: Add RLS policy for analytics_events to allow authenticated users to insert their own events
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;
CREATE POLICY "Users can insert their own analytics events" 
  ON analytics_events 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);