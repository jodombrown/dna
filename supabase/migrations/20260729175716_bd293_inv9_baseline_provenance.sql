-- BD293. Recording state ALREADY APPLIED to the live database on 2026-07-29.
-- Idempotent by construction; safe to replay against the live DB as a no-op.
--
-- Part 1: bring INV9's baseline to parity with security_baseline_anon_relations,
-- which already carries disposition/ruled_by/ruled_at. A security baseline whose
-- rows record no reason is a list of exceptions with the justification stripped
-- off, and the next reader cannot tell an accepted risk from an unexamined one.
--
-- Part 2: adopt the single reported INV9 gain WITH its reason attached.
-- profiles.threshold_fields is BD283's consent set. Accepted on exposure grounds:
-- text[] NOT NULL default '{}', anon holds no privilege, empty on all 21 rows,
-- fails closed. The MISSING WRITER is a separate finding, ruled DEFERRED to
-- Arc 3 Directory, recorded on BD293.

ALTER TABLE public.security_baseline_authenticated_reads
  ADD COLUMN IF NOT EXISTS disposition text,
  ADD COLUMN IF NOT EXISTS ruled_by    text,
  ADD COLUMN IF NOT EXISTS ruled_at    timestamptz;

COMMENT ON COLUMN public.security_baseline_authenticated_reads.disposition IS
  'Why this (table,column) is an accepted part of the authenticated read surface. NULL means originally seeded, never individually ruled.';
COMMENT ON COLUMN public.security_baseline_authenticated_reads.ruled_by IS
  'BD or D number carrying the ruling.';

INSERT INTO public.security_baseline_authenticated_reads
  (relname, attname, disposition, ruled_by, ruled_at)
VALUES
  ('profiles', 'threshold_fields',
   'ACCEPTED. BD283 consent set. text[] NOT NULL default {}; anon holds no privilege; empty on all 21 rows; fails closed. WRITER IS MISSING and is ruled DEFERRED to Arc 3 Directory per BD293. Resume trigger: a Member asks to control what a signed-out visitor sees, or Directory surfaces a field needing consent to display.',
   'BD293', now())
ON CONFLICT (relname, attname) DO UPDATE
  SET disposition = EXCLUDED.disposition,
      ruled_by    = EXCLUDED.ruled_by;
