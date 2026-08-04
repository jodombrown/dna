CREATE OR REPLACE FUNCTION public.is_signup_approved(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.beta_waitlist w
    WHERE lower(w.email) = lower(trim(coalesce(p_email, '')))
      AND w.status = 'approved'
      AND w.archived_at IS NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_signup_approved(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_signup_approved(text) TO anon, authenticated;