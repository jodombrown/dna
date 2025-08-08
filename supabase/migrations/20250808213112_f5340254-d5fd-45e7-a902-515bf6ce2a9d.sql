-- ADIN Recommendations MVP: indexes and secure RPCs
-- 1) Performance indexes (guarded)
DO $$ BEGIN
  IF to_regclass('public.idx_profiles_skills_gin') IS NULL THEN
    CREATE INDEX idx_profiles_skills_gin ON public.profiles USING GIN (skills);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.idx_profiles_impact_areas_gin') IS NULL THEN
    CREATE INDEX idx_profiles_impact_areas_gin ON public.profiles USING GIN (impact_areas);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.collaboration_spaces') IS NOT NULL AND to_regclass('public.idx_spaces_tags_gin') IS NULL THEN
    CREATE INDEX idx_spaces_tags_gin ON public.collaboration_spaces USING GIN (tags);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.user_contributions') IS NOT NULL AND to_regclass('public.idx_contrib_user_created_at') IS NULL THEN
    CREATE INDEX idx_contrib_user_created_at ON public.user_contributions(user_id, created_at DESC);
  END IF;
END $$;

-- 2) People recommendations
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_people(p_limit int DEFAULT 5)
RETURNS TABLE(user_id uuid, username text, full_name text, headline text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH me AS (
    SELECT 
      id AS user_id,
      COALESCE(skills, '{}') AS skills,
      COALESCE(impact_areas, '{}') AS impact_areas,
      NULLIF(TRIM(location), '') AS location
    FROM public.profiles 
    WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      pr.id AS user_id,
      pr.username,
      pr.full_name,
      pr.headline,
      (
        COALESCE(
          CARDINALITY(
            ARRAY(SELECT unnest(pr.skills) INTERSECT SELECT unnest((SELECT skills FROM me)) )
          ), 0
        ) * 2
      )
      + (
        COALESCE(
          CARDINALITY(
            ARRAY(SELECT unnest(pr.impact_areas) INTERSECT SELECT unnest((SELECT impact_areas FROM me)) )
          ), 0
        ) * 3
      )
      + CASE 
          WHEN (SELECT location FROM me) IS NOT NULL 
               AND pr.location = (SELECT location FROM me) THEN 2 
          ELSE 0 
        END AS score
    FROM public.profiles pr
    WHERE pr.id <> (SELECT user_id FROM me)
      AND COALESCE(pr.is_public, false) = true
      AND COALESCE(pr.profile_completeness_score, 0) >= 50
  )
  SELECT * FROM base 
  WHERE score > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_people(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_people(int) TO authenticated;

-- 3) Spaces recommendations
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_spaces(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, tags text[], visibility text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH me AS (
    SELECT 
      COALESCE(skills, '{}') AS skills,
      COALESCE(impact_areas, '{}') AS impact_areas
    FROM public.profiles 
    WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      s.id,
      s.title,
      s.description,
      s.tags,
      s.visibility,
      (
        COALESCE(
          CARDINALITY(
            ARRAY(SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT skills FROM me)) )
          ), 0
        ) * 2
      )
      + (
        COALESCE(
          CARDINALITY(
            ARRAY(SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT impact_areas FROM me)) )
          ), 0
        ) * 3
      ) AS score
    FROM public.collaboration_spaces s
    WHERE s.status = 'active' AND s.visibility = 'public'
  )
  SELECT * FROM base
  WHERE score > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_spaces(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_spaces(int) TO authenticated;

-- 4) Opportunities recommendations (using contribution_cards as opportunities proxy)
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_opportunities(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, type text, tags text[], location text, link text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH me AS (
    SELECT 
      COALESCE(skills, '{}') AS skills,
      COALESCE(impact_areas, '{}') AS impact_areas,
      NULLIF(TRIM(location), '') AS location
    FROM public.profiles 
    WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      c.id,
      c.title,
      c.description,
      c.contribution_type AS type,
      ARRAY[NULLIF(TRIM(c.impact_area), '')]::text[] AS tags,
      c.location,
      NULL::text AS link,
      (
        COALESCE(
          CARDINALITY(
            ARRAY(SELECT unnest(ARRAY[NULLIF(TRIM(c.impact_area), '')]::text[]) INTERSECT SELECT unnest((SELECT impact_areas FROM me)) )
          ), 0
        ) * 3
      )
      + (
        CASE 
          WHEN (SELECT location FROM me) IS NOT NULL 
               AND NULLIF(TRIM(c.location), '') = (SELECT location FROM me) THEN 1 
          ELSE 0 
        END
      ) AS score
    FROM public.contribution_cards c
    WHERE c.status = 'active'
  )
  SELECT * FROM base
  WHERE score > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_opportunities(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_opportunities(int) TO authenticated;