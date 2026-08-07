-- Fix L3 (part 1) from the 2026-08-07 codebase bug audit:
-- send-connection-request checked for an existing connection, then inserted
-- a new one, as two separate round trips (check-then-act) with no
-- constraint enforcing uniqueness in between — concurrent requests (a
-- double-click, or two rapid calls) could both pass the "no existing
-- connection" check and each insert a row, creating duplicate connections
-- between the same two users.
--
-- Fix: a unique index on the unordered pair (LEAST/GREATEST of the two
-- user ids) makes the database itself reject a second connection row
-- between the same two users, regardless of direction or status — matching
-- how the application already treats a connection as one relationship
-- between a pair, not two independent per-direction rows (every read in
-- send-connection-request and elsewhere queries
-- `(requester=A,recipient=B) OR (requester=B,recipient=A)` as a single
-- match). The edge function now catches the resulting unique-violation
-- (23505) and returns the same friendly "already pending/connected"
-- response it already returns for the non-racy case.
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding L3.

-- Defensive pre-cleanup: bidirectional duplicate rows (A->B and B->A both
-- present) may already exist, since no constraint has ever prevented that
-- specific case (only exact same-direction duplicates were caught by an
-- earlier `UNIQUE (requester_id, recipient_id)` constraint on some
-- deployments). Keep one row per unordered pair — preferring an 'accepted'
-- row over any other status, then the earliest created — and remove the
-- rest, so the index below can be created without failing on existing data.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id)
      ORDER BY (status = 'accepted') DESC, created_at ASC
    ) AS rn
  FROM public.connections
)
DELETE FROM public.connections
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique_pair
  ON public.connections (LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id));
