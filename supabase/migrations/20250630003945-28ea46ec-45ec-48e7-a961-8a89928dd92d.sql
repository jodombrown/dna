
-- Check if RLS policies exist for events table and create/update them
-- Allow authenticated users to insert events
DROP POLICY IF EXISTS "Users can create events" ON public.events;
CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to view all events
DROP POLICY IF EXISTS "Users can view events" ON public.events;
CREATE POLICY "Users can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Allow event creators to update their own events
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Allow event creators to delete their own events  
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
