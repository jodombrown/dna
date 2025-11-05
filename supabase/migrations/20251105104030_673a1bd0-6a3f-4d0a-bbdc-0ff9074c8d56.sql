-- Create RPC function to get profile viewers with details
CREATE OR REPLACE FUNCTION public.get_profile_viewers(
  p_profile_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  viewer_id UUID,
  viewer_username TEXT,
  viewer_full_name TEXT,
  viewer_avatar_url TEXT,
  viewer_headline TEXT,
  view_count BIGINT,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.viewer_id,
    p.username AS viewer_username,
    p.full_name AS viewer_full_name,
    p.avatar_url AS viewer_avatar_url,
    p.headline AS viewer_headline,
    COUNT(pv.id) AS view_count,
    MAX(pv.viewed_at) AS last_viewed_at,
    EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = p_profile_id AND c.recipient_id = pv.viewer_id)
         OR (c.recipient_id = p_profile_id AND c.requester_id = pv.viewer_id))
        AND c.status = 'accepted'
    ) AS is_connected
  FROM profile_views pv
  INNER JOIN profiles p ON pv.viewer_id = p.id
  WHERE pv.profile_id = p_profile_id
    AND pv.viewer_id IS NOT NULL
    AND pv.viewer_id != p_profile_id
  GROUP BY pv.viewer_id, p.username, p.full_name, p.avatar_url, p.headline
  ORDER BY last_viewed_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;