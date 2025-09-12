-- Create RPC function for creating posts
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
AS $$
DECLARE
  new_post_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create posts';
  END IF;
  
  -- Validate required fields
  IF content IS NULL OR TRIM(content) = '' THEN
    RAISE EXCEPTION 'Content is required';
  END IF;
  
  -- Insert the new post
  INSERT INTO public.posts (
    author_id,
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
    opportunity_link,
    created_at,
    updated_at
  ) VALUES (
    current_user_id,
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
    opportunity_link,
    NOW(),
    NOW()
  ) RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;