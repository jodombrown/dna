-- 1) Ensure unique membership constraint (avoid duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.collaboration_memberships'::regclass
      AND conname = 'collaboration_memberships_space_user_unique'
  ) THEN
    ALTER TABLE public.collaboration_memberships
    ADD CONSTRAINT collaboration_memberships_space_user_unique
    UNIQUE (space_id, user_id);
  END IF;
END$$;

-- 2) Public opportunities view (anon-friendly)
CREATE OR REPLACE VIEW public.public_opportunities AS
  SELECT id, title, description, type, tags, location, link, image_url, created_at
  FROM public.opportunities
  WHERE status = 'active' AND visibility = 'public';
GRANT SELECT ON public.public_opportunities TO anon, authenticated;

-- 3) Public profile view & function (use available columns)
CREATE OR REPLACE VIEW public.view_public_profile AS
SELECT 
  p.id,
  COALESCE(p.username, split_part(p.full_name, ' ', 1) || '_' || left(p.id::text, 6)) AS username,
  p.full_name,
  p.avatar_url,
  p.location,
  p.created_at
FROM public.profiles p
WHERE COALESCE(p.is_public, false) = true;

-- Verified contributions view using user_adin_profile verification flag
CREATE OR REPLACE VIEW public.view_public_contributions AS
SELECT 
  uc.user_id,
  uc.type,
  uc.target_id,
  uc.target_title,
  uc.created_at
FROM public.user_contributions uc
JOIN public.user_adin_profile uap ON uap.user_id = uc.user_id
WHERE COALESCE(uap.is_verified_contributor, false) = true;

GRANT SELECT ON public.view_public_profile TO anon, authenticated;
GRANT SELECT ON public.view_public_contributions TO anon, authenticated;

-- RPC to fetch public profile by username
CREATE OR REPLACE FUNCTION public.rpc_public_profile_by_username(p_username text)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  location text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, full_name, avatar_url, location, created_at
  FROM public.view_public_profile
  WHERE username = p_username
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.rpc_public_profile_by_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_public_profile_by_username(text) TO anon, authenticated;
