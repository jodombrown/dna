-- Fix infinite recursion in events table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can view public events" ON events;
DROP POLICY IF EXISTS "Users can view events they organize" ON events;
DROP POLICY IF EXISTS "Users can view events they're registered for" ON events;
DROP POLICY IF EXISTS "Organizers can update their events" ON events;
DROP POLICY IF EXISTS "Organizers can delete their events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;

-- Create non-recursive policies
CREATE POLICY "Public events are viewable by everyone"
ON events FOR SELECT
USING (
  is_cancelled = false 
  AND is_public = true
);

CREATE POLICY "Organizers can view their own events"
ON events FOR SELECT
USING (auth.uid() = organizer_id);

CREATE POLICY "Users can view events they registered for"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_attendees
    WHERE event_attendees.event_id = events.id
    AND event_attendees.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events"
ON events FOR UPDATE
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
ON events FOR DELETE
USING (auth.uid() = organizer_id);