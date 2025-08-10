-- Payments hardening: add Stripe tracking columns and guard against duplicate active seats
-- 1) Add columns to store Stripe IDs (idempotent)
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- 2) Prevent duplicate active registration per user/ticket/event
--    Align with current statuses used in app ('registered','pending','waitlist')
CREATE UNIQUE INDEX IF NOT EXISTS uniq_event_user_ticket_active
  ON public.event_registrations(event_id, user_id, ticket_type_id)
  WHERE status IN ('registered','pending','waitlist');