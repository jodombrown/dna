-- Create enum for contribution offer status
CREATE TYPE contribution_offer_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- Create contribution_offers table
CREATE TABLE public.contribution_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.contribution_needs(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  message TEXT NOT NULL,
  offered_amount NUMERIC,
  offered_currency TEXT,
  status contribution_offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_contribution_offers_need_id ON public.contribution_offers(need_id);
CREATE INDEX idx_contribution_offers_space_id ON public.contribution_offers(space_id);
CREATE INDEX idx_contribution_offers_created_by ON public.contribution_offers(created_by);
CREATE INDEX idx_contribution_offers_status ON public.contribution_offers(status);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_contribution_offers_updated_at
  BEFORE UPDATE ON public.contribution_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spaces_updated_at();

-- Enable RLS
ALTER TABLE public.contribution_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT
-- Offer creators can see their own offers
-- Space leads can see all offers for needs in their spaces
CREATE POLICY "Users can view their own offers or space leads can view all"
  ON public.contribution_offers
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = contribution_offers.space_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'lead'
    )
  );

-- RLS Policy: INSERT
-- Any authenticated user can create offers
CREATE POLICY "Authenticated users can create offers"
  ON public.contribution_offers
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- RLS Policy: UPDATE
-- Creators can edit their pending offers
-- Space leads can change status
CREATE POLICY "Creators can update pending offers, leads can change status"
  ON public.contribution_offers
  FOR UPDATE
  USING (
    (created_by = auth.uid() AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = contribution_offers.space_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'lead'
    )
  );

-- RLS Policy: DELETE
-- Creators can delete pending offers
CREATE POLICY "Creators can delete pending offers"
  ON public.contribution_offers
  FOR DELETE
  USING (
    created_by = auth.uid()
    AND status = 'pending'
  );

-- Function to log offer events
CREATE OR REPLACE FUNCTION public.log_offer_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.analytics_events (
      event_name,
      user_id,
      event_metadata
    ) VALUES (
      'offer_created',
      NEW.created_by,
      jsonb_build_object(
        'offer_id', NEW.id,
        'need_id', NEW.need_id,
        'space_id', NEW.space_id
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.analytics_events (
      event_name,
      user_id,
      event_metadata
    ) VALUES (
      'offer_status_changed',
      auth.uid(),
      jsonb_build_object(
        'offer_id', NEW.id,
        'need_id', NEW.need_id,
        'space_id', NEW.space_id,
        'from_status', OLD.status,
        'to_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for offer event logging
CREATE TRIGGER log_contribution_offer_events
  AFTER INSERT OR UPDATE ON public.contribution_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_offer_event();