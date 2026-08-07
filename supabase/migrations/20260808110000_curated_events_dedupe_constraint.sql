-- =============================================
-- Second audit pass: curate-diaspora-events TOCTOU dedup fix
-- =============================================
--
-- curate-diaspora-events read all existing curated (title, start_time)
-- pairs once into an in-memory Set at the start of a run, then inserted
-- any Perplexity-returned event not in that Set. Two overlapping
-- invocations (a manual re-trigger while the cron run is still in
-- flight, or two overlapping cron fires) both read the same "existing"
-- state before either inserts, so both can independently decide the same
-- event is new and insert it twice — a classic check-then-act race with
-- no DB-level guard. There was no UNIQUE constraint covering this key.
--
-- Add a generated, stored dedupe key and a partial unique index on it so
-- the database itself rejects the duplicate insert regardless of how the
-- two runs interleave.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS curated_dedupe_key text
  GENERATED ALWAYS AS (
    CASE
      WHEN is_curated AND title IS NOT NULL AND start_time IS NOT NULL
        THEN lower(btrim(title)) || '|' || to_char(start_time, 'YYYY-MM-DD')
      ELSE NULL
    END
  ) STORED;

-- Defensive: if the race already produced duplicates in production before
-- this constraint existed, a plain CREATE UNIQUE INDEX would fail outright.
-- Keep the earliest copy of each duplicate group and delete the rest.
DELETE FROM public.events e
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY curated_dedupe_key
           ORDER BY created_at ASC, id ASC
         ) AS rn
  FROM public.events
  WHERE curated_dedupe_key IS NOT NULL
) dupes
WHERE e.id = dupes.id
  AND dupes.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_curated_dedupe_key
  ON public.events (curated_dedupe_key)
  WHERE curated_dedupe_key IS NOT NULL;
