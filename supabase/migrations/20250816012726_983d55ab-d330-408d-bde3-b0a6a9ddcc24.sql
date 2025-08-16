-- Update rpc_create_post to set embed_metadata to an empty object when absent/null
CREATE OR REPLACE FUNCTION public.rpc_create_post(p jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid := gen_random_uuid();
  v_type text := COALESCE(p->>'type','text');
  v_pillar text := NULLIF(lower(COALESCE(p->>'pillar', NULL)), '');
  v_embed jsonb := NULL;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  -- Prefer a safe default for embed metadata to avoid CHECK constraint failures
  IF (p ? 'embed_metadata') AND p->'embed_metadata' IS NOT NULL THEN
    v_embed := p->'embed_metadata';
  ELSE
    -- Use empty object; adjust later if you enforce richer schemas
    v_embed := '{}'::jsonb;
  END IF;

  INSERT INTO public.posts (
    id,
    author_id,
    user_id,
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
    auth.uid(),
    NULLIF(trim(COALESCE(p->>'content','')), ''),
    v_type,
    v_pillar,
    NULLIF(COALESCE(p->>'media_url', NULL), ''),
    v_embed,
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