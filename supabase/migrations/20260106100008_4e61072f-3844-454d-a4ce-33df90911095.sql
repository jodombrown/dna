-- =====================================================
-- MIGRATION 008: Create platform_fees table
-- Purpose: Track DNA revenue from ticket sales
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES event_orders(id),
  event_id UUID NOT NULL REFERENCES events(id),

  -- Fee details
  fee_cents INTEGER NOT NULL,
  fee_percentage NUMERIC(5,2) NOT NULL,  -- e.g., 5.00 for 5%
  currency TEXT NOT NULL,

  -- Context
  user_tier TEXT NOT NULL,  -- 'free', 'pro', 'org' - determines fee rate

  -- Status (in case of refunds)
  status TEXT DEFAULT 'collected' CHECK (status IN ('collected', 'refunded', 'disputed')),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_fees_order ON platform_fees(order_id);
CREATE INDEX IF NOT EXISTS idx_platform_fees_event ON platform_fees(event_id);
CREATE INDEX IF NOT EXISTS idx_platform_fees_created ON platform_fees(created_at);

-- RLS: Only system can write, admins can read
ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON platform_fees;
CREATE POLICY "Service role only" ON platform_fees
  FOR ALL USING (false);

COMMENT ON TABLE platform_fees IS 'DNA platform revenue tracking. One record per order.';
