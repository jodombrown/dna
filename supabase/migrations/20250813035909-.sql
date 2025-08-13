-- 1) Helper to check if two users are connected (accepted)
CREATE OR REPLACE FUNCTION public.are_users_connected(u1 uuid, u2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists(
    select 1 from public.connections c
    where ((c.a = u1 and c.b = u2) or (c.a = u2 and c.b = u1))
      and c.status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION public.are_users_connected(uuid, uuid) TO anon, authenticated;

-- 2) Helper to evaluate field-level visibility
CREATE OR REPLACE FUNCTION public.can_view_field(p_visibility jsonb, p_field text, p_viewer uuid, p_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select case
    when p_viewer is not null and p_viewer = p_owner then true
    when coalesce(p_visibility ->> p_field, 'public') = 'public' then true
    when coalesce(p_visibility ->> p_field, 'public') = 'connections' then public.are_users_connected(p_viewer, p_owner)
    else false
  end;
$$;

GRANT EXECUTE ON FUNCTION public.can_view_field(jsonb, text, uuid, uuid) TO anon, authenticated;

-- 3) Update public RPCs to enforce field-level privacy
CREATE OR REPLACE FUNCTION public.rpc_public_profiles(
  p_location text DEFAULT NULL,
  p_profession text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  headline text,
  bio text,
  region text,
  location text,
  profession text,
  company text,
  skills text[],
  impact_areas text[],
  avatar_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_viewer uuid := (select auth.uid());
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    CASE WHEN public.can_view_field(p.visibility, 'full_name', v_viewer, p.id) THEN p.full_name ELSE NULL END AS full_name,
    CASE WHEN public.can_view_field(p.visibility, 'headline', v_viewer, p.id) THEN p.headline ELSE NULL END AS headline,
    CASE WHEN public.can_view_field(p.visibility, 'bio', v_viewer, p.id) THEN p.bio ELSE NULL END AS bio,
    CASE WHEN public.can_view_field(p.visibility, 'region', v_viewer, p.id) THEN p.region ELSE NULL END AS region,
    CASE WHEN public.can_view_field(p.visibility, 'location', v_viewer, p.id) THEN p.location ELSE NULL END AS location,
    CASE WHEN public.can_view_field(p.visibility, 'profession', v_viewer, p.id) THEN p.profession ELSE NULL END AS profession,
    CASE WHEN public.can_view_field(p.visibility, 'company', v_viewer, p.id) THEN p.company ELSE NULL END AS company,
    CASE WHEN public.can_view_field(p.visibility, 'skills', v_viewer, p.id) THEN p.skills ELSE NULL END AS skills,
    CASE WHEN public.can_view_field(p.visibility, 'impact_areas', v_viewer, p.id) THEN p.impact_areas ELSE NULL END AS impact_areas,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE coalesce(p.is_public, false) = true
    AND coalesce(p.profile_completeness_score, 0) >= 50
    AND (p_location IS NULL OR p.location ILIKE ('%' || p_location || '%'))
    AND (p_profession IS NULL OR p.profession ILIKE ('%' || p_profession || '%'))
    AND (p_skills IS NULL OR p.skills && p_skills)
  ORDER BY p.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 50), 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_public_profiles(text, text, text[], integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.rpc_public_profile_by_id(p_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  headline text,
  bio text,
  region text,
  location text,
  profession text,
  company text,
  skills text[],
  impact_areas text[],
  avatar_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_viewer uuid := (select auth.uid());
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    CASE WHEN public.can_view_field(p.visibility, 'full_name', v_viewer, p.id) THEN p.full_name ELSE NULL END AS full_name,
    CASE WHEN public.can_view_field(p.visibility, 'headline', v_viewer, p.id) THEN p.headline ELSE NULL END AS headline,
    CASE WHEN public.can_view_field(p.visibility, 'bio', v_viewer, p.id) THEN p.bio ELSE NULL END AS bio,
    CASE WHEN public.can_view_field(p.visibility, 'region', v_viewer, p.id) THEN p.region ELSE NULL END AS region,
    CASE WHEN public.can_view_field(p.visibility, 'location', v_viewer, p.id) THEN p.location ELSE NULL END AS location,
    CASE WHEN public.can_view_field(p.visibility, 'profession', v_viewer, p.id) THEN p.profession ELSE NULL END AS profession,
    CASE WHEN public.can_view_field(p.visibility, 'company', v_viewer, p.id) THEN p.company ELSE NULL END AS company,
    CASE WHEN public.can_view_field(p.visibility, 'skills', v_viewer, p.id) THEN p.skills ELSE NULL END AS skills,
    CASE WHEN public.can_view_field(p.visibility, 'impact_areas', v_viewer, p.id) THEN p.impact_areas ELSE NULL END AS impact_areas,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = p_id
    AND coalesce(p.is_public, false) = true
    AND coalesce(p.profile_completeness_score, 0) >= 50
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_public_profile_by_id(uuid) TO anon, authenticated;

-- 4) Restrict public inserts on event_analytics (drop permissive policy)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='event_analytics' AND policyname='ea_public_insert'
  ) THEN
    EXECUTE 'DROP POLICY "ea_public_insert" ON public.event_analytics';
  END IF;
END $$;