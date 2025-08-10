-- Enable RLS on event-related tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registration_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_blasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- EVENTS POLICIES
-- Public events can be read by anyone
CREATE POLICY "events_public_read"
ON events FOR SELECT
USING (visibility = 'public');

-- Members can read public events, member events (if they're authenticated), and their own events
CREATE POLICY "events_member_read"
ON events FOR SELECT
USING (
  visibility = 'public'
  OR (visibility = 'members' AND auth.uid() IS NOT NULL)
  OR created_by = auth.uid()
);

-- Event owners can manage their own events
CREATE POLICY "events_owner_write"
ON events FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- TICKET TYPES POLICIES
-- Read ticket types if event is readable
CREATE POLICY "ticket_types_read"
ON event_ticket_types FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND (e.visibility = 'public' OR e.created_by = auth.uid())
  )
);

-- Only event owners can manage ticket types
CREATE POLICY "ticket_types_owner_write"
ON event_ticket_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- REGISTRATION QUESTIONS POLICIES
-- Read questions if event is readable
CREATE POLICY "questions_read"
ON event_registration_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND (e.visibility = 'public' OR e.created_by = auth.uid())
  )
);

-- Only event owners can manage registration questions
CREATE POLICY "questions_owner_write"
ON event_registration_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- EVENT REGISTRATIONS POLICIES
-- Users can see their own registrations; event hosts can see all registrations for their events
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

-- Users can register themselves for events
CREATE POLICY "registrations_insert_self"
ON event_registrations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Event hosts can update registrations for their events
CREATE POLICY "registrations_update_host"
ON event_registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- Users can cancel their own registrations
CREATE POLICY "registrations_delete_self"
ON event_registrations FOR DELETE
USING (user_id = auth.uid());

-- EVENT CHECKINS POLICIES
-- Only event hosts can manage checkins
CREATE POLICY "checkins_host_manage"
ON event_checkins FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM event_registrations r 
    JOIN events e ON e.id = r.event_id
    WHERE r.id = registration_id 
    AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_registrations r 
    JOIN events e ON e.id = r.event_id
    WHERE r.id = registration_id 
    AND e.created_by = auth.uid()
  )
);

-- EVENT BLASTS POLICIES
-- Only event hosts can manage email blasts
CREATE POLICY "blasts_host_manage"
ON event_blasts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- EVENT ANALYTICS POLICIES
-- Event hosts can view and insert analytics; public can insert for tracking
CREATE POLICY "analytics_host_read"
ON event_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- Allow public analytics insertion for tracking (e.g., page views)
CREATE POLICY "analytics_public_insert"
ON event_analytics FOR INSERT
WITH CHECK (true);

-- EVENT WAITLIST POLICIES (if needed)
-- Users can add themselves to waitlist
CREATE POLICY "waitlist_insert_self"
ON event_waitlist FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can view their own waitlist position; hosts can view all
CREATE POLICY "waitlist_read_self_or_host"
ON event_waitlist FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

-- Users can remove themselves; hosts can manage waitlist
CREATE POLICY "waitlist_delete_self_or_host"
ON event_waitlist FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);