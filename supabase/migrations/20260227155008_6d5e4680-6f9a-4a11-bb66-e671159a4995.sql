
-- Add is_published column for Draft event status (PRD-C)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

-- Comment for clarity
COMMENT ON COLUMN public.events.is_published IS 'Whether the event is published and visible to attendees. false = draft.';
