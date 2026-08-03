-- BD356. Reconcile the security-invariant baseline after platform_fees was
-- retired (D049 per BD353). Records state applied to the live database in the
-- same change. Idempotent by construction; safe to replay as a no-op.
--
-- WHY THIS EXISTS
-- platform_fees was archived and dropped on founder ruling (D049 per BD353),
-- to archive.platform_fees_retired_20260803 with its one row preserved. The
-- live catalog moved; the committed baseline that
-- src/test/security/catalogInvariants.test.ts (BD268) diffs against did not.
-- check_security_invariants() then reported two RED invariants on EVERY branch:
--   INV2_anon_reachable_drift_from_baseline  — GONE platform_fees
--   INV9_authenticated_read_surface_shrank   — LOST platform_fees.* (9 columns)
-- "Run security integration tests" is a required check on main, so every open
-- and future PR was blocked for a reason no branch caused. This file removes
-- the two retired baseline entries and rules the one certified gain. It does
-- NOT re-seed either table: rows are operational state that change only by a
-- ruled decision (see BD285, BD293), so the correct move is a surgical diff,
-- never a wholesale regeneration that would strip every prior disposition.
--
-- WHAT MOVED, LINE BY LINE (verified against the live catalog 2026-08-03, never
-- from a BD narrative):
--   1. INV2 baseline: platform_fees is GONE from public (to_regclass NULL;
--      archive.platform_fees_retired_20260803 present). Its baseline row carried
--      disposition UNRULED, so removing it also drops the INV2 unruled backlog
--      from 133 to 132. Nothing else drifts.
--   2. INV9 baseline: the nine authenticated-readable platform_fees columns
--      (applies_to, created_at, fee_type, id, is_active, max_amount, min_amount,
--      name, value) no longer exist. Removing them clears the LOSS that made
--      INV9 RED. LOSS is the only thing INV9 gates on.
--   3. INV9 gain, RULED and absorbed: spaces.definition_of_done and
--      spaces.target_date. These are the certified migration
--      add_spaces_completability_declaration (live version 20260803153855).
--      Both hold authenticated SELECT live. Adopting them into the baseline is
--      correct: they are the recorded expected surface now, and a future
--      revoke on either should be caught by INV9 as a loss.
--
-- WHAT IS DELIBERATELY LEFT ALONE
--   media_assets.* (16 authenticated-readable columns) is reported by INV9 as a
--   gain. INV9 gates on LOSS only, so this migration does not need to touch it,
--   and it is NOT absorbed here. It is accounted for by the certified migration
--   bd320_media_assets_phase_1a (live version 20260731190306, BD311 / BD320):
--   the table comment records that it carries NO anon grant by design and that
--   signed-out surfaces receive framing through SECURITY DEFINER projections
--   per D089. Its authenticated read surface (own rows or the dna-media-public
--   bucket, RLS-gated, no anon) is intact and ruled. Whether it should be
--   adopted into the INV9 baseline so a future media_assets revoke is gated is a
--   separate baseline decision and is left for its own ruling. It stays visible
--   in INV9's reported-gains list until then, which is the honest state — this
--   file blesses nothing it cannot cite by number.

-- 1. INV2 baseline — drop the retired relation.
DELETE FROM public.security_baseline_anon_relations
WHERE relname = 'platform_fees';

-- 2. INV9 baseline — drop the nine retired columns.
DELETE FROM public.security_baseline_authenticated_reads
WHERE relname = 'platform_fees'
  AND attname IN ('applies_to','created_at','fee_type','id','is_active',
                  'max_amount','min_amount','name','value');

-- 3. INV9 baseline — absorb the two certified spaces columns, with the ruling
--    attached so the next reader can tell an accepted surface from an unexamined
--    one (BD293's provenance discipline).
INSERT INTO public.security_baseline_authenticated_reads
  (relname, attname, seeded_at, disposition, ruled_by, ruled_at)
VALUES
  ('spaces', 'definition_of_done', now(),
   'ACCEPTED. Certified migration add_spaces_completability_declaration (live version 20260803153855). authenticated holds SELECT. Adopted into the INV9 baseline as expected surface per BD356.',
   'BD356', now()),
  ('spaces', 'target_date', now(),
   'ACCEPTED. Certified migration add_spaces_completability_declaration (live version 20260803153855). authenticated holds SELECT. Adopted into the INV9 baseline as expected surface per BD356.',
   'BD356', now())
ON CONFLICT (relname, attname) DO UPDATE
  SET disposition = EXCLUDED.disposition,
      ruled_by    = EXCLUDED.ruled_by,
      ruled_at    = EXCLUDED.ruled_at;
