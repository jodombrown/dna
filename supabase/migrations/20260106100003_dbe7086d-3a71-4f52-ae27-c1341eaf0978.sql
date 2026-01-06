-- =====================================================
-- MIGRATION 003: Add new columns to event_ticket_types
-- Run: Safe to run on existing data
-- =====================================================

-- Currency support (your table has price_cents but no currency)
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'
CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'NGN', 'KES', 'ZAR', 'GHS'));

-- Original price for showing discounts
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS original_price_cents INTEGER;

-- Quantity tracking
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS quantity_sold INTEGER DEFAULT 0;
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS quantity_reserved INTEGER DEFAULT 0;

-- Rename total_tickets to quantity_total for consistency (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_ticket_types' AND column_name = 'total_tickets'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_ticket_types' AND column_name = 'quantity_total'
  ) THEN
    ALTER TABLE event_ticket_types RENAME COLUMN total_tickets TO quantity_total;
  END IF;
END $$;

-- Add quantity_total if it doesn't exist (in case total_tickets didn't exist)
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS quantity_total INTEGER;

-- Order limits
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS min_per_order INTEGER DEFAULT 1;
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS max_per_order INTEGER DEFAULT 10;

-- Visibility (you have 'hidden' boolean, expand to enum)
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS visibility TEXT
DEFAULT 'public'
CHECK (visibility IN ('public', 'hidden', 'promo_only'));

-- Access level for badges/perks
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS access_level TEXT
DEFAULT 'standard'
CHECK (access_level IN ('standard', 'vip', 'premium', 'sponsor', 'speaker', 'staff'));

-- Perks list for display
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS perks TEXT[] DEFAULT '{}';

-- Sort order for display
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Status for lifecycle
ALTER TABLE event_ticket_types
ADD COLUMN IF NOT EXISTS status TEXT
DEFAULT 'active'
CHECK (status IN ('active', 'paused', 'sold_out', 'ended'));

-- Migrate hidden boolean to visibility enum (if hidden column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_ticket_types' AND column_name = 'hidden'
  ) THEN
    UPDATE event_ticket_types
    SET visibility = 'hidden'
    WHERE hidden = true AND visibility = 'public';
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_ticket_types_status ON event_ticket_types(status);

COMMENT ON COLUMN event_ticket_types.visibility IS 'public (shown), hidden (direct link only), promo_only (requires promo code)';
COMMENT ON COLUMN event_ticket_types.access_level IS 'Determines badges and special handling at check-in';
