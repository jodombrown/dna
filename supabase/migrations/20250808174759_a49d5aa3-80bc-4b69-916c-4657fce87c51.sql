-- 1) Spotlight column and ordered view
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS spotlight boolean NOT NULL DEFAULT false;

CREATE OR REPLACE VIEW public.v_feed_ordered AS
SELECT p.*
FROM public.posts p
ORDER BY p.spotlight DESC, p.created_at DESC;

-- 2) Secure RPC to create a post as the current user (bypasses client author spoofing)
CREATE OR REPLACE FUNCTION public.rpc_create_post(p jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  INSERT INTO public.posts (
    id,
    author_id,
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
$$;

REVOKE ALL ON FUNCTION public.rpc_create_post(p jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_post(p jsonb) TO authenticated;

-- 3) Admin-only RPC to toggle spotlight with safe authorization
CREATE OR REPLACE FUNCTION public.rpc_toggle_spotlight(p_post uuid, p_value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.posts
  SET 
    spotlight = COALESCE(p_value, false),
    status = CASE WHEN COALESCE(p_value, false) THEN 'featured' ELSE status END,
    type = CASE WHEN COALESCE(p_value, false) THEN 'spotlight' ELSE type END,
    updated_at = now()
  WHERE id = p_post;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_toggle_spotlight(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_toggle_spotlight(uuid, boolean) TO authenticated;