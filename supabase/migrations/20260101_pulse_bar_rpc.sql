-- Migration: Pulse Bar RPC Function
-- Description: Creates the get_user_pulse_data RPC function for aggregating
--              pulse data across all Five C's (CONNECT, CONVENE, COLLABORATE,
--              CONTRIBUTE, CONVEY).
--
-- NOTE: This RPC function is optional - the usePulseBar hook currently does
--       client-side aggregation. This RPC can be used for improved performance
--       by replacing client-side fetches with a single RPC call.

-- Create RPC function to aggregate pulse data across all Five C's
CREATE OR REPLACE FUNCTION get_user_pulse_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  connect_data JSONB;
  convene_data JSONB;
  collaborate_data JSONB;
  contribute_data JSONB;
  convey_data JSONB;
BEGIN
  -- CONNECT: Pending connection requests + suggestions
  SELECT jsonb_build_object(
    'pending_requests', (
      SELECT COUNT(*) FROM connections
      WHERE recipient_id = p_user_id
      AND status = 'pending'
    ),
    'suggestions_count', (
      SELECT COUNT(*) FROM adin_recommendations
      WHERE user_id = p_user_id
      AND rec_type = 'connection'
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'top_items', (
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', c.id,
          'title', COALESCE(p.display_name, p.full_name, 'Someone'),
          'subtitle', COALESCE(p.headline, 'wants to connect'),
          'avatar_url', p.avatar_url,
          'action_url', '/connect/requests'
        ) as item
        FROM connections c
        JOIN profiles p ON p.id = c.requester_id
        WHERE c.recipient_id = p_user_id
        AND c.status = 'pending'
        ORDER BY c.created_at DESC
        LIMIT 3
      ) sub
    )
  ) INTO connect_data;

  -- CONVENE: Upcoming events
  SELECT jsonb_build_object(
    'upcoming_count', (
      SELECT COUNT(*) FROM event_attendees ea
      JOIN events e ON e.id = ea.event_id
      WHERE ea.user_id = p_user_id
      AND ea.status IN ('going', 'confirmed')
      AND e.start_time > NOW()
    ),
    'pending_invites', 0, -- No explicit invites table
    'next_event', (
      SELECT jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'starts_at', e.start_time
      )
      FROM event_attendees ea
      JOIN events e ON e.id = ea.event_id
      WHERE ea.user_id = p_user_id
      AND ea.status IN ('going', 'confirmed')
      AND e.start_time > NOW()
      ORDER BY e.start_time ASC
      LIMIT 1
    ),
    'top_items', (
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', e.id,
          'title', e.title,
          'subtitle', TO_CHAR(e.start_time, 'Mon DD'),
          'avatar_url', e.cover_image_url,
          'action_url', '/convene/events/' || e.id
        ) as item
        FROM event_attendees ea
        JOIN events e ON e.id = ea.event_id
        WHERE ea.user_id = p_user_id
        AND ea.status IN ('going', 'confirmed')
        AND e.start_time > NOW()
        ORDER BY e.start_time ASC
        LIMIT 3
      ) sub
    )
  ) INTO convene_data;

  -- COLLABORATE: Active spaces
  SELECT jsonb_build_object(
    'active_spaces', (
      SELECT COUNT(*) FROM space_members sm
      JOIN spaces s ON s.id = sm.space_id
      WHERE sm.user_id = p_user_id
      AND s.status = 'active'
    ),
    'stalled_count', (
      SELECT COUNT(*) FROM space_members sm
      JOIN spaces s ON s.id = sm.space_id
      WHERE sm.user_id = p_user_id
      AND s.status = 'active'
      AND s.updated_at < NOW() - INTERVAL '14 days'
    ),
    'attention_space', (
      SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'status', 'stalling'
      )
      FROM space_members sm
      JOIN spaces s ON s.id = sm.space_id
      WHERE sm.user_id = p_user_id
      AND s.status = 'active'
      AND s.updated_at < NOW() - INTERVAL '14 days'
      ORDER BY s.updated_at ASC
      LIMIT 1
    ),
    'top_items', (
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', s.id,
          'title', s.name,
          'subtitle',
            CASE
              WHEN s.updated_at < NOW() - INTERVAL '14 days' THEN 'Needs attention'
              ELSE 'Active'
            END,
          'action_url', '/collaborate/spaces/' || s.id
        ) as item
        FROM space_members sm
        JOIN spaces s ON s.id = sm.space_id
        WHERE sm.user_id = p_user_id
        AND s.status = 'active'
        ORDER BY s.updated_at DESC
        LIMIT 3
      ) sub
    )
  ) INTO collaborate_data;

  -- CONTRIBUTE: Matches + open listings
  SELECT jsonb_build_object(
    'match_count', (
      SELECT COUNT(*) FROM contribution_offers co
      JOIN contribution_needs cn ON cn.id = co.need_id
      WHERE cn.created_by = p_user_id
      AND co.status = 'pending'
    ),
    'open_listings', (
      SELECT COUNT(*) FROM contribution_needs
      WHERE created_by = p_user_id
      AND status = 'open'
    ),
    'top_items', (
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', co.id,
          'title', cn.title,
          'subtitle', 'New offer received',
          'action_url', '/contribute/needs/' || cn.id
        ) as item
        FROM contribution_offers co
        JOIN contribution_needs cn ON cn.id = co.need_id
        WHERE cn.created_by = p_user_id
        AND co.status = 'pending'
        ORDER BY co.created_at DESC
        LIMIT 3
      ) sub
    )
  ) INTO contribute_data;

  -- CONVEY: Engagement + trending
  SELECT jsonb_build_object(
    'total_engagement_24h', (
      SELECT COALESCE(
        (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON p.id = pl.post_id
         WHERE p.author_id = p_user_id AND pl.created_at > NOW() - INTERVAL '24 hours') +
        (SELECT COUNT(*) FROM post_comments pc JOIN posts p ON p.id = pc.post_id
         WHERE p.author_id = p_user_id AND pc.created_at > NOW() - INTERVAL '24 hours') +
        (SELECT COUNT(*) FROM post_reactions pr JOIN posts p ON p.id = pr.post_id
         WHERE p.author_id = p_user_id AND pr.created_at > NOW() - INTERVAL '24 hours'),
        0
      )
    ),
    'is_trending', (
      SELECT EXISTS(
        SELECT 1 FROM posts p
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        LEFT JOIN post_comments pc ON pc.post_id = p.id
        WHERE p.author_id = p_user_id
        AND p.created_at > NOW() - INTERVAL '7 days'
        AND p.is_deleted = false
        GROUP BY p.id
        HAVING COUNT(DISTINCT pl.id) + COUNT(DISTINCT pc.id) > 20
      )
    ),
    'top_performing_post', (
      SELECT jsonb_build_object(
        'id', p.id,
        'title', LEFT(p.content, 50),
        'engagement_count', (
          SELECT COUNT(*) FROM post_likes WHERE post_id = p.id
        ) + (
          SELECT COUNT(*) FROM post_comments WHERE post_id = p.id
        )
      )
      FROM posts p
      WHERE p.author_id = p_user_id
      AND p.created_at > NOW() - INTERVAL '7 days'
      AND p.is_deleted = false
      ORDER BY (
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) +
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id)
      ) DESC
      LIMIT 1
    ),
    'top_items', (
      SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', p.id,
          'title', LEFT(p.content, 50),
          'subtitle', (
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) +
            (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id)
          )::text || ' engagements',
          'action_url', '/convey/posts/' || p.id
        ) as item
        FROM posts p
        WHERE p.author_id = p_user_id
        AND p.created_at > NOW() - INTERVAL '7 days'
        AND p.is_deleted = false
        ORDER BY (
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) +
          (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id)
        ) DESC
        LIMIT 3
      ) sub
    )
  ) INTO convey_data;

  -- Assemble final result with computed statuses and micro-text
  result := jsonb_build_object(
    'connect', connect_data || jsonb_build_object(
      'count', COALESCE((connect_data->>'pending_requests')::int, 0) + COALESCE((connect_data->>'suggestions_count')::int, 0),
      'status', CASE
        WHEN COALESCE((connect_data->>'pending_requests')::int, 0) > 0 THEN 'active'
        WHEN COALESCE((connect_data->>'suggestions_count')::int, 0) > 0 THEN 'active'
        ELSE 'dormant'
      END,
      'micro_text', CASE
        WHEN COALESCE((connect_data->>'pending_requests')::int, 0) > 0
          THEN (connect_data->>'pending_requests') || ' pending'
        WHEN COALESCE((connect_data->>'suggestions_count')::int, 0) > 0
          THEN (connect_data->>'suggestions_count') || ' suggestions'
        ELSE 'Grow your network'
      END
    ),
    'convene', convene_data || jsonb_build_object(
      'count', COALESCE((convene_data->>'upcoming_count')::int, 0),
      'status', CASE
        WHEN convene_data->'next_event' IS NOT NULL AND convene_data->'next_event' != 'null'::jsonb THEN 'active'
        ELSE 'dormant'
      END,
      'micro_text', CASE
        WHEN convene_data->'next_event' IS NOT NULL AND convene_data->'next_event' != 'null'::jsonb
          THEN 'Next: ' || COALESCE((convene_data->'next_event'->>'title'), 'Event')
        ELSE 'Discover events'
      END
    ),
    'collaborate', collaborate_data || jsonb_build_object(
      'count', COALESCE((collaborate_data->>'active_spaces')::int, 0),
      'status', CASE
        WHEN COALESCE((collaborate_data->>'stalled_count')::int, 0) > 0 THEN 'attention'
        WHEN COALESCE((collaborate_data->>'active_spaces')::int, 0) > 0 THEN 'active'
        ELSE 'dormant'
      END,
      'micro_text', CASE
        WHEN collaborate_data->'attention_space' IS NOT NULL AND collaborate_data->'attention_space' != 'null'::jsonb
          THEN '"' || (collaborate_data->'attention_space'->>'name') || '" needs you'
        WHEN COALESCE((collaborate_data->>'active_spaces')::int, 0) > 0
          THEN (collaborate_data->>'active_spaces') || ' active spaces'
        ELSE 'Start collaborating'
      END
    ),
    'contribute', contribute_data || jsonb_build_object(
      'count', COALESCE((contribute_data->>'match_count')::int, 0),
      'status', CASE
        WHEN COALESCE((contribute_data->>'match_count')::int, 0) > 0 THEN 'active'
        WHEN COALESCE((contribute_data->>'open_listings')::int, 0) > 0 THEN 'active'
        ELSE 'dormant'
      END,
      'micro_text', CASE
        WHEN COALESCE((contribute_data->>'match_count')::int, 0) > 0
          THEN (contribute_data->>'match_count') || ' matches'
        WHEN COALESCE((contribute_data->>'open_listings')::int, 0) > 0
          THEN (contribute_data->>'open_listings') || ' open listings'
        ELSE 'Browse opportunities'
      END
    ),
    'convey', convey_data || jsonb_build_object(
      'count', COALESCE((convey_data->>'total_engagement_24h')::int, 0),
      'status', CASE
        WHEN (convey_data->>'is_trending')::boolean THEN 'active'
        WHEN COALESCE((convey_data->>'total_engagement_24h')::int, 0) > 0 THEN 'active'
        ELSE 'dormant'
      END,
      'micro_text', CASE
        WHEN (convey_data->>'is_trending')::boolean THEN 'Trending!'
        WHEN COALESCE((convey_data->>'total_engagement_24h')::int, 0) > 0
          THEN (convey_data->>'total_engagement_24h') || ' engagements'
        ELSE 'Share your story'
      END
    ),
    'last_updated', NOW()
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_pulse_data(UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_recipient_pending
ON connections(recipient_id, status)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_event_attendees_user_status
ON event_attendees(user_id, status);

CREATE INDEX IF NOT EXISTS idx_space_members_user
ON space_members(user_id);

CREATE INDEX IF NOT EXISTS idx_contribution_needs_creator_status
ON contribution_needs(created_by, status);

CREATE INDEX IF NOT EXISTS idx_posts_author_recent
ON posts(author_id, created_at DESC)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_adin_recommendations_user_type
ON adin_recommendations(user_id, rec_type, created_at DESC);
