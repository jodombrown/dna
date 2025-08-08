-- Fix migration by dropping existing conflicting functions first
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_people(int);
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_spaces(int);
DROP FUNCTION IF EXISTS public.rpc_adin_recommend_opportunities(int);
DROP FUNCTION IF EXISTS public.rpc_dashboard_counts();

-- Re-create with corrected definitions and privileges
CREATE OR REPLACE FUNCTION public.rpc_dashboard_counts()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_saved int := 0;
  v_joins int := 0;
  v_tasks7 int := 0;
  v_unread int := 0;
  v_active_spaces int := 0;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object(
      'saved_opportunities', 0,
      'pending_joins', 0,
      'tasks_due_7d', 0,
      'unread_notifications', 0,
      'active_spaces', 0
    );
  END IF;

  BEGIN
    SELECT count(*) INTO v_saved
    FROM public.user_contributions uc
    WHERE uc.user_id = v_user AND uc.type = 'opportunity_saved';
  EXCEPTION WHEN undefined_table THEN
    v_saved := 0;
  END;

  SELECT count(*) INTO v_joins
  FROM public.collaboration_memberships m
  WHERE m.user_id = v_user AND m.status = 'pending';

  BEGIN
    SELECT count(*) INTO v_tasks7
    FROM public.tasks t
    WHERE t.assignee_id = v_user
      AND t.status IN ('todo','in-progress')
      AND t.due_date IS NOT NULL
      AND t.due_date <= (now() + interval '7 days');
  EXCEPTION WHEN undefined_table THEN
    v_tasks7 := 0;
  END;

  SELECT count(*) INTO v_unread
  FROM public.notifications n
  WHERE n.user_id = v_user AND COALESCE(n.is_read, false) = false;

  SELECT count(*) INTO v_active_spaces
  FROM public.collaboration_memberships m
  JOIN public.collaboration_spaces s ON s.id = m.space_id
  WHERE m.user_id = v_user AND m.status = 'approved' AND s.status = 'active';

  RETURN jsonb_build_object(
    'saved_opportunities', v_saved,
    'pending_joins', v_joins,
    'tasks_due_7d', v_tasks7,
    'unread_notifications', v_unread,
    'active_spaces', v_active_spaces
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_dashboard_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_dashboard_counts() TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_people(p_limit int DEFAULT 5)
RETURNS TABLE(user_id uuid, username text, full_name text, headline text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT id AS user_id,
           COALESCE(skills, '{}')::text[] AS skills,
           COALESCE(impact_areas, '{}')::text[] AS impact_areas,
           NULLIF(trim(location), '') AS location
    FROM public.profiles WHERE id = auth.uid()
  ),
  base AS (
    SELECT pr.id AS user_id, pr.username, pr.full_name, pr.headline,
      (
        COALESCE(cardinality(
          ARRAY(
            SELECT unnest(pr.skills) INTERSECT SELECT unnest((SELECT skills FROM me))
          )
        ), 0) * 2
      ) + (
        COALESCE(cardinality(
          ARRAY(
            SELECT unnest(pr.impact_areas) INTERSECT SELECT unnest((SELECT impact_areas FROM me))
          )
        ), 0) * 3
      ) + (
        CASE WHEN (SELECT location FROM me) IS NOT NULL AND pr.location = (SELECT location FROM me) THEN 2 ELSE 0 END
      ) AS score
    FROM public.profiles pr
    WHERE pr.id <> (SELECT user_id FROM me)
  )
  SELECT * FROM base
  WHERE score > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.rpc_adin_recommend_people(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_people(int) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_spaces(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, tags text[], visibility text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT COALESCE(skills, '{}')::text[] AS skills,
           COALESCE(impact_areas, '{}')::text[] AS impact_areas
    FROM public.profiles WHERE id = auth.uid()
  ),
  base AS (
    SELECT s.id, s.title, s.description, s.tags, s.visibility,
      (
        COALESCE(cardinality(
          ARRAY(
            SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT skills FROM me))
          )
        ), 0) * 2
      ) + (
        COALESCE(cardinality(
          ARRAY(
            SELECT unnest(s.tags) INTERSECT SELECT unnest((SELECT impact_areas FROM me))
          )
        ), 0) * 3
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

CREATE OR REPLACE FUNCTION public.rpc_adin_recommend_opportunities(p_limit int DEFAULT 5)
RETURNS TABLE(id uuid, title text, description text, type text, tags text[], location text, link text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT COALESCE(skills, '{}')::text[] AS skills,
           COALESCE(impact_areas, '{}')::text[] AS impact_areas
    FROM public.profiles WHERE id = auth.uid()
  ),
  base AS (
    SELECT p.id,
           p.content AS title,
           NULL::text AS description,
           p.opportunity_type AS type,
           '{}'::text[] AS tags,
           NULL::text AS location,
           p.opportunity_link AS link,
           (
             COALESCE((SELECT count(*) FROM unnest((SELECT skills FROM me)) s WHERE p.content ILIKE '%' || s || '%'), 0) * 2
           ) + (
             COALESCE((SELECT count(*) FROM unnest((SELECT impact_areas FROM me)) ia WHERE p.content ILIKE '%' || ia || '%'), 0) * 3
           ) AS score
    FROM public.posts p
    WHERE p.status = 'published' AND p.visibility = 'public' AND (p.type = 'opportunity' OR p.opportunity_type IS NOT NULL)
  )
  SELECT * FROM base
  WHERE score > 0
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.rpc_adin_recommend_opportunities(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_adin_recommend_opportunities(int) TO authenticated;