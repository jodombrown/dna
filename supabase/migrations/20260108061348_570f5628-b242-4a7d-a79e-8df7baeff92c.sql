-- Fix get_event_details return type to match actual column types (NUMERIC for lat/lng)

DROP FUNCTION IF EXISTS get_event_details(UUID, UUID);

CREATE FUNCTION get_event_details(
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
  event_type TEXT,
  format TEXT,
  location_name TEXT,
  location_address TEXT,
  location_city TEXT,
  location_country TEXT,
  location_lat NUMERIC(10,8),
  location_lng NUMERIC(11,8),
  meeting_url TEXT,
  meeting_platform TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  timezone TEXT,
  max_attendees INTEGER,
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
  user_rsvp_status TEXT,
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
    e.event_type::TEXT,
    e.format::TEXT,
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
    (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status IN ('going', 'maybe')) as attendee_count,
    (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'going') as going_count,
    (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'maybe') as maybe_count,
    (SELECT ea.status::TEXT FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = p_user_id LIMIT 1) as user_rsvp_status,
    (e.organizer_id = p_user_id) as is_organizer,
    (e.organizer_id = p_user_id) as can_edit
  FROM events e
  INNER JOIN profiles p ON e.organizer_id = p.id
  WHERE e.id = p_event_id
    AND (
      e.is_public = true OR
      e.organizer_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM event_attendees ea2
        WHERE ea2.event_id = e.id AND ea2.user_id = p_user_id
      )
    );
END;
$$;

COMMENT ON FUNCTION get_event_details(UUID, UUID) IS 
'Returns detailed event information including organizer details and attendee counts. Uses table aliases (ea) in subqueries to avoid ambiguous column reference errors.';