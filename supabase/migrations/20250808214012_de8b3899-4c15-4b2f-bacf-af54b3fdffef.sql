-- Retry: Recommendations v2 migration with function drops
-- 0) Drop existing RPCs to allow return type changes
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_people(int);
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_spaces(int);
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_opportunities(int);

-- 1) Indexes to support engagement lookups
DO $$ BEGIN
  IF to_regclass('public.posts') IS NOT NULL AND to_regclass('public.idx_posts_author_created_at') IS NULL THEN
    CREATE INDEX idx_posts_author_created_at ON public.posts(author_id, created_at DESC);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.post_likes') IS NOT NULL AND to_regclass('public.idx_post_likes_user_created_at') IS NULL THEN
    CREATE INDEX idx_post_likes_user_created_at ON public.post_likes(user_id, created_at DESC);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.comments') IS NOT NULL AND to_regclass('public.idx_comments_author_created_at') IS NULL THEN
    CREATE INDEX idx_comments_author_created_at ON public.comments(author_id, created_at DESC);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.user_contributions') IS NOT NULL AND to_regclass('public.idx_user_contributions_target') IS NULL THEN
    CREATE INDEX idx_user_contributions_target ON public.user_contributions(target_id, created_at DESC);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.user_contributions') IS NOT NULL AND to_regclass('public.idx_user_contributions_user') IS NULL THEN
    CREATE INDEX idx_user_contributions_user ON public.user_contributions(user_id, created_at DESC);
  END IF;
END $$;

-- 2) Helper functions: recent engagement scores (30 days)
CREATE OR REPLACE FUNCTION public.recent_engagement_score_for_user(p_target_user uuid)
RETURNS int
LANGUAGE sql
STABLE
SET search_path TO public
AS $$
  WITH me AS (SELECT (SELECT auth.uid()) AS uid),
  likes AS (
    SELECT count(*) AS c
    FROM public.post_likes pl
    JOIN public.posts p ON p.id = pl.post_id
    WHERE pl.user_id = (SELECT uid FROM me)
      AND p.author_id = p_target_user
      AND pl.created_at > now() - interval '30 days'
  ),
  cmts AS (
    SELECT count(*) AS c
    FROM public.comments c
    JOIN public.posts p ON p.id = c.post_id
    WHERE c.author_id = (SELECT uid FROM me)
      AND p.author_id = p_target_user
      AND c.created_at > now() - interval '30 days'
  )
  SELECT LEAST(COALESCE((SELECT c FROM likes),0) + COALESCE((SELECT c FROM cmts),0), 5);
$$;

CREATE OR REPLACE FUNCTION public.recent_engagement_score_for_space(p_space uuid)
RETURNS int
LANGUAGE sql
STABLE
SET search_path TO public
AS $$
  SELECT LEAST(COALESCE(count(*),0), 5)
  FROM public.user_contributions uc
  WHERE uc.user_id = (SELECT auth.uid())
    AND uc.target_id = p_space
    AND uc.created_at > now() - interval '30 days';
$$;

CREATE OR REPLACE FUNCTION public.recent_engagement_score_for_opportunity(p_op uuid)
RETURNS int
LANGUAGE sql
STABLE
SET search_path TO public
AS $$
  SELECT LEAST(COALESCE(count(*),0), 5)
  FROM public.user_contributions uc
  WHERE uc.user_id = (SELECT auth.uid())
    AND uc.target_id = p_op
    AND uc.created_at > now() - interval '30 days';
$$;

-- 3) People recommendations with engagement boost and explanations
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_people(p_limit int DEFAULT 5)
RETURNS TABLE(user_id uuid, username text, full_name text, headline text, score numeric, why_skills text[], why_sectors text[], why_region boolean, engagement_boost int)
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
    FROM public.profiles WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      pr.id AS user_id,
      pr.username,
      pr.full_name,
      pr.headline,
      ARRAY(SELECT unnest(pr.skills) INTERSECT SELECT unnest((SELECT skills FROM me))) AS why_skills,
      ARRAY(SELECT unnest(pr.impact_areas) INTERSECT SELECT unnest((SELECT impact_areas FROM me))) AS why_sectors,
      CASE WHEN (SELECT location FROM me) IS NOT NULL AND pr.location = (SELECT location FROM me) THEN true ELSE false END AS why_region,
      public.recent_engagement_score_for_user(pr.id) AS engagement_boost
    FROM public.profiles pr
    WHERE pr.id <> (SELECT user_id FROM me)
      AND COALESCE(pr.is_public, false) = true
      AND COALESCE(pr.profile_completeness_score, 0) >= 50
  )
  SELECT user_id, username, full_name, headline,
    (COALESCE(cardinality(why_skills),0) * 2)
    + (COALESCE(cardinality(why_sectors),0) * 3)
    + (CASE WHEN why_region THEN 2 ELSE 0 END)
    + COALESCE(engagement_boost,0) AS score,
    why_skills, why_sectors, why_region, engagement_boost
  FROM base
  WHERE (COALESCE(cardinality(why_skills),0) + COALESCE(cardinality(why_sectors),0) + CASE WHEN why_region THEN 1 ELSE 0 END) > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_people(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_people(int) TO authenticated;

-- 4) Spaces recommendations with engagement boost and explanations
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_spaces(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, tags text[], visibility text, score numeric, why_skills text[], why_sectors text[], engagement_boost int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH me AS (
    SELECT 
      COALESCE(skills, '{}') AS skills,
      COALESCE(impact_areas, '{}') AS impact_areas
    FROM public.profiles WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      s.id, s.title, s.description, s.tags, s.visibility,
      ARRAY(SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT skills FROM me))) AS why_skills,
      ARRAY(SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT impact_areas FROM me))) AS why_sectors,
      public.recent_engagement_score_for_space(s.id) AS engagement_boost
    FROM public.collaboration_spaces s
    WHERE s.status = 'active' AND s.visibility = 'public'
  )
  SELECT id, title, description, tags, visibility,
    (COALESCE(cardinality(why_skills),0) * 2)
    + (COALESCE(cardinality(why_sectors),0) * 3)
    + COALESCE(engagement_boost,0) AS score,
    why_skills, why_sectors, engagement_boost
  FROM base
  WHERE (COALESCE(cardinality(why_skills),0) + COALESCE(cardinality(why_sectors),0)) > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_spaces(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_spaces(int) TO authenticated;

-- 5) Opportunities recommendations with engagement boost and explanations
CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_opportunities(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, type text, tags text[], location text, link text, score numeric, why_skills text[], why_sectors text[], why_region boolean, engagement_boost int)
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
    FROM public.profiles WHERE id = (SELECT auth.uid())
  ), base AS (
    SELECT 
      c.id,
      c.title,
      c.description,
      c.contribution_type AS type,
      ARRAY[NULLIF(TRIM(c.impact_area), '')]::text[] AS tags,
      c.location,
      NULL::text AS link,
      ARRAY(SELECT unnest(ARRAY[NULLIF(TRIM(c.impact_area), '')]::text[]) INTERSECT SELECT unnest((SELECT skills FROM me))) AS why_skills,
      ARRAY(SELECT unnest(ARRAY[NULLIF(TRIM(c.impact_area), '')]::text[]) INTERSECT SELECT unnest((SELECT impact_areas FROM me))) AS why_sectors,
      CASE WHEN (SELECT location FROM me) IS NOT NULL AND NULLIF(TRIM(c.location), '') = (SELECT location FROM me) THEN true ELSE false END AS why_region,
      public.recent_engagement_score_for_opportunity(c.id) AS engagement_boost
    FROM public.contribution_cards c
    WHERE c.status = 'active'
  )
  SELECT id, title, description, type, tags, location, link,
    (COALESCE(cardinality(why_skills),0) * 2)
    + (COALESCE(cardinality(why_sectors),0) * 3)
    + (CASE WHEN why_region THEN 1 ELSE 0 END)
    + COALESCE(engagement_boost,0) AS score,
    why_skills, why_sectors, why_region, engagement_boost
  FROM base
  WHERE (COALESCE(cardinality(why_skills),0) + COALESCE(cardinality(why_sectors),0) + CASE WHEN why_region THEN 1 ELSE 0 END) > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.rpc_adin_recommend_opportunities(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_opportunities(int) TO authenticated;