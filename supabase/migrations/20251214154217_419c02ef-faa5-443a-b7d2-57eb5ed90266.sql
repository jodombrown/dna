-- Create function to get trending stories based on 48-hour engagement velocity
CREATE OR REPLACE FUNCTION public.get_trending_stories(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  trending_score NUMERIC,
  view_count BIGINT,
  reaction_count BIGINT,
  comment_count BIGINT,
  bookmark_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  time_window INTERVAL := '48 hours';
BEGIN
  RETURN QUERY
  WITH recent_views AS (
    SELECT 
      pv.post_id,
      COUNT(*) as cnt
    FROM post_views pv
    WHERE pv.viewed_at >= NOW() - time_window
    GROUP BY pv.post_id
  ),
  recent_reactions AS (
    SELECT 
      pr.post_id,
      COUNT(*) as cnt
    FROM post_reactions pr
    WHERE pr.created_at >= NOW() - time_window
    GROUP BY pr.post_id
  ),
  recent_comments AS (
    SELECT 
      pc.post_id,
      COUNT(*) as cnt
    FROM post_comments pc
    WHERE pc.created_at >= NOW() - time_window
      AND pc.is_deleted = false
    GROUP BY pc.post_id
  ),
  recent_bookmarks AS (
    SELECT 
      pb.post_id,
      COUNT(*) as cnt
    FROM post_bookmarks pb
    WHERE pb.created_at >= NOW() - time_window
    GROUP BY pb.post_id
  ),
  story_posts AS (
    SELECT p.id
    FROM posts p
    WHERE p.post_type = 'story'
      AND p.is_deleted = false
      AND p.created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    sp.id as post_id,
    (
      COALESCE(rv.cnt, 0) * 1 +      -- views weight: 1x
      COALESCE(rr.cnt, 0) * 3 +      -- reactions weight: 3x
      COALESCE(rc.cnt, 0) * 5 +      -- comments weight: 5x
      COALESCE(rb.cnt, 0) * 2        -- bookmarks weight: 2x
    )::NUMERIC as trending_score,
    COALESCE(rv.cnt, 0) as view_count,
    COALESCE(rr.cnt, 0) as reaction_count,
    COALESCE(rc.cnt, 0) as comment_count,
    COALESCE(rb.cnt, 0) as bookmark_count
  FROM story_posts sp
  LEFT JOIN recent_views rv ON rv.post_id = sp.id
  LEFT JOIN recent_reactions rr ON rr.post_id = sp.id
  LEFT JOIN recent_comments rc ON rc.post_id = sp.id
  LEFT JOIN recent_bookmarks rb ON rb.post_id = sp.id
  WHERE (
    COALESCE(rv.cnt, 0) + 
    COALESCE(rr.cnt, 0) + 
    COALESCE(rc.cnt, 0) + 
    COALESCE(rb.cnt, 0)
  ) > 0
  ORDER BY trending_score DESC, sp.id
  LIMIT p_limit;
END;
$$;