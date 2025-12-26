-- Fix get_trending_hashtags function to use correct column names
CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  tag TEXT,
  name TEXT,
  display_name TEXT,
  type TEXT,
  usage_count INTEGER,
  follower_count INTEGER,
  recent_uses BIGINT,
  trending_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH recent_usage AS (
    SELECT 
      ph.hashtag_id,
      COUNT(*) as recent_count
    FROM post_hashtags ph
    JOIN posts p ON p.id = ph.post_id
    WHERE ph.created_at > now() - (p_days || ' days')::INTERVAL
      AND p.is_deleted = false
    GROUP BY ph.hashtag_id
  )
  SELECT 
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    h.usage_count,
    COALESCE(h.follower_count, 0) as follower_count,
    COALESCE(ru.recent_count, 0) as recent_uses,
    (COALESCE(ru.recent_count, 0) * 10 + COALESCE(h.follower_count, 0))::NUMERIC as trending_score
  FROM hashtags h
  LEFT JOIN recent_usage ru ON ru.hashtag_id = h.id
  WHERE h.status = 'active'
    AND (ru.recent_count > 0 OR h.usage_count > 0)
  ORDER BY trending_score DESC, h.usage_count DESC
  LIMIT p_limit;
END;
$$;