-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_status 
  ON public.event_attendees(event_id, status);

CREATE INDEX IF NOT EXISTS idx_event_attendees_checked_in 
  ON public.event_attendees(event_id, checked_in) 
  WHERE checked_in = true;

CREATE INDEX IF NOT EXISTS idx_events_organizer_dates 
  ON public.events(organizer_id, start_time);

-- RPC function to get event analytics
CREATE OR REPLACE FUNCTION public.get_event_analytics(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_organizer_id UUID;
  v_event_start TIMESTAMP WITH TIME ZONE;
  v_event_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get event details
  SELECT organizer_id, start_time, end_time 
  INTO v_organizer_id, v_event_start, v_event_end
  FROM public.events
  WHERE id = p_event_id;

  -- Check if user is organizer or admin
  IF v_organizer_id != auth.uid() THEN
    -- Check if user is admin
    DECLARE
      is_admin BOOLEAN;
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) INTO is_admin;
      
      IF NOT is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Only event organizer or admin can view analytics';
      END IF;
    END;
  END IF;

  -- Build analytics JSON
  SELECT json_build_object(
    'event_id', p_event_id,
    'rsvp_stats', (
      SELECT json_build_object(
        'going', COUNT(*) FILTER (WHERE status = 'going'),
        'maybe', COUNT(*) FILTER (WHERE status = 'maybe'),
        'not_going', COUNT(*) FILTER (WHERE status = 'not_going'),
        'waitlist', COUNT(*) FILTER (WHERE status = 'waitlist'),
        'total', COUNT(*)
      )
      FROM public.event_attendees
      WHERE event_id = p_event_id
    ),
    'checkin_stats', (
      SELECT json_build_object(
        'checked_in', COUNT(*) FILTER (WHERE checked_in = true AND status = 'going'),
        'going_count', COUNT(*) FILTER (WHERE status = 'going'),
        'show_up_rate', CASE 
          WHEN COUNT(*) FILTER (WHERE status = 'going') > 0 
          THEN ROUND((COUNT(*) FILTER (WHERE checked_in = true AND status = 'going')::numeric / 
                     COUNT(*) FILTER (WHERE status = 'going')::numeric * 100), 2)
          ELSE 0
        END
      )
      FROM public.event_attendees
      WHERE event_id = p_event_id
    ),
    'event_has_passed', v_event_end < NOW(),
    'rsvp_timeline', (
      SELECT json_agg(
        json_build_object(
          'date', DATE(created_at),
          'count', count
        ) ORDER BY date
      )
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM public.event_attendees
        WHERE event_id = p_event_id AND status = 'going'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- RPC function to get organizer-level analytics
CREATE OR REPLACE FUNCTION public.get_organizer_analytics(
  p_organizer_id UUID,
  p_days_back INTEGER DEFAULT 90
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is viewing their own stats or is admin
  IF p_organizer_id != auth.uid() THEN
    DECLARE
      is_admin BOOLEAN;
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) INTO is_admin;
      
      IF NOT is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Can only view your own analytics';
      END IF;
    END;
  END IF;

  -- Build organizer analytics
  SELECT json_build_object(
    'organizer_id', p_organizer_id,
    'time_period_days', p_days_back,
    'events_hosted', (
      SELECT json_build_object(
        'total', COUNT(*),
        'last_30_days', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'),
        'last_90_days', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '90 days'),
        'upcoming', COUNT(*) FILTER (WHERE start_time > NOW()),
        'past', COUNT(*) FILTER (WHERE end_time < NOW())
      )
      FROM public.events
      WHERE organizer_id = p_organizer_id
        AND created_at >= NOW() - INTERVAL '1 day' * p_days_back
        AND is_cancelled = false
    ),
    'avg_rsvps_per_event', (
      SELECT COALESCE(ROUND(AVG(rsvp_count), 2), 0)
      FROM (
        SELECT e.id, COUNT(ea.id) as rsvp_count
        FROM public.events e
        LEFT JOIN public.event_attendees ea ON ea.event_id = e.id
        WHERE e.organizer_id = p_organizer_id
          AND e.created_at >= NOW() - INTERVAL '1 day' * p_days_back
          AND e.is_cancelled = false
        GROUP BY e.id
      ) t
    ),
    'avg_going_per_event', (
      SELECT COALESCE(ROUND(AVG(going_count), 2), 0)
      FROM (
        SELECT e.id, COUNT(ea.id) as going_count
        FROM public.events e
        LEFT JOIN public.event_attendees ea ON ea.event_id = e.id AND ea.status = 'going'
        WHERE e.organizer_id = p_organizer_id
          AND e.created_at >= NOW() - INTERVAL '1 day' * p_days_back
          AND e.is_cancelled = false
        GROUP BY e.id
      ) t
    ),
    'avg_show_up_rate', (
      SELECT COALESCE(ROUND(AVG(
        CASE 
          WHEN going_count > 0 
          THEN (checked_in_count::numeric / going_count::numeric * 100)
          ELSE 0
        END
      ), 2), 0)
      FROM (
        SELECT 
          e.id,
          COUNT(ea.id) FILTER (WHERE ea.status = 'going') as going_count,
          COUNT(ea.id) FILTER (WHERE ea.status = 'going' AND ea.checked_in = true) as checked_in_count
        FROM public.events e
        LEFT JOIN public.event_attendees ea ON ea.event_id = e.id
        WHERE e.organizer_id = p_organizer_id
          AND e.end_time < NOW()
          AND e.created_at >= NOW() - INTERVAL '1 day' * p_days_back
          AND e.is_cancelled = false
        GROUP BY e.id
      ) t
    ),
    'event_list', (
      SELECT json_agg(
        json_build_object(
          'event_id', e.id,
          'title', e.title,
          'start_time', e.start_time,
          'end_time', e.end_time,
          'going_count', COALESCE(stats.going_count, 0),
          'total_rsvps', COALESCE(stats.total_rsvps, 0),
          'checked_in_count', COALESCE(stats.checked_in_count, 0),
          'show_up_rate', CASE 
            WHEN COALESCE(stats.going_count, 0) > 0 
            THEN ROUND((COALESCE(stats.checked_in_count, 0)::numeric / stats.going_count::numeric * 100), 2)
            ELSE 0
          END
        ) ORDER BY e.start_time DESC
      )
      FROM public.events e
      LEFT JOIN (
        SELECT 
          event_id,
          COUNT(*) as total_rsvps,
          COUNT(*) FILTER (WHERE status = 'going') as going_count,
          COUNT(*) FILTER (WHERE status = 'going' AND checked_in = true) as checked_in_count
        FROM public.event_attendees
        GROUP BY event_id
      ) stats ON stats.event_id = e.id
      WHERE e.organizer_id = p_organizer_id
        AND e.created_at >= NOW() - INTERVAL '1 day' * p_days_back
        AND e.is_cancelled = false
    ),
    'conversion_metrics', json_build_object(
      'events_to_groups', NULL,
      'events_to_spaces', NULL,
      'events_to_opportunities', NULL,
      'note', 'Conversion tracking coming in future release'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_event_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organizer_analytics(UUID, INTEGER) TO authenticated;