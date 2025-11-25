-- DNA FEED | Fix duplicate get_universal_feed signatures
-- Lockdown v1.1: ensure a single canonical universal feed function

-- Drop legacy version without cursor parameter
DROP FUNCTION IF EXISTS public.get_universal_feed(
  uuid,        -- p_viewer_id
  text,        -- p_tab
  uuid,        -- p_author_id
  uuid,        -- p_space_id
  uuid,        -- p_event_id
  integer,     -- p_limit
  integer,     -- p_offset
  text         -- p_ranking_mode
);

-- NOTE: We intentionally do NOT touch the newer version
-- with signature (uuid, text, uuid, uuid, uuid, integer, integer, timestamptz, text)
-- which powers the current Universal Feed v1.1+.