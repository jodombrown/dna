-- Fix attempt: use pg_policies (catalog view) instead of pg_policy

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policies on profiles to prevent public reads
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END$$;

-- Create minimal, principle-of-least-privilege policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_owner'
  ) THEN
    CREATE POLICY profiles_select_owner
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert_owner'
  ) THEN
    CREATE POLICY profiles_insert_owner
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_owner'
  ) THEN
    CREATE POLICY profiles_update_owner
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- Safe public listing RPC
CREATE OR REPLACE FUNCTION public.rpc_public_profiles(
  p_location text DEFAULT NULL,
  p_profession text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
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
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.headline,
    p.bio,
    p.region,
    p.location,
    p.profession,
    p.company,
    p.skills,
    p.impact_areas,
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

-- Safe public by-id RPC
CREATE OR REPLACE FUNCTION public.rpc_public_profile_by_id(p_id uuid)
RETURNS TABLE (
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
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.headline,
    p.bio,
    p.region,
    p.location,
    p.profession,
    p.company,
    p.skills,
    p.impact_areas,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = p_id
    AND coalesce(p.is_public, false) = true
    AND coalesce(p.profile_completeness_score, 0) >= 50
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_public_profiles(text, text, text[], int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_public_profile_by_id(uuid) TO anon, authenticated;
