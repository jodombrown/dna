-- BD427. Reconcile the INV2 anon-reachable baseline for the six tables
-- introduced by the Relationships/Workspace foundation (parties,
-- workspace_relationships, event_engagements, event_engagement_roles,
-- event_attendance_records, event_delivery_endpoints). Records state already
-- applied to the live database in the same change. Idempotent by
-- construction; safe to replay as a no-op.
--
-- WHY THIS EXISTS
-- check_security_invariants() started reporting
-- INV2_anon_reachable_drift_from_baseline RED on every branch once these six
-- tables landed on the live database — same shape as BD356/BD419: the live
-- catalog moved, the committed baseline table did not. "Run security
-- integration tests" is a required check on main, so every open and future
-- PR was blocked for a reason no branch caused. Surfaced and reconciled
-- while investigating a CI failure on PR #285 (which touches none of these
-- tables).
--
-- WHAT WAS ACTUALLY VERIFIED, not assumed from table or column names:
--
--   event_delivery_endpoints.join_credential was, under the policy as
--   originally shipped (BD421), readable by anon for any published+public
--   event with no auth.uid() check at all — a real access secret (meeting
--   URL/password/PIN), not descriptive metadata. Corrected here in BD427:
--   SELECT now requires organizer_id = auth.uid() OR a confirmed
--   event_attendees row (user_id = auth.uid() AND status = 'going').
--   Certified null-safe for anon by a direct behavioral probe
--   (SET LOCAL ROLE anon in a rolled-back transaction), not merely by
--   reading the predicate.
--
--   event_attendance_records, workspace_relationships: SELECT policies
--   resolve through auth.uid() (event_attendees.user_id = auth.uid(), and
--   workspaces.owner_user_id = auth.uid() respectively); NULL for anon, so
--   both admit zero rows in practice. Same owner-scoped-via-auth.uid()
--   pattern as the workspaces baseline entry (BD419).
--
--   event_engagement_roles, event_engagements, parties: genuinely reachable
--   by anon for a published+public event, not merely null-safe. Accepted on
--   content grounds: exposed columns are a role label
--   (sponsor/partner/vendor/exhibitor/volunteer/speaker/team_member),
--   event/party linkage ids, and a party's type/name/linked_profile_id (a
--   UUID only — it does not itself expose profile content, which is gated
--   by profiles' own separate RLS). Same disclosure category as a public
--   event's already-public title or host — equivalent to a conference site
--   publicly listing its sponsors and speakers by name. No credential, no
--   contact detail.
--
-- This migration does not re-seed the baseline table wholesale: rows are
-- operational state that change only by a ruled decision, so this is a
-- surgical insert of exactly the six new relations.

INSERT INTO public.security_baseline_anon_relations (relname, disposition, ruled_by, ruled_at)
VALUES
  (
    'event_delivery_endpoints',
    'ACCEPTED, following a real fix, not accepted as originally shipped. The '
    || 'original policy (BD421) admitted published+public events with no '
    || 'auth.uid() check, exposing join_credential, a real access secret '
    || '(meeting URL/password/PIN), to the public role. Corrected in BD427: '
    || 'SELECT now requires organizer_id = auth.uid() OR a confirmed '
    || 'event_attendees row with user_id = auth.uid() AND status = ''going''. '
    || 'Certified null-safe for anon by direct behavioral probe (SET LOCAL ROLE '
    || 'anon in a rolled-back transaction), not merely by reading the predicate.',
    'BD427', now()
  ),
  (
    'event_attendance_records',
    'ACCEPTED. Anon holds table-level SELECT (Supabase default grant); the '
    || '"Attendees can view their own attendance record" policy lists role '
    || 'public, which is what INV2 detects as reachable. qual is '
    || 'ea.user_id = auth.uid() via a join to event_attendees; for anon, '
    || 'auth.uid() is NULL, so the policy admits zero rows in practice. Same '
    || 'owner-scoped-via-auth.uid() pattern as workspaces.',
    'BD427', now()
  ),
  (
    'workspace_relationships',
    'ACCEPTED. Anon holds table-level SELECT; the sole policy is an ALL policy '
    || 'scoped to w.owner_user_id = auth.uid() via a join to workspaces. '
    || 'Auth.uid() is NULL for anon, zero rows admitted in practice. Same '
    || 'pattern as workspaces itself.',
    'BD427', now()
  ),
  (
    'event_engagement_roles',
    'ACCEPTED. SELECT policy admits published+public events with no auth.uid() '
    || 'check, genuinely reachable by anon for a published public event, not '
    || 'merely null-safe. Accepted on content grounds, not structural grounds: '
    || 'the only column exposed is a role label '
    || '(sponsor/partner/vendor/exhibitor/volunteer/speaker/team_member), the '
    || 'same category of information as a public event''s title or host, which '
    || 'is already public. No credential, no contact detail, no linkage to '
    || 'private data.',
    'BD427', now()
  ),
  (
    'event_engagements',
    'ACCEPTED, same grounds as event_engagement_roles. SELECT policy admits '
    || 'published+public events with no auth.uid() check. Columns exposed are '
    || 'event_id and party_id linkage only, no descriptive or sensitive content '
    || 'of their own.',
    'BD427', now()
  ),
  (
    'parties',
    'ACCEPTED, same grounds as event_engagement_roles. SELECT policy admits '
    || 'published+public events with no auth.uid() check. Columns exposed are '
    || 'type, name, and linked_profile_id for a Party engaged with a public '
    || 'event, equivalent to a conference site publicly listing its sponsors '
    || 'and speakers by name. linked_profile_id is a UUID only; it does not '
    || 'itself expose profile content, which is gated by profiles'' own '
    || 'separate RLS.',
    'BD427', now()
  )
ON CONFLICT (relname) DO UPDATE
  SET disposition = EXCLUDED.disposition,
      ruled_by    = EXCLUDED.ruled_by,
      ruled_at    = EXCLUDED.ruled_at;
