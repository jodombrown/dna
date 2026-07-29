-- Location columns become owner-only.
--
-- ALREADY APPLIED to the live database ahead of this file (SQL Editor lane,
-- D083). This migration records applied state so the repo stops lying about
-- the schema. Written to be idempotent.
--
-- Captures three things:
--   1. public.get_own_location(), the owner-only SECURITY DEFINER projection
--      for a member's own coordinate. Authored in the Lovable lane on
--      2026-07-28, applied at publish, then lost when that lane reset to main.
--      Recovered from branch rescue/lovable-chainB-1631.
--   2. Revoke of profiles.current_lat / current_lng / current_geog from
--      authenticated and anon, so precise location is reachable only through
--      the definer above. service_role retains table-level SELECT.
--   3. Removal of those three columns from the INV9 baseline, so the shrink
--      reads as a ruled change rather than drift.
--
-- Ordering constraint, already satisfied: the client re-point (PR #172,
-- useNearMeEvents -> get_own_location) landed BEFORE the revoke. Reversed,
-- near-me events breaks.
--
-- Certified 2026-07-29 by four-persona probe on the live catalog:
--   anon          direct read 42501, definer 42501
--   authenticated direct read 42501, definer callable
--   service_role  retains SELECT via table ACL
--   all nine invariants GREEN, including INV9

-- 1. Owner-only location projection.
CREATE OR REPLACE FUNCTION public.get_own_location()
 RETURNS TABLE(current_lat double precision, current_lng double precision)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.current_lat, p.current_lng
  FROM public.profiles p
  WHERE p.id = auth.uid()
$function$;

-- A fresh CREATE auto-grants EXECUTE to PUBLIC. Revoke explicitly, then grant
-- only the intended roles. CREATE OR REPLACE on an existing function preserves
-- its ACL, so this is correct in both directions.
REVOKE ALL ON FUNCTION public.get_own_location() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_own_location() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_own_location() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_own_location() TO service_role;

-- 2. Precise location is not readable off the profile row by any client role.
REVOKE SELECT (current_lat, current_lng, current_geog) ON public.profiles FROM authenticated;
REVOKE SELECT (current_lat, current_lng, current_geog) ON public.profiles FROM anon;

-- 3. Record the shrink in the INV9 baseline so the invariant reads GREEN.
--    Guarded: the baseline table itself has no migration file yet (tracked
--    separately), so a replay against a database without it must not fail.
DO $$
BEGIN
  IF to_regclass('public.security_baseline_authenticated_reads') IS NOT NULL THEN
    DELETE FROM public.security_baseline_authenticated_reads
     WHERE relname = 'profiles'
       AND attname IN ('current_lat','current_lng','current_geog');
  END IF;
END $$;
