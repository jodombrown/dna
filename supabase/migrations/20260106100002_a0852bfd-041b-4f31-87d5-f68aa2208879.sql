-- =====================================================
-- MIGRATION 002: Add new columns to event_attendees
-- Run: Safe to run on existing data
-- =====================================================

-- Guest info for non-DNA-member attendees
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Plus-ones support
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1
CHECK (guest_count >= 1);
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS additional_guests JSONB DEFAULT '[]';
-- Structure: [{name, email}]

-- Link to purchased ticket (if paid event)
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS ticket_id UUID;
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES event_ticket_types(id);

-- Check-in method tracking
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS check_in_method TEXT
CHECK (check_in_method IN ('qr', 'manual', 'self'));
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id);

-- QR code for check-in
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS qr_code_token TEXT UNIQUE
DEFAULT encode(gen_random_bytes(16), 'hex');

-- Source tracking
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS source TEXT
DEFAULT 'direct'
CHECK (source IN ('direct', 'referral', 'share_link', 'embed', 'api', 'import'));
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES profiles(id);

-- UTM tracking for marketing
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Organizer private notes
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS organizer_notes TEXT;

-- Order reference (for paid tickets)
ALTER TABLE event_attendees
ADD COLUMN IF NOT EXISTS order_id UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendees_qr ON event_attendees(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_attendees_source ON event_attendees(source);
CREATE INDEX IF NOT EXISTS idx_attendees_ticket_type ON event_attendees(ticket_type_id);

COMMENT ON COLUMN event_attendees.qr_code_token IS 'Unique token for QR code check-in, auto-generated';
COMMENT ON COLUMN event_attendees.source IS 'How attendee found event: direct, referral, share_link, embed, api, import';
