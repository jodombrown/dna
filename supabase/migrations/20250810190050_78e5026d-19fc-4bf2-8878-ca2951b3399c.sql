-- Only add missing policies for events table
-- The events_public_read policy already exists, so we'll add the member read policy

CREATE POLICY "events_member_access"
ON events FOR SELECT
USING (
  visibility = 'public'
  OR (visibility = 'members' AND auth.uid() IS NOT NULL)
  OR created_by = auth.uid()
);

-- Update existing event registration policies to be more specific
-- Drop and recreate the generic event registration policies with better names

DROP POLICY IF EXISTS "Event registrations read access" ON event_registrations;
DROP POLICY IF EXISTS "Users can create their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON event_registrations;

-- Create new specific policies for event registrations
CREATE POLICY "registrations_read_self_or_host"
ON event_registrations FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

CREATE POLICY "registrations_insert_self"
ON event_registrations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "registrations_update_host"
ON event_registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

CREATE POLICY "registrations_delete_self"
ON event_registrations FOR DELETE
USING (user_id = auth.uid());