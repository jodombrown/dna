-- Fix get_hashtag_posts function to use correct column names
CREATE OR REPLACE FUNCTION get_hashtag_posts(
  p_hashtag_name TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort TEXT DEFAULT 'recent'
)
RETURNS TABLE (
  post_id UUID,
  content TEXT,
  media_urls TEXT[],
  author_id UUID,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  author_headline TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  reshare_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
BEGIN
  -- Get hashtag ID
  SELECT h.id INTO v_hashtag_id
  FROM hashtags h
  WHERE lower(h.tag) = lower(p_hashtag_name);
  
  IF v_hashtag_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.content,
    CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE NULL END as media_urls,
    p.author_id,
    COALESCE(pr.full_name, pr.username, 'DNA Member') as author_name,
    pr.username as author_username,
    pr.avatar_url as author_avatar,
    pr.headline as author_headline,
    COALESCE((SELECT COUNT(*)::integer FROM post_likes pl WHERE pl.post_id = p.id), 0) as like_count,
    COALESCE((SELECT COUNT(*)::integer FROM post_comments pc WHERE pc.post_id = p.id), 0) as comment_count,
    0 as reshare_count,
    p.created_at
  FROM posts p
  JOIN post_hashtags ph ON ph.post_id = p.id
  JOIN profiles pr ON pr.id = p.author_id
  WHERE ph.hashtag_id = v_hashtag_id
    AND p.is_deleted = false
  ORDER BY 
    CASE WHEN p_sort = 'top' THEN COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id), 0) + COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id), 0) * 2 END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;