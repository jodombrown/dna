-- =====================================================
-- MIGRATION 001: Add new columns to events table
-- Run: Safe to run on existing data
-- =====================================================

-- Short description for cards/sharing
ALTER TABLE events
ADD COLUMN IF NOT EXISTS short_description TEXT
CHECK (char_length(short_description) <= 280);

-- Venue instructions
ALTER TABLE events
ADD COLUMN IF NOT EXISTS venue_instructions TEXT;

-- Virtual URL visibility control
ALTER TABLE events
ADD COLUMN IF NOT EXISTS virtual_url_visibility TEXT
DEFAULT 'on_rsvp'
CHECK (virtual_url_visibility IN ('public', 'on_rsvp', 'on_checkin', 'hidden'));

-- Doors open time (separate from start)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS doors_open_time TIMESTAMPTZ;

-- Recurrence for event series
ALTER TABLE events
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;
ALTER TABLE events
ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id);

-- Media
ALTER TABLE events
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE events
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Rich content arrays
ALTER TABLE events
ADD COLUMN IF NOT EXISTS speakers JSONB DEFAULT '[]';
-- Structure: [{name, title, bio, image_url, profile_id}]

ALTER TABLE events
ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]';
-- Structure: [{name, tier, logo_url, url}]

ALTER TABLE events
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';
-- Structure: [{question, answer}]

-- Visibility (more granular than is_public boolean)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS visibility TEXT
DEFAULT 'public'
CHECK (visibility IN ('public', 'unlisted', 'private', 'invite_only'));

-- Guest limits
ALTER TABLE events
ADD COLUMN IF NOT EXISTS max_guests_per_rsvp INTEGER DEFAULT 1;

-- Age restriction
ALTER TABLE events
ADD COLUMN IF NOT EXISTS age_restriction TEXT
CHECK (age_restriction IN ('all_ages', '18+', '21+'));

-- Registration deadline
ALTER TABLE events
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;

-- Event lifecycle status
ALTER TABLE events
ADD COLUMN IF NOT EXISTS status TEXT
DEFAULT 'published'
CHECK (status IN ('draft', 'published', 'cancelled', 'postponed', 'completed'));

-- Status timestamps
ALTER TABLE events
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE events
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Five C's integration
ALTER TABLE events
ADD COLUMN IF NOT EXISTS collaborate_space_id UUID;
ALTER TABLE events
ADD COLUMN IF NOT EXISTS contribute_campaign_id UUID;

-- Migrate existing is_cancelled to status
UPDATE events SET status = 'cancelled' WHERE is_cancelled = true AND status = 'published';

-- Add constraint for doors_open_time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_doors_time'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT valid_doors_time
    CHECK (doors_open_time IS NULL OR doors_open_time <= start_time);
  END IF;
END $$;

-- Add constraint for registration deadline
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_registration_deadline'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT valid_registration_deadline
    CHECK (registration_deadline IS NULL OR registration_deadline <= start_time);
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_parent ON events(parent_event_id);

COMMENT ON COLUMN events.virtual_url_visibility IS 'When to show meeting URL: public (always), on_rsvp (after RSVP), on_checkin (after check-in), hidden (never auto-show)';
COMMENT ON COLUMN events.status IS 'Event lifecycle: draft (not visible), published (live), cancelled, postponed, completed';
