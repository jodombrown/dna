-- BD470 Fork B. Reconcile the INV9 baseline after event_checkins was dropped
-- in favor of the derived-checked_in design (event_attendees.checked_in now
-- maintained by a trigger reading event_attendance_records). Records state
-- already applied to the live database in the same change. Idempotent by
-- construction; safe to replay as a no-op.
--
-- WHY THIS EXISTS
-- check_security_invariants() started reporting INV9_authenticated_read_
-- surface_shrank RED on every branch once event_checkins was dropped live —
-- same shape as BD356/BD418/419/BD427: the live catalog moved, the committed
-- baseline table did not. "Run security integration tests" is a required
-- check on main, so every open and future PR was blocked for a reason no
-- branch caused. Surfaced while investigating a CI failure unrelated to
-- event_checkins.
--
-- WHAT MOVED (verified against the live catalog, not assumed from names):
-- event_checkins.id, .by_profile_id, .checked_in_at, .registration_id no
-- longer exist; to_regclass('public.event_checkins') is NULL. Their
-- replacement — event_attendees.checked_in (derived by trigger) plus the
-- evidence rows in event_attendance_records — is a new relation, which INV9
-- only reports, it does not gate on gains. This migration removes exactly
-- the LOST rows; it does not touch the reported gains, which stay visible
-- until a future baseline decision adopts them.

DELETE FROM public.security_baseline_authenticated_reads
WHERE relname = 'event_checkins'
  AND attname IN ('id', 'by_profile_id', 'checked_in_at', 'registration_id');
