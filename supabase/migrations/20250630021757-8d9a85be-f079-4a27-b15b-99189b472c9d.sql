
-- Consolidate the two UPDATE policies into one comprehensive policy
-- This fixes the multiple permissive policies warning

DROP POLICY IF EXISTS "Admins can feature any event" ON public.events;
DROP POLICY IF EXISTS "Users can update events they created or admins can update any" ON public.events;

-- Create a single consolidated UPDATE policy that handles both user updates and admin featuring
CREATE POLICY "Users and admins can update events" 
  ON public.events 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())))
  WITH CHECK ((SELECT auth.uid()) = created_by OR public.is_admin_user((SELECT auth.uid())));
