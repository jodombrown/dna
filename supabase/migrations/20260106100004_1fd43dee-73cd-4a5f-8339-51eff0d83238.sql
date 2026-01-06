-- =====================================================
-- MIGRATION 004: Rename event_registrations to event_orders
-- Run: This renames the table, update all code references
-- =====================================================

-- Rename the table
ALTER TABLE IF EXISTS event_registrations RENAME TO event_orders;

-- Rename columns for clarity (if registered_at exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_orders' AND column_name = 'registered_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_orders' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE event_orders RENAME COLUMN registered_at TO created_at;
  END IF;
END $$;

-- Add created_at if it doesn't exist
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add missing columns for proper order tracking
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS purchaser_name TEXT;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS purchaser_phone TEXT;

-- Pricing breakdown
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER DEFAULT 0;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS tax_cents INTEGER DEFAULT 0;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS total_cents INTEGER;

-- Promo code tracking
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS promo_code_id UUID;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

-- Payment status (sync from Stripe webhook)
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS payment_status TEXT
DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'));

ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Stripe references (you already have some, ensure all exist)
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS stripe_receipt_url TEXT;

-- Refund tracking
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS refunded_cents INTEGER DEFAULT 0;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE event_orders
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Update existing data
UPDATE event_orders
SET payment_status = 'completed'
WHERE stripe_payment_intent_id IS NOT NULL AND payment_status = 'pending';

UPDATE event_orders
SET total_cents = price_paid_cents
WHERE total_cents IS NULL AND price_paid_cents IS NOT NULL;

-- Generate order numbers for existing records
UPDATE event_orders
SET order_number = 'ORD-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE order_number IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_event ON event_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON event_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON event_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON event_orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON event_orders(order_number);

COMMENT ON TABLE event_orders IS 'Payment records for ticket purchases. Links to Stripe for payment processing.';
