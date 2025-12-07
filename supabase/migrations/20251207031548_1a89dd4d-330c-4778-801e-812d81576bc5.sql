-- Fix beta_waitlist SELECT policy to prevent email enumeration
-- The issue: auth.email() could return null, allowing unintended access

DROP POLICY IF EXISTS "Users can view waitlist entries" ON public.beta_waitlist;

CREATE POLICY "Users can view waitlist entries"
ON public.beta_waitlist
FOR SELECT
USING (
  -- Admins can see all entries
  has_role((SELECT auth.uid()), 'admin'::app_role)
  OR (
    -- Users can only see their own entry IF they are authenticated AND email matches
    (SELECT auth.uid()) IS NOT NULL 
    AND (SELECT auth.email()) IS NOT NULL 
    AND email = (SELECT auth.email())
  )
);