-- DNA CONVENE Part 1: Event System Architecture Migration
-- This migration adds ticketing, roles, promo codes, and enhanced event fields

-- ============================================
-- STEP 1: Add new columns to events table
-- ============================================
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
ADD COLUMN IF NOT EXISTS speakers JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- STEP 2: Add new columns to event_attendees
-- ============================================
ALTER TABLE public.event_attendees
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS qr_code_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';

-- Create index for QR code lookups
CREATE INDEX IF NOT EXISTS idx_event_attendees_qr_token ON public.event_attendees(qr_code_token);

-- ============================================
-- STEP 3: Create event_roles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'co_host', 'moderator', 'speaker', 'volunteer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id, role)
);

ALTER TABLE public.event_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event roles for public events"
  ON public.event_roles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id AND (e.visibility = 'public' OR e.organizer_id = auth.uid())
  ));

CREATE POLICY "Organizers can manage event roles"
  ON public.event_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id AND e.organizer_id = auth.uid()
  ));

-- ============================================
-- STEP 4: Create event_tickets table
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  quantity_total INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tickets for public events"
  ON public.event_tickets FOR SELECT
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id AND e.visibility = 'public'
  ));

CREATE POLICY "Organizers can manage tickets"
  ON public.event_tickets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id AND e.organizer_id = auth.uid()
  ));

-- ============================================
-- STEP 5: Create event_promo_codes table
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, code)
);

ALTER TABLE public.event_promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage promo codes"
  ON public.event_promo_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id AND e.organizer_id = auth.uid()
  ));

-- ============================================
-- STEP 6: Create platform_fees table
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'tiered')),
  value NUMERIC NOT NULL,
  min_amount INTEGER,
  max_amount INTEGER,
  applies_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active platform fees"
  ON public.platform_fees FOR SELECT
  USING (is_active = true);

-- Insert default platform fee (2.5%)
INSERT INTO public.platform_fees (name, fee_type, value, applies_to)
VALUES ('Standard Platform Fee', 'percentage', 2.5, 'all')
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 7: Create validate_promo_code function
-- ============================================
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  p_event_id UUID,
  p_code TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
BEGIN
  SELECT * INTO v_promo
  FROM public.event_promo_codes
  WHERE event_id = p_event_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Invalid promo code';
    RETURN;
  END IF;

  IF v_promo.valid_from IS NOT NULL AND now() < v_promo.valid_from THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Promo code not yet active';
    RETURN;
  END IF;

  IF v_promo.valid_until IS NOT NULL AND now() > v_promo.valid_until THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Promo code has expired';
    RETURN;
  END IF;

  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Promo code usage limit reached';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_promo.discount_type, v_promo.discount_value, NULL::TEXT;
END;
$$;

-- ============================================
-- STEP 8: Create check_event_permission function
-- ============================================
CREATE OR REPLACE FUNCTION public.check_event_permission(
  p_event_id UUID,
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_organizer BOOLEAN;
  v_role RECORD;
BEGIN
  -- Check if user is the organizer
  SELECT EXISTS(
    SELECT 1 FROM public.events 
    WHERE id = p_event_id AND organizer_id = p_user_id
  ) INTO v_is_organizer;

  IF v_is_organizer THEN
    RETURN true;
  END IF;

  -- Check role-based permissions
  SELECT * INTO v_role
  FROM public.event_roles
  WHERE event_id = p_event_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Co-hosts have full permissions
  IF v_role.role = 'co_host' THEN
    RETURN true;
  END IF;

  -- Check specific permission in JSONB
  RETURN COALESCE((v_role.permissions->>p_permission)::boolean, false);
END;
$$;

-- ============================================
-- STEP 9: Create generate_ticket_number function
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: DNA-XXXXXX (6 alphanumeric chars)
    v_ticket_number := 'DNA-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    
    -- Check if exists in event_attendees
    SELECT EXISTS(
      SELECT 1 FROM public.event_attendees WHERE qr_code_token = v_ticket_number
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_ticket_number;
END;
$$;

-- ============================================
-- STEP 10: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_tickets_event_id ON public.event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_roles_event_id ON public.event_roles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_roles_user_id ON public.event_roles(user_id);