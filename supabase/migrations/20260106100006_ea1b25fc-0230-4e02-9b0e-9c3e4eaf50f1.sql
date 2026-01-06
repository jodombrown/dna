-- =====================================================
-- MIGRATION 006: Create event_tickets table
-- Purpose: Individual ticket records with QR codes
-- Note: Stripe doesn't track individual tickets
-- =====================================================

CREATE TABLE IF NOT EXISTS event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id),
  order_id UUID REFERENCES event_orders(id),
  attendee_id UUID REFERENCES event_attendees(id),

  -- Owner (can be different from purchaser after transfer)
  owner_user_id UUID REFERENCES profiles(id),
  owner_email TEXT NOT NULL,
  owner_name TEXT,

  -- Ticket identifiers
  ticket_number TEXT UNIQUE NOT NULL,  -- Human-readable: TKT-ABC123-001
  qr_code_data TEXT UNIQUE NOT NULL,   -- For scanning: dna:ticket:TKT-ABC123:uuid

  -- Payment info snapshot (from order at time of purchase)
  price_paid_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'valid' CHECK (status IN (
    'valid',       -- Can be used
    'used',        -- Already checked in
    'cancelled',   -- Cancelled by organizer or user
    'refunded',    -- Payment refunded
    'transferred', -- Transferred to someone else (this record is historical)
    'expired'      -- Event passed without use
  )),

  -- Check-in
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),

  -- Transfer tracking
  original_owner_id UUID REFERENCES profiles(id),
  transferred_at TIMESTAMPTZ,
  transfer_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON event_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON event_tickets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON event_tickets(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON event_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON event_tickets(status);

-- RLS Policies
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
DROP POLICY IF EXISTS "Users can view their tickets" ON event_tickets;
CREATE POLICY "Users can view their tickets" ON event_tickets
  FOR SELECT USING (owner_user_id = auth.uid());

-- Event team can view all tickets for their events
DROP POLICY IF EXISTS "Event team can view tickets" ON event_tickets;
CREATE POLICY "Event team can view tickets" ON event_tickets
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()) OR
    event_id IN (SELECT event_id FROM event_roles WHERE user_id = auth.uid() AND status = 'active')
  );

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number(p_event_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  -- Get event slug prefix
  SELECT UPPER(SUBSTRING(COALESCE(slug, id::text), 1, 6)) INTO v_slug FROM events WHERE id = p_event_id;

  -- Get current ticket count for this event
  SELECT COUNT(*) + 1 INTO v_count FROM event_tickets WHERE event_id = p_event_id;

  -- Generate number: TKT-EVTSLG-001
  v_number := 'TKT-' || v_slug || '-' || LPAD(v_count::text, 3, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE event_tickets IS 'Individual tickets with QR codes. Stripe does not track these - we manage ticket lifecycle locally.';
