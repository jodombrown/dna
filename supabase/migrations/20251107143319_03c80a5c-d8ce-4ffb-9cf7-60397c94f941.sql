-- Create hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  first_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create post_hashtags junction table
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  hashtag_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Enable RLS
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hashtags
CREATE POLICY "Anyone can view hashtags"
  ON public.hashtags
  FOR SELECT
  USING (true);

-- RLS Policies for post_hashtags
CREATE POLICY "Anyone can view post hashtags"
  ON public.post_hashtags
  FOR SELECT
  USING (true);

CREATE POLICY "Post authors can add hashtags to their posts"
  ON public.post_hashtags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON public.hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage_count ON public.hashtags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);

-- Function to extract and create hashtags from post content
CREATE OR REPLACE FUNCTION extract_and_create_hashtags(p_post_id UUID, p_content TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag TEXT;
  v_hashtag_id UUID;
  v_hashtags TEXT[];
BEGIN
  -- Extract hashtags using regex (words starting with #)
  v_hashtags := regexp_matches(p_content, '#(\w+)', 'g');
  
  -- Process each hashtag
  FOREACH v_hashtag IN ARRAY v_hashtags
  LOOP
    -- Normalize hashtag (lowercase, remove #)
    v_hashtag := lower(regexp_replace(v_hashtag, '^#', ''));
    
    -- Insert or update hashtag
    INSERT INTO hashtags (tag, usage_count, last_used_at)
    VALUES (v_hashtag, 1, now())
    ON CONFLICT (tag) DO UPDATE
    SET usage_count = hashtags.usage_count + 1,
        last_used_at = now()
    RETURNING id INTO v_hashtag_id;
    
    -- Link hashtag to post
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (p_post_id, v_hashtag_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Function to get trending hashtags
CREATE OR REPLACE FUNCTION get_trending_hashtags(p_limit INTEGER DEFAULT 10, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  tag TEXT,
  usage_count INTEGER,
  recent_usage_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.tag,
    h.usage_count,
    COUNT(ph.id)::BIGINT as recent_usage_count
  FROM hashtags h
  LEFT JOIN post_hashtags ph ON ph.hashtag_id = h.id
  WHERE ph.created_at >= now() - (p_days || ' days')::INTERVAL
  GROUP BY h.id, h.tag, h.usage_count
  ORDER BY recent_usage_count DESC, h.usage_count DESC
  LIMIT p_limit;
END;
$$;