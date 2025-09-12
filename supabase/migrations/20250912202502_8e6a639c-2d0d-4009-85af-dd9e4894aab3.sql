-- Replace rpc_create_post to fix search_path and required columns
CREATE OR REPLACE FUNCTION public.rpc_create_post(
  content TEXT,
  type TEXT DEFAULT 'text',
  pillar TEXT DEFAULT 'connect',
  visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'published',
  media_url TEXT DEFAULT NULL,
  embed_metadata JSONB DEFAULT NULL,
  link_url TEXT DEFAULT NULL,
  link_metadata JSONB DEFAULT NULL,
  poll_options JSONB DEFAULT NULL,
  poll_expires_at TIMESTAMPTZ DEFAULT NULL,
  opportunity_type TEXT DEFAULT NULL,
  opportunity_link TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_post_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Ensure authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create posts';
  END IF;

  -- Validate required content (allow media/link-only later if needed)
  IF (content IS NULL OR TRIM(content) = '') AND media_url IS NULL AND link_url IS NULL THEN
    RAISE EXCEPTION 'Content is required';
  END IF;

  INSERT INTO public.posts (
    id,
    author_id,
    user_id,
    content,
    type,
    pillar,
    visibility,
    status,
    media_url,
    embed_metadata,
    link_url,
    link_metadata,
    poll_options,
    poll_expires_at,
    opportunity_type,
    opportunity_link
  ) VALUES (
    gen_random_uuid(),
    current_user_id,
    current_user_id,
    nullif(trim(content), ''),
    coalesce(type, 'text'),
    coalesce(pillar, 'connect'),
    coalesce(visibility, 'public'),
    coalesce(status, 'published'),
    media_url,
    embed_metadata,
    link_url,
    link_metadata,
    poll_options,
    poll_expires_at,
    opportunity_type,
    opportunity_link
  ) RETURNING id INTO new_post_id;

  RETURN new_post_id;
END;
$$;

-- Grant execute to roles used by the app
GRANT EXECUTE ON FUNCTION public.rpc_create_post(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, JSONB, JSONB, TIMESTAMPTZ, TEXT, TEXT
) TO authenticated, anon;