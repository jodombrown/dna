-- BD434. Disposable-domain blocking and IP-pattern flagging for the
-- guest-rsvp edge function, plus the admin-visibility table both signals
-- write to. Read-only for admins; writes come only from the service role
-- (the edge function), same shape as sponsor_logo_audit_log.

CREATE TABLE IF NOT EXISTS public.signup_abuse_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'flagged')),
  email_domain TEXT,
  email_hash TEXT,
  ip_address TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.signup_abuse_signals TO authenticated;
GRANT ALL ON public.signup_abuse_signals TO service_role;

ALTER TABLE public.signup_abuse_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read signup abuse signals"
  ON public.signup_abuse_signals
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS signup_abuse_signals_created_at_idx
  ON public.signup_abuse_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS signup_abuse_signals_ip_created_at_idx
  ON public.signup_abuse_signals (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS signup_abuse_signals_source_action_idx
  ON public.signup_abuse_signals (source, action);
