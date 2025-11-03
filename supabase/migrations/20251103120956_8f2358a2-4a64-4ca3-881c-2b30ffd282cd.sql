
-- Drop the problematic SELECT policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view accessible events" ON public.events;

-- Recreate the SELECT policy without circular reference
CREATE POLICY "Users can view accessible events" 
ON public.events 
FOR SELECT 
TO public
USING (
  is_public = true 
  OR organizer_id = auth.uid()
  OR auth.uid() IN (
    SELECT user_id 
    FROM event_attendees 
    WHERE event_id = id
  )
);
