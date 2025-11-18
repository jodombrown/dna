-- Add is_flagship field to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_flagship BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_events_flagship 
ON events(is_flagship) 
WHERE is_flagship = TRUE;

-- Update RLS policy to allow public read access to flagship events
-- (existing policies already handle this, but adding comment for clarity)
COMMENT ON COLUMN events.is_flagship IS 'Marks official DNA-hosted flagship events that should always be visible';