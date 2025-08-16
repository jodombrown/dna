-- Fix the rpc_create_post function to include user_id field
CREATE OR REPLACE FUNCTION public.rpc_create_post(p jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  INSERT INTO public.posts (
    id,
    author_id,
    user_id,  -- Add this field
    content,
    type,
    pillar,
    media_url,
    embed_metadata,
    visibility,
    status,
    link_url,
    opportunity_type,
    opportunity_link,
    poll_options,
    poll_expires_at
  ) VALUES (
    v_id,
    auth.uid(),
    auth.uid(),  -- Set user_id to the authenticated user
    NULLIF(trim(COALESCE(p->>'content','')), ''),
    COALESCE(p->>'type','text'),
    NULLIF(lower(COALESCE(p->>'pillar', NULL)), ''),
    NULLIF(COALESCE(p->>'media_url', NULL), ''),
    CASE WHEN p ? 'embed_metadata' THEN p->'embed_metadata' ELSE NULL END,
    COALESCE(p->>'visibility','public'),
    COALESCE(p->>'status','published'),
    COALESCE(p->>'link_url', NULL),
    COALESCE(p->>'opportunity_type', NULL),
    COALESCE(p->>'opportunity_link', NULL),
    CASE WHEN p ? 'poll_options' THEN p->'poll_options' ELSE NULL END,
    CASE WHEN p ? 'poll_expires_at' THEN (p->>'poll_expires_at')::timestamptz ELSE NULL END
  );

  RETURN v_id;
END;
$function$