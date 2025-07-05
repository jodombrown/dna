-- Fix auth RLS performance issues for events table policies
-- Drop existing policies that are causing performance warnings
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- Recreate policies with optimized auth calls to prevent re-evaluation per row
CREATE POLICY "Users can update own events" 
  ON public.events 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can delete own events" 
  ON public.events 
  FOR DELETE 
  USING ((SELECT auth.uid()) = created_by);