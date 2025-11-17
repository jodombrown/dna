-- FEED v1.2: Cursor-based pagination + Simple ranking support

-- Drop old version with explicit signature
DROP FUNCTION IF EXISTS get_universal_feed(UUID, TEXT, UUID, UUID, UUID, INT, INT);

-- Create enhanced version with cursor support and ranking
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
      p.media_url,
      p.post_type,
      p.privacy_level,
      p.linked_entity_type,
      p.linked_entity_id,
      p.space_id,
      p.event_id,
      p.created_at,
      p.updated_at,
      p.like_count,
      p.comment_count,
      p.share_count,
      p.view_count,
      p.bookmark_count
    FROM posts p
    WHERE 
      -- Apply cursor if provided
      (p_cursor IS NULL OR p.created_at < p_cursor)
      -- Tab filters
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
      -- Context filters
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id IS NULL OR p.space_id = p_space_id)
      AND (p_event_id IS NULL OR p.event_id = p_event_id)
      -- Privacy: only show public or own posts for now
      AND (p.privacy_level = 'public' OR p.author_id = p_viewer_id)
  ),
  ranked_posts AS (
    SELECT 
      bp.*,
      -- Ranking score calculation
      CASE 
        WHEN p_ranking_mode = 'top' THEN
          -- Recency score (0-100, decays over 7 days)
          GREATEST(0, 100 - (EXTRACT(EPOCH FROM (NOW() - bp.created_at)) / (7 * 24 * 3600) * 100))
          -- Engagement score
          + (bp.like_count * 3)
          + (bp.comment_count * 5)
          + (bp.share_count * 10)
          + (bp.bookmark_count * 7)
          -- Connection boost
          + CASE 
              WHEN EXISTS (
                SELECT 1 FROM connections c
                WHERE c.status = 'accepted'
                AND ((c.requester_id = p_viewer_id AND c.recipient_id = bp.author_id)
                  OR (c.recipient_id = p_viewer_id AND c.requester_id = bp.author_id))
              ) THEN 50
              ELSE 0
            END
          -- Content type boosts
          + CASE bp.post_type
              WHEN 'event' THEN 30
              WHEN 'need' THEN 25
              WHEN 'story' THEN 20
              WHEN 'space' THEN 15
              ELSE 0
            END
        ELSE 
          EXTRACT(EPOCH FROM bp.created_at) -- Latest mode: simple timestamp ordering
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
    rp.media_url,
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