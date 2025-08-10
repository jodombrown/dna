-- Align Stripe columns and uniqueness, add holds table with RLS

-- 1) Add Stripe columns if missing
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- 2) Unique partial indexes for Stripe identifiers (allow many NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_event_reg_stripe_session
  ON public.event_registrations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_event_reg_stripe_pi
  ON public.event_registrations (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- 3) Prevent duplicate seat for same user/ticket once registered
CREATE UNIQUE INDEX IF NOT EXISTS uniq_event_user_ticket_registered
  ON public.event_registrations (event_id, user_id, ticket_type_id)
  WHERE status = 'registered';

-- 4) Optional: short-lived inventory holds table
CREATE TABLE IF NOT EXISTS public.event_ticket_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES public.event_ticket_types(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and add minimal policies for user-owned holds
ALTER TABLE public.event_ticket_holds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_ticket_holds' AND policyname='holds_select_own'
  ) THEN
    CREATE POLICY "holds_select_own" ON public.event_ticket_holds
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_ticket_holds' AND policyname='holds_insert_own'
  ) THEN
    CREATE POLICY "holds_insert_own" ON public.event_ticket_holds
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_ticket_holds' AND policyname='holds_update_own'
  ) THEN
    CREATE POLICY "holds_update_own" ON public.event_ticket_holds
      FOR UPDATE USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_ticket_holds' AND policyname='holds_delete_own'
  ) THEN
    CREATE POLICY "holds_delete_own" ON public.event_ticket_holds
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END$$;

-- Helpful indexes for holds management/cleanup
CREATE INDEX IF NOT EXISTS idx_event_ticket_holds_expires_at ON public.event_ticket_holds (expires_at);
CREATE INDEX IF NOT EXISTS idx_event_ticket_holds_event_ticket ON public.event_ticket_holds (event_id, ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_event_ticket_holds_user ON public.event_ticket_holds (user_id);