-- Fix remaining Auth RLS warning for beta_waitlist
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON public.beta_waitlist;

CREATE POLICY "Users can view own waitlist entry" ON public.beta_waitlist
  FOR SELECT USING (email = (SELECT auth.email()));