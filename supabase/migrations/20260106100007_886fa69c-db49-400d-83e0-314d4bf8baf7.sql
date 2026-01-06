-- =====================================================
-- MIGRATION 007: Create event_promo_codes table
-- Purpose: Event-specific discount codes
-- Note: Stripe Coupons are account-wide, we need event-specific
-- =====================================================

CREATE TABLE IF NOT EXISTS event_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Code (what users type)
  code TEXT NOT NULL,

  -- Discount type
  discount_type TEXT NOT NULL CHECK (discount_type IN (
    'percentage',    -- X% off
    'fixed_amount',  -- $X off
    'free'           -- 100% off
  )),
  discount_value INTEGER NOT NULL,  -- Percentage (0-100) or cents

  -- Restrictions
  applicable_ticket_types UUID[] DEFAULT '{}',  -- Empty = all types
  min_order_cents INTEGER,           -- Minimum order to apply
  max_discount_cents INTEGER,        -- Cap on discount amount

  -- Usage limits
  usage_limit INTEGER,               -- NULL = unlimited total uses
  usage_count INTEGER DEFAULT 0,     -- Current usage
  usage_limit_per_user INTEGER DEFAULT 1,  -- Per user limit

  -- Validity window
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- Special: reveal hidden ticket types
  reveals_ticket_types UUID[] DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Unique code per event
  UNIQUE(event_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_event ON event_promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON event_promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON event_promo_codes(is_active);

-- RLS Policies
ALTER TABLE event_promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can validate a promo code (for checkout)
DROP POLICY IF EXISTS "Anyone can validate promo codes" ON event_promo_codes;
CREATE POLICY "Anyone can validate promo codes" ON event_promo_codes
  FOR SELECT USING (true);

-- Only event team can manage promo codes
DROP POLICY IF EXISTS "Event team can manage promo codes" ON event_promo_codes;
CREATE POLICY "Event team can manage promo codes" ON event_promo_codes
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()) OR
    event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND role IN ('owner', 'cohost', 'manager') AND status = 'active')
  );

-- Function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_event_id UUID,
  p_code TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  promo_id UUID,
  discount_type TEXT,
  discount_value INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_promo RECORD;
  v_user_usage INTEGER;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM event_promo_codes
  WHERE event_id = p_event_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'Invalid promo code';
    RETURN;
  END IF;

  -- Check validity window
  IF v_promo.valid_from IS NOT NULL AND NOW() < v_promo.valid_from THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'Promo code not yet active';
    RETURN;
  END IF;

  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'Promo code has expired';
    RETURN;
  END IF;

  -- Check total usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'Promo code usage limit reached';
    RETURN;
  END IF;

  -- Check per-user limit (if user provided)
  IF p_user_id IS NOT NULL AND v_promo.usage_limit_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage
    FROM event_orders
    WHERE promo_code_id = v_promo.id AND user_id = p_user_id;

    IF v_user_usage >= v_promo.usage_limit_per_user THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'You have already used this promo code';
      RETURN;
    END IF;
  END IF;

  -- Valid!
  RETURN QUERY SELECT
    true,
    v_promo.id,
    v_promo.discount_type,
    v_promo.discount_value,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE event_promo_codes IS 'Event-specific discount codes. Validated locally before creating Stripe checkout session.';
