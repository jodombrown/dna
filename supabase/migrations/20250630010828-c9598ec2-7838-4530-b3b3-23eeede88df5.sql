
-- Update RLS policies to allow admin users to manage all events
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Create new policies that allow admins to manage all events
CREATE POLICY "Users can update events they created or admins can update any" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by OR public.is_admin_user(auth.uid()));

CREATE POLICY "Users can delete events they created or admins can delete any" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = created_by OR public.is_admin_user(auth.uid()));

-- Also allow admins to feature/unfeature any event
CREATE POLICY "Admins can feature any event" 
  ON public.events 
  FOR UPDATE 
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
