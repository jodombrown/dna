-- Fix M2 from the 2026-08-07 codebase bug audit: is_signup_approved(p_email)
-- is a SECURITY DEFINER function granted to `anon` (it has to be — it's
-- called from the pre-signup gate, before the caller has an account) with
-- no rate limiting, letting anyone enumerate which email addresses are on
-- the approved beta waitlist by brute-forcing the RPC.
--
-- This is a best-effort mitigation, not a hard boundary: the endpoint's
-- purpose requires anon access, and `x-forwarded-for` can be absent or
-- spoofed outside Supabase's own proxy. It raises the cost of casual mass
-- enumeration without breaking the legitimate one-check-per-signup flow.
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding M2.

CREATE TABLE IF NOT EXISTS public.signup_approval_check_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_approval_check_attempts_ip_created
  ON public.signup_approval_check_attempts (ip_address, created_at);

-- No RLS policies: default-deny for anon/authenticated. Only this
-- SECURITY DEFINER function (owner privileges) ever reads or writes it.
ALTER TABLE public.signup_approval_check_attempts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.signup_approval_check_attempts IS
  'Anti-enumeration throttle for is_signup_approved(). Not user-scoped (the caller has no account yet); tracked by best-effort IP.';

CREATE OR REPLACE FUNCTION public.is_signup_approved(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip text;
  v_recent_count integer;
BEGIN
  BEGIN
    v_ip := (current_setting('request.headers', true)::json ->> 'x-forwarded-for');
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  v_ip := COALESCE(NULLIF(trim(v_ip), ''), 'unknown');

  SELECT count(*) INTO v_recent_count
  FROM public.signup_approval_check_attempts
  WHERE ip_address = v_ip AND created_at > now() - interval '1 hour';

  IF v_recent_count >= 30 THEN
    RAISE EXCEPTION 'Too many requests. Please try again later.';
  END IF;

  INSERT INTO public.signup_approval_check_attempts (ip_address) VALUES (v_ip);

  RETURN EXISTS (
    SELECT 1
    FROM public.beta_waitlist w
    WHERE lower(w.email) = lower(trim(coalesce(p_email, '')))
      AND w.status = 'approved'
      AND w.archived_at IS NULL
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_signup_approved(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_signup_approved(text) TO anon, authenticated;
