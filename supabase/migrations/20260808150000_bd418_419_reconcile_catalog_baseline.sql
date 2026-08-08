-- BD418/419. Reconcile the security-invariant baseline after BD418 dropped 22
-- retired tables and BD419 landed the Workspace foundation (workspaces,
-- events.workspace_id). Records state already applied to the live database in
-- the same change. Idempotent by construction; safe to replay as a no-op.
--
-- WHY THIS EXISTS
-- BD418 dropped 22 tables: the 19 roadmap_* tables (the retired Roadmap event
-- micro-product) plus billing_transactions, organization_verification_requests,
-- and organizations (the retired Organizations feature). BD419 added
-- workspaces and events.workspace_id. The live catalog moved; the committed
-- baseline that src/test/security/catalogInvariants.test.ts (BD268) diffs
-- against did not. check_security_invariants() then reported three RED
-- invariants on EVERY branch:
--   INV2_anon_reachable_drift_from_baseline  — NEW workspaces, GONE 12 roadmap_*
--   INV8_guard_functions_unwired             — 3 prevent_% functions orphaned
--   INV9_authenticated_read_surface_shrank   — LOST columns across all 22 tables
-- "Run security integration tests" is a required check on main, so every open
-- and future PR was blocked for a reason no branch caused (same shape as
-- BD356/platform_fees). This file reconciles the two baseline tables and
-- retires the orphaned guard functions. It does NOT re-seed either baseline
-- table wholesale: rows are operational state that change only by a ruled
-- decision (BD285, BD293, BD356), so this is a surgical diff.
--
-- WHAT MOVED, LINE BY LINE (verified against the live catalog 2026-08-08,
-- never from a BD narrative):
--
--   1. INV2 baseline (anon-reachable relations): 12 of the dropped tables
--      carried a baseline row (roadmap_tracks, roadmap_event_photos,
--      roadmap_sponsors, roadmap_session_reminder_sends,
--      roadmap_impact_metrics, roadmap_sessions, roadmap_reminder_prefs,
--      roadmap_survey_responses, roadmap_sponsor_digest_sends,
--      roadmap_saved_sessions, roadmap_speakers, roadmap_testimonials);
--      to_regclass is NULL for all twelve. Removing them clears the GONE
--      side of INV2's drift.
--
--   2. INV2 baseline, NEW side: workspaces now holds a live anon SELECT grant
--      with a permissive policy whose role list includes public ("Owners can
--      view their own workspace", cmd SELECT, roles {public}), which is what
--      INV2 detects as "reachable." The policy's qual is
--      owner_user_id = auth.uid(): for the anon role auth.uid() is NULL, so
--      the qual can never match and anon reads zero rows. This is the same
--      RLS row-scoping-to-owner shape used elsewhere in the schema, not an
--      open table. Adopting it into the baseline (ACCEPTED, ruled BD419)
--      clears the NEW side of INV2's drift and gates any future loosening of
--      that policy as a detectable change.
--
--   3. INV9 baseline (authenticated read columns): every column of the 22
--      dropped tables no longer exists. Removing them clears the LOSS that
--      made INV9 RED. LOSS is the only thing INV9 gates on.
--
--   4. INV9 gains (events.workspace_id, workspaces.*, plus
--      stat_citations.scope_geography/scope_period/scope_population and
--      media_assets.* carried over from prior unrelated work) are reported
--      by INV9, not gated — INV9 only fails on loss — so this migration does
--      not need to touch them. They are visible in the reported-gains list
--      until a future baseline decision chooses to adopt them, which is the
--      honest state.
--
--   5. INV8 (guard functions unwired): prevent_organization_privilege_escalation,
--      prevent_org_privileged_self_update, and prevent_org_self_verification
--      were SECURITY DEFINER triggers that existed only to guard
--      organizations columns (verified, verification_status,
--      subscription_tier, stripe_customer_id, etc. — confirmed by reading
--      each function body). organizations is gone, so these functions can
--      never again be attached to a trigger; they are permanently dead code,
--      not a rewiring gap. Dropping them clears INV8, which counts exactly
--      this: prevent_% functions in public with zero enabled non-internal
--      triggers.

-- =====================================================================
-- 1. INV2 baseline — drop the twelve retired relations.
-- =====================================================================
DELETE FROM public.security_baseline_anon_relations
WHERE relname IN (
  'roadmap_tracks', 'roadmap_event_photos', 'roadmap_sponsors',
  'roadmap_session_reminder_sends', 'roadmap_impact_metrics', 'roadmap_sessions',
  'roadmap_reminder_prefs', 'roadmap_survey_responses', 'roadmap_sponsor_digest_sends',
  'roadmap_saved_sessions', 'roadmap_speakers', 'roadmap_testimonials'
);

-- =====================================================================
-- 2. INV2 baseline — adopt workspaces, ruled (owner-scoped RLS, not open).
-- =====================================================================
INSERT INTO public.security_baseline_anon_relations (relname, disposition, ruled_by, ruled_at)
VALUES (
  'workspaces',
  'ACCEPTED. Anon holds table-level SELECT (Supabase default grant) and the '
  || '"Owners can view their own workspace" policy lists role public, which is '
  || 'what INV2 detects as reachable. qual is owner_user_id = auth.uid(); for '
  || 'anon, auth.uid() is NULL, so the policy admits zero rows in practice. '
  || 'Row-scoped-to-owner via auth.uid(), the same pattern used elsewhere in '
  || 'this schema. Adopted into the INV2 baseline per BD419.',
  'BD419', now()
)
ON CONFLICT (relname) DO UPDATE
  SET disposition = EXCLUDED.disposition,
      ruled_by    = EXCLUDED.ruled_by,
      ruled_at    = EXCLUDED.ruled_at;

-- =====================================================================
-- 3. INV9 baseline — drop every retired column across the 22 dropped tables.
-- =====================================================================
DELETE FROM public.security_baseline_authenticated_reads
WHERE relname IN (
  'billing_transactions', 'organization_verification_requests', 'organizations',
  'roadmap_attendees', 'roadmap_event_photos', 'roadmap_impact_metrics',
  'roadmap_reminder_prefs', 'roadmap_saved_sessions', 'roadmap_session_reminder_sends',
  'roadmap_sessions', 'roadmap_speaker_followers', 'roadmap_speaker_update_sends',
  'roadmap_speaker_updates', 'roadmap_speakers', 'roadmap_sponsor_digest_sends',
  'roadmap_sponsor_leads', 'roadmap_sponsor_managers', 'roadmap_sponsors',
  'roadmap_subscribers', 'roadmap_survey_responses', 'roadmap_testimonials',
  'roadmap_tracks'
);

-- =====================================================================
-- 4. INV8 — retire the three orphaned organizations guard functions.
-- =====================================================================
DROP FUNCTION IF EXISTS public.prevent_organization_privilege_escalation();
DROP FUNCTION IF EXISTS public.prevent_org_privileged_self_update();
DROP FUNCTION IF EXISTS public.prevent_org_self_verification();
