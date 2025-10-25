-- =====================================================
-- EVENT_TYPES ENUM
-- =====================================================
CREATE TYPE event_type AS ENUM (
  'conference',
  'workshop',
  'meetup',
  'webinar',
  'networking',
  'social',
  'other'
);

CREATE TYPE event_format AS ENUM (
  'in_person',
  'virtual',
  'hybrid'
);

-- =====================================================
-- EVENTS TABLE (New structure)
-- =====================================================
-- First, rename the old events table if it exists
ALTER TABLE IF EXISTS events RENAME TO events_old;

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) > 0 AND length(description) <= 5000),
  event_type event_type NOT NULL,
  format event_format NOT NULL,
  
  -- Location
  location_name TEXT,
  location_address TEXT,
  location_city TEXT,
  location_country TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Virtual details
  meeting_url TEXT,
  meeting_platform TEXT,
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Capacity
  max_attendees INT CHECK (max_attendees IS NULL OR max_attendees > 0),
  
  -- Media
  cover_image_url TEXT,
  
  -- Settings
  is_public BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  allow_guests BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT valid_location CHECK (
    (format = 'virtual' AND meeting_url IS NOT NULL) OR
    (format = 'in_person' AND location_name IS NOT NULL) OR
    (format = 'hybrid' AND meeting_url IS NOT NULL AND location_name IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_events_organizer ON events(organizer_id, created_at DESC);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_format ON events(format);
CREATE INDEX idx_events_location ON events(location_city, location_country);
CREATE INDEX idx_events_public ON events(is_public) WHERE is_public = true;
CREATE INDEX idx_events_cancelled ON events(is_cancelled) WHERE is_cancelled = false;

-- Updated at trigger
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EVENT_ATTENDEES TABLE
-- =====================================================
CREATE TYPE rsvp_status AS ENUM (
  'going',
  'maybe',
  'not_going',
  'pending',
  'waitlist'
);

CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL DEFAULT 'pending',
  response_note TEXT CHECK (length(response_note) <= 500),
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_event_attendee UNIQUE (event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id, status);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id, status);
CREATE INDEX idx_event_attendees_status ON event_attendees(status);

-- Updated at trigger
CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EVENT_COMMENTS TABLE
-- =====================================================
CREATE TABLE event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX idx_event_comments_event ON event_comments(event_id, created_at ASC);
CREATE INDEX idx_event_comments_author ON event_comments(author_id);

-- Updated at trigger
CREATE TRIGGER update_event_comments_updated_at
  BEFORE UPDATE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES - EVENTS
-- =====================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view public events
CREATE POLICY "Anyone can view public events"
  ON events FOR SELECT
  USING (is_public = true AND is_cancelled = false);

-- Users can view their own events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (organizer_id = auth.uid());

-- Users can view events they're invited to or attending
CREATE POLICY "Users can view their invited events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_id = id AND user_id = auth.uid()
    )
  );

-- Users can create events
CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (organizer_id = auth.uid());

-- Users can update their own events
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Users can delete their own events (soft delete)
CREATE POLICY "Users can delete their own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- =====================================================
-- RLS POLICIES - EVENT_ATTENDEES
-- =====================================================
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Users can view attendees of public events
CREATE POLICY "Users can view attendees of public events"
  ON event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.is_public = true
    )
  );

-- Users can view attendees of events they're part of
CREATE POLICY "Users can view attendees of their events"
  ON event_attendees FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
  ON event_attendees FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own RSVP
CREATE POLICY "Users can update their own RSVP"
  ON event_attendees FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Organizers can update attendee status
CREATE POLICY "Organizers can update attendee status"
  ON event_attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Users can delete their own RSVP
CREATE POLICY "Users can delete their own RSVP"
  ON event_attendees FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES - EVENT_COMMENTS
-- =====================================================
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on events they can see
CREATE POLICY "Users can view comments on visible events"
  ON event_comments FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND (
        events.is_public = true OR
        events.organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_attendees.event_id = events.id 
            AND event_attendees.user_id = auth.uid()
        )
      )
    )
  );

-- Users can comment on events they can see
CREATE POLICY "Users can create comments"
  ON event_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND (
        events.is_public = true OR
        events.organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_attendees.event_id = events.id 
            AND event_attendees.user_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON event_comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON event_comments FOR DELETE
  USING (author_id = auth.uid());

-- =====================================================
-- RPC FUNCTION: get_events
-- =====================================================
CREATE OR REPLACE FUNCTION get_events(
  p_user_id UUID,
  p_filter TEXT DEFAULT 'upcoming',
  p_event_type event_type DEFAULT NULL,
  p_format event_format DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  event_id UUID,
  organizer_id UUID,
  organizer_username TEXT,
  organizer_full_name TEXT,
  organizer_avatar_url TEXT,
  title TEXT,
  description TEXT,
  event_type event_type,
  format event_format,
  location_name TEXT,
  location_city TEXT,
  location_country TEXT,
  meeting_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  timezone TEXT,
  max_attendees INT,
  cover_image_url TEXT,
  is_public BOOLEAN,
  requires_approval BOOLEAN,
  created_at TIMESTAMPTZ,
  attendee_count BIGINT,
  user_rsvp_status rsvp_status,
  is_organizer BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.organizer_id,
    p.username as organizer_username,
    p.full_name as organizer_full_name,
    p.avatar_url as organizer_avatar_url,
    e.title,
    e.description,
    e.event_type,
    e.format,
    e.location_name,
    e.location_city,
    e.location_country,
    e.meeting_url,
    e.start_time,
    e.end_time,
    e.timezone,
    e.max_attendees,
    e.cover_image_url,
    e.is_public,
    e.requires_approval,
    e.created_at,
    (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status IN ('going', 'maybe')) as attendee_count,
    (SELECT status FROM event_attendees WHERE event_id = e.id AND user_id = p_user_id) as user_rsvp_status,
    (e.organizer_id = p_user_id) as is_organizer
  FROM events e
  INNER JOIN profiles p ON e.organizer_id = p.id
  WHERE e.is_cancelled = false
    AND (
      (p_filter = 'upcoming' AND e.start_time > now() AND e.is_public = true) OR
      (p_filter = 'past' AND e.end_time < now() AND e.is_public = true) OR
      (p_filter = 'my_events' AND e.organizer_id = p_user_id) OR
      (p_filter = 'attending' AND EXISTS (
        SELECT 1 FROM event_attendees 
        WHERE event_id = e.id 
          AND user_id = p_user_id 
          AND status IN ('going', 'maybe')
      ))
    )
    AND (p_event_type IS NULL OR e.event_type = p_event_type)
    AND (p_format IS NULL OR e.format = p_format)
    AND (p_city IS NULL OR e.location_city ILIKE '%' || p_city || '%')
    AND (p_country IS NULL OR e.location_country ILIKE '%' || p_country || '%')
  ORDER BY e.start_time ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_event_details
-- =====================================================
CREATE OR REPLACE FUNCTION get_event_details(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  event_id UUID,
  organizer_id UUID,
  organizer_username TEXT,
  organizer_full_name TEXT,
  organizer_avatar_url TEXT,
  organizer_headline TEXT,
  title TEXT,
  description TEXT,
  event_type event_type,
  format event_format,
  location_name TEXT,
  location_address TEXT,
  location_city TEXT,
  location_country TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  meeting_url TEXT,
  meeting_platform TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  timezone TEXT,
  max_attendees INT,
  cover_image_url TEXT,
  is_public BOOLEAN,
  requires_approval BOOLEAN,
  allow_guests BOOLEAN,
  is_cancelled BOOLEAN,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  attendee_count BIGINT,
  going_count BIGINT,
  maybe_count BIGINT,
  user_rsvp_status rsvp_status,
  is_organizer BOOLEAN,
  can_edit BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.organizer_id,
    p.username as organizer_username,
    p.full_name as organizer_full_name,
    p.avatar_url as organizer_avatar_url,
    p.headline as organizer_headline,
    e.title,
    e.description,
    e.event_type,
    e.format,
    e.location_name,
    e.location_address,
    e.location_city,
    e.location_country,
    e.location_lat,
    e.location_lng,
    e.meeting_url,
    e.meeting_platform,
    e.start_time,
    e.end_time,
    e.timezone,
    e.max_attendees,
    e.cover_image_url,
    e.is_public,
    e.requires_approval,
    e.allow_guests,
    e.is_cancelled,
    e.cancellation_reason,
    e.created_at,
    e.updated_at,
    (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status IN ('going', 'maybe')) as attendee_count,
    (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status = 'going') as going_count,
    (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status = 'maybe') as maybe_count,
    (SELECT status FROM event_attendees WHERE event_id = e.id AND user_id = p_user_id) as user_rsvp_status,
    (e.organizer_id = p_user_id) as is_organizer,
    (e.organizer_id = p_user_id) as can_edit
  FROM events e
  INNER JOIN profiles p ON e.organizer_id = p.id
  WHERE e.id = p_event_id
    AND (
      e.is_public = true OR
      e.organizer_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM event_attendees
        WHERE event_id = e.id AND user_id = p_user_id
      )
    );
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_event_attendees
-- =====================================================
CREATE OR REPLACE FUNCTION get_event_attendees(
  p_event_id UUID,
  p_status rsvp_status DEFAULT NULL
)
RETURNS TABLE (
  attendee_id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  status rsvp_status,
  response_note TEXT,
  checked_in BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ea.id as attendee_id,
    ea.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline,
    ea.status,
    ea.response_note,
    ea.checked_in,
    ea.created_at
  FROM event_attendees ea
  INNER JOIN profiles p ON ea.user_id = p.id
  WHERE ea.event_id = p_event_id
    AND (p_status IS NULL OR ea.status = p_status)
  ORDER BY ea.created_at DESC;
END;
$$;

-- =====================================================
-- NOTIFICATION TRIGGERS FOR EVENTS
-- =====================================================

-- Trigger: Event invitation (when attendee added)
CREATE OR REPLACE FUNCTION notify_event_invite()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  organizer_id_var UUID;
  organizer_name TEXT;
BEGIN
  SELECT title, organizer_id INTO event_title, organizer_id_var FROM events WHERE id = NEW.event_id;
  SELECT full_name INTO organizer_name FROM profiles WHERE id = organizer_id_var;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    related_user_id,
    related_entity_type,
    related_entity_id
  ) VALUES (
    NEW.user_id,
    'event_invite',
    'Event Invitation',
    organizer_name || ' invited you to ' || event_title,
    '/dna/events/' || NEW.event_id,
    organizer_id_var,
    'event',
    NEW.event_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_event_invite
  AFTER INSERT ON event_attendees
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_event_invite();

-- Trigger: RSVP response
CREATE OR REPLACE FUNCTION notify_event_rsvp()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  event_organizer UUID;
  attendee_name TEXT;
BEGIN
  IF NEW.status IN ('going', 'maybe') AND OLD.status != NEW.status THEN
    SELECT title, organizer_id INTO event_title, event_organizer 
    FROM events WHERE id = NEW.event_id;
    
    SELECT full_name INTO attendee_name FROM profiles WHERE id = NEW.user_id;

    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      related_user_id,
      related_entity_type,
      related_entity_id
    ) VALUES (
      event_organizer,
      'event_rsvp',
      'New RSVP',
      attendee_name || ' is ' || NEW.status || ' for ' || event_title,
      '/dna/events/' || NEW.event_id,
      NEW.user_id,
      'event',
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_event_rsvp
  AFTER UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_rsvp();

-- Enable realtime for event tables
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;