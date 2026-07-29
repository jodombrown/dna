-- Security invariant harness: backfill of already-applied state.
--
-- ALREADY APPLIED to the live database (SQL Editor lane, D083). This file
-- records it so the repo stops diverging from the catalog (BD286). Idempotent.
--
-- WHY THIS MATTERS: src/test/security/catalogInvariants.test.ts (BD268) calls
-- public.check_security_invariants() and asserts all nine invariants are GREEN.
-- Until this file existed, the TEST was in the repo and the THING IT TESTS was
-- not. A database rebuilt from migrations would have had no harness at all, and
-- the suite would have failed against a function that does not exist.
--
-- Five objects, transcribed from pg_get_functiondef / pg_attribute on the live
-- catalog on 2026-07-29, never from memory or from a BD narrative:
--   public.security_baseline_anon_relations       (table, INV2 baseline)
--   public.security_baseline_authenticated_reads  (table, INV9 baseline)
--   public._inv1_policy_name_drift()              (INV1 detector)
--   public._inv9_authenticated_read_drift()       (INV9 detector)
--   public.check_security_invariants()            (the nine-invariant entry point)
--
-- ON THE BASELINE DATA. The two baseline tables hold 133 and 2451 rows. Those
-- rows are OPERATIONAL STATE, not schema: they are the recorded point that
-- drift is measured against, and they change only by a ruled decision (see
-- BD285, where three rows were deleted in the same transaction as a deliberate
-- revoke). This migration therefore seeds each table ONLY IF IT IS EMPTY:
--   * against the live database the guard makes it a no-op, so no ruled
--     deletion is silently undone;
--   * against a rebuilt database it establishes a starting point, which is
--     correct because nothing has drifted yet on a fresh build.
-- Enumerating 2584 rows into a migration would make every ruled change a
-- merge conflict and would still not be more true than this.

-- =====================================================================
-- 1. BASELINE TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.security_baseline_anon_relations (
  relname     text NOT NULL,
  disposition text NOT NULL DEFAULT 'UNRULED'::text,
  ruled_by    text,
  ruled_at    timestamp with time zone,
  seeded_at   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT security_baseline_anon_relations_pkey PRIMARY KEY (relname)
);

CREATE TABLE IF NOT EXISTS public.security_baseline_authenticated_reads (
  relname   text NOT NULL,
  attname   text NOT NULL,
  seeded_at timestamp with time zone,
  CONSTRAINT security_baseline_authenticated_reads_pkey PRIMARY KEY (relname, attname)
);

-- RLS on, deliberately WITH NO POLICIES. That is deny-all for every role that
-- is not the owner and does not bypass RLS. Only postgres and service_role
-- reach these tables, which is what the definers above need and nothing more.
ALTER TABLE public.security_baseline_anon_relations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_baseline_authenticated_reads ENABLE ROW LEVEL SECURITY;

-- Supabase grants anon/authenticated by default on new tables in public.
-- Strip them: a baseline readable by a client role is a map of the attack
-- surface, and a baseline WRITABLE by one defeats every invariant that reads it.
REVOKE ALL ON public.security_baseline_anon_relations      FROM anon, authenticated;
REVOKE ALL ON public.security_baseline_authenticated_reads FROM anon, authenticated;
GRANT  ALL ON public.security_baseline_anon_relations      TO service_role;
GRANT  ALL ON public.security_baseline_authenticated_reads TO service_role;

-- =====================================================================
-- 2. INV1 DETECTOR — policy NAME promises a filter its PREDICATE never applies
-- =====================================================================

CREATE OR REPLACE FUNCTION public._inv1_policy_name_drift()
 RETURNS TABLE(h text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_catalog'
AS $function$
WITH map(tok, cols) AS (VALUES
  ('published', ARRAY['status','published','is_published','published_at']),
  ('active',    ARRAY['active','is_active']),
  ('approved',  ARRAY['approved','is_approved','approval_status']),
  ('verified',  ARRAY['verified','is_verified','verification_status']),
  ('featured',  ARRAY['featured','is_featured']),
  ('deleted',   ARRAY['deleted','is_deleted','deleted_at']),
  ('archived',  ARRAY['archived','is_archived','archived_at']),
  ('confirmed', ARRAY['confirmed','is_confirmed']),
  ('completed', ARRAY['completed','is_completed','completed_at']),
  ('cancelled', ARRAY['cancelled','is_cancelled','cancelled_at']),
  -- is_public / account_visibility are the ROW gates on this schema.
  -- profiles.visibility is a jsonb FIELD map and is excluded by type below.
  ('visible',   ARRAY['visible','is_visible','visibility','is_public','account_visibility'])
),
cand AS (
  SELECT pol.oid AS polid, c.oid AS relid, c.relname, pol.polname, m.tok, m.cols,
         coalesce(pg_get_expr(pol.polqual, pol.polrelid),'')||
         coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid),'') AS expr
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN map m
  WHERE n.nspname='public'
    AND lower(pol.polname) LIKE '%'||m.tok||'%'
    AND lower(c.relname)  NOT LIKE '%'||m.tok||'%'
)
SELECT relname||' :: '||polname||'  promises "'||tok||'" and applies none of {'||array_to_string(cols,',')||'}'
FROM cand
WHERE EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=cand.relid AND a.attnum>0
                AND NOT a.attisdropped AND lower(a.attname) = ANY(cand.cols)
                AND a.atttypid <> 'jsonb'::regtype)          -- a field map is not a row gate
  AND NOT EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=cand.relid AND a.attnum>0
                    AND NOT a.attisdropped AND lower(a.attname) = ANY(cand.cols)
                    AND cand.expr LIKE '%'||a.attname||'%');
$function$;

-- =====================================================================
-- 3. INV9 DETECTOR — authenticated read surface SHRANK against the baseline
-- =====================================================================

CREATE OR REPLACE FUNCTION public._inv9_authenticated_read_drift()
 RETURNS TABLE(lost text, gained text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_catalog'
AS $function$
WITH live AS (
  SELECT c.relname, a.attname
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
  WHERE n.nspname='public' AND c.relkind='r'
    AND has_column_privilege('authenticated', c.oid, a.attname, 'SELECT')
)
SELECT
  (SELECT coalesce(string_agg(b.relname||'.'||b.attname, ', ' ORDER BY b.relname,b.attname),'')
     FROM public.security_baseline_authenticated_reads b
    WHERE NOT EXISTS (SELECT 1 FROM live l WHERE l.relname=b.relname AND l.attname=b.attname)),
  (SELECT coalesce(string_agg(l.relname||'.'||l.attname, ', ' ORDER BY l.relname,l.attname),'')
     FROM live l
    WHERE NOT EXISTS (SELECT 1 FROM public.security_baseline_authenticated_reads b
                       WHERE b.relname=l.relname AND b.attname=l.attname));
$function$;

-- =====================================================================
-- 4. THE NINE-INVARIANT ENTRY POINT
--    One rule has one definition (BD242): the CI test and the weekly drift
--    read (BD264) both call THIS, neither reimplements the queries.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.check_security_invariants()
 RETURNS TABLE(invariant text, status text, violations bigint, detail text, scope text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_catalog'
AS $function$
DECLARE
  k_events_anon_cols  text[] := ARRAY['id','is_public','status','visibility'];
  k_projection_tables text[] := ARRAY['profiles','events'];
  k_untrusted_roles   text[] := ARRAY['anon','authenticated'];
  k_member_tables     text[] := ARRAY['profiles','posts','events','comments','spaces','groups','organizations'];
  r record; n_hits bigint := 0; s_hits text := ''; v_cnt bigint; d record;
BEGIN
RETURN QUERY SELECT 'INV1_policy_name_vs_predicate',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*), coalesce(string_agg(x.h,' ; '),'(none)'),
  'covers: all pg_policy in public. excludes: other schemas; tokens shared with the table name; promises with no non-jsonb column of that meaning'
  FROM public._inv1_policy_name_drift() x;

RETURN QUERY
WITH live AS (
  SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
    AND (has_table_privilege('anon', c.oid,'SELECT')
         OR EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0
                      AND NOT a.attisdropped AND a.attacl IS NOT NULL
                      AND EXISTS (SELECT 1 FROM aclexplode(a.attacl) y WHERE y.grantee='anon'::regrole)))
    AND EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid=c.oid AND pol.polpermissive
                  AND pol.polcmd IN ('r','*')
                  AND (pol.polroles='{0}' OR 'anon'::regrole = ANY(pol.polroles)))),
drift AS (
  SELECT relname, 'NEW' AS dir FROM live WHERE relname NOT IN (SELECT relname FROM public.security_baseline_anon_relations)
  UNION ALL
  SELECT relname, 'GONE' FROM public.security_baseline_anon_relations WHERE relname NOT IN (SELECT relname FROM live))
SELECT 'INV2_anon_reachable_drift_from_baseline',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*),
  coalesce(string_agg(dir||' '||relname,', '),'(none)')||'  | unruled backlog: '||
    (SELECT count(*) FROM public.security_baseline_anon_relations WHERE disposition='UNRULED')::text,
  'reachable = anon SELECT grant AND a permissive SELECT policy admitting anon or PUBLIC. excludes views/matviews, other schemas, non-SELECT commands'
FROM drift;

RETURN QUERY SELECT 'INV3_definer_execute_to_PUBLIC',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*), coalesce(string_agg(p.proname,', '),'(none)'),
  'covers: every prosecdef function in public with proacl NULL or grantee=0. NO allowlist by design'
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.prosecdef
    AND (p.proacl IS NULL OR EXISTS (SELECT 1 FROM aclexplode(p.proacl) y WHERE y.grantee=0));

RETURN QUERY SELECT 'INV4_views_hold_anon_grants',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*),
  coalesce(string_agg(DISTINCT c.relname||':'||y.privilege_type,', '),'(none)'),
  'covers: relkind v and m in public, table ACL and column ACLs'
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  LEFT JOIN LATERAL aclexplode(c.relacl) y ON y.grantee='anon'::regrole
  WHERE n.nspname='public' AND c.relkind IN ('v','m') AND y.grantee IS NOT NULL;

RETURN QUERY
WITH live AS (SELECT coalesce(array_agg(a.attname::text ORDER BY a.attname), ARRAY[]::text[]) AS cols
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
  WHERE n.nspname='public' AND c.relname='events' AND a.attacl IS NOT NULL
    AND EXISTS (SELECT 1 FROM aclexplode(a.attacl) y WHERE y.grantee='anon'::regrole))
SELECT 'INV5_events_anon_col_grants_exact',
  CASE WHEN l.cols @> k_events_anon_cols AND l.cols <@ k_events_anon_cols THEN 'GREEN' ELSE 'RED' END,
  (SELECT count(*) FROM unnest(l.cols) u WHERE u <> ALL(k_events_anon_cols))
  + (SELECT count(*) FROM unnest(k_events_anon_cols) u WHERE u <> ALL(l.cols)),
  'live={'||array_to_string(l.cols,',')||'} expected={'||array_to_string(k_events_anon_cols,',')||'}',
  'source: pg_attribute.attacl, never information_schema (BD183 under-counts). set equality both directions'
FROM live l;

FOR r IN SELECT c.relname AS t, a.attname AS col
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
  WHERE n.nspname='public' AND c.relkind='r' AND c.relname = ANY(k_member_tables)
    AND format_type(a.atttypid,NULL) IN ('text','character varying')
LOOP
  EXECUTE format('SELECT count(*) FROM public.%I WHERE %I ~* %L', r.t, r.col, 'operating[ -]system') INTO v_cnt;
  IF v_cnt > 0 THEN n_hits := n_hits + v_cnt; s_hits := s_hits || r.t||'.'||r.col||'='||v_cnt||' '; END IF;
END LOOP;
RETURN QUERY SELECT 'INV6_retired_framing_in_member_text',
  CASE WHEN n_hits=0 THEN 'GREEN' ELSE 'RED' END, n_hits,
  CASE WHEN n_hits=0 THEN '(none)' ELSE s_hits END,
  'covers: every text/varchar column on '||array_to_string(k_member_tables,',')||'. excludes jsonb bodies, other tables, and the repo';

RETURN QUERY SELECT 'INV7_truncate_on_projection_tables',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*),
  coalesce(string_agg(c.relname||'/'||rr.rolname,', '),'(none)'),
  'covers: TRUNCATE held by anon+authenticated on profiles,events. excludes the other 236 public tables (BD266)'
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN unnest(k_untrusted_roles) AS rr(rolname)
  WHERE n.nspname='public' AND c.relname = ANY(k_projection_tables)
    AND has_table_privilege(rr.rolname, c.oid,'TRUNCATE');

RETURN QUERY SELECT 'INV8_guard_functions_unwired',
  CASE WHEN count(*)=0 THEN 'GREEN' ELSE 'RED' END, count(*), coalesce(string_agg(p.proname,', '),'(none)'),
  'covers: prevent_% functions in public with zero enabled non-internal triggers (BD109)'
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname LIKE 'prevent\_%'
    AND NOT EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgfoid=p.oid AND NOT t.tgisinternal AND t.tgenabled <> 'D');

-- INV9 (BD277). Every other invariant watches OVER-exposure. This one watches
-- UNDER-exposure, which is the direction that took the product down twice tonight.
SELECT * INTO d FROM public._inv9_authenticated_read_drift();
RETURN QUERY SELECT 'INV9_authenticated_read_surface_shrank',
  CASE WHEN coalesce(d.lost,'')='' THEN 'GREEN' ELSE 'RED' END,
  CASE WHEN coalesce(d.lost,'')='' THEN 0::bigint
       ELSE (length(d.lost) - length(replace(d.lost,',','')) + 1)::bigint END,
  CASE WHEN coalesce(d.lost,'')='' THEN '(none lost)' ELSE 'LOST: '||d.lost END
    ||CASE WHEN coalesce(d.gained,'')='' THEN '' ELSE '  | gained (reported, not gated): '||d.gained END,
  'covers: every (table,column) authenticated holds SELECT on across public base tables, diffed against a committed baseline. LOSS is RED; gains are reported only. excludes views, other schemas, non-SELECT privileges';
END
$function$;

-- =====================================================================
-- 5. FUNCTION ACLs
--    CREATE auto-grants EXECUTE to PUBLIC on a fresh create, which INV3 would
--    then correctly flag against the harness itself. Revoke, then grant only
--    what the live catalog holds: postgres (owner, implicit) and service_role.
--    The CI suite authenticates with the service-role key; no client role ever
--    calls these.
-- =====================================================================

REVOKE ALL ON FUNCTION public._inv1_policy_name_drift()        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._inv9_authenticated_read_drift() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_security_invariants()      FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public._inv1_policy_name_drift()        TO service_role;
GRANT EXECUTE ON FUNCTION public._inv9_authenticated_read_drift() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_security_invariants()      TO service_role;

-- =====================================================================
-- 6. BASELINE SEED — ONLY IF EMPTY (see header)
-- =====================================================================

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.security_baseline_anon_relations) THEN
    INSERT INTO public.security_baseline_anon_relations (relname, disposition)
    SELECT c.relname, 'UNRULED'
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
      AND (has_table_privilege('anon', c.oid,'SELECT')
           OR EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0
                        AND NOT a.attisdropped AND a.attacl IS NOT NULL
                        AND EXISTS (SELECT 1 FROM aclexplode(a.attacl) y WHERE y.grantee='anon'::regrole)))
      AND EXISTS (SELECT 1 FROM pg_policy pol WHERE pol.polrelid=c.oid AND pol.polpermissive
                    AND pol.polcmd IN ('r','*')
                    AND (pol.polroles='{0}' OR 'anon'::regrole = ANY(pol.polroles)))
    ON CONFLICT (relname) DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.security_baseline_authenticated_reads) THEN
    INSERT INTO public.security_baseline_authenticated_reads (relname, attname, seeded_at)
    SELECT c.relname, a.attname, now()
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
    WHERE n.nspname='public' AND c.relkind='r'
      AND has_column_privilege('authenticated', c.oid, a.attname, 'SELECT')
    ON CONFLICT (relname, attname) DO NOTHING;
  END IF;
END
$seed$;
