-- Migration: Zero State Feed RPC Function
-- Description: Creates the get_zero_state_feed RPC function for fetching
--              curated content for new users (discovery feed).
--
-- This RPC powers the Zero State experience, showing new users:
-- - Trending stories from the community
-- - Upcoming events
-- - Suggested connections (personalized)
-- - Popular collaboration spaces
-- - Marketplace opportunities matching skills

-- Create RPC function to aggregate zero state feed data
CREATE OR REPLACE FUNCTION get_zero_state_feed(
  p_user_id UUID,
  p_user_country TEXT DEFAULT NULL,
  p_user_industry TEXT DEFAULT NULL,
  p_user_skills TEXT[] DEFAULT '{}'::TEXT[],
  p_user_focus_areas TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  trending_stories JSONB;
  upcoming_events JSONB;
  suggested_connections JSONB;
  popular_spaces JSONB;
  marketplace_highlights JSONB;
  user_action_count INT;
BEGIN
  -- Get user's total action count for determining zero state threshold
  -- Count: connections + event attendance + posts authored + space memberships
  SELECT (
    COALESCE((SELECT COUNT(*) FROM connections WHERE requester_id = p_user_id OR recipient_id = p_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM event_attendees WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM posts WHERE author_id = p_user_id AND is_deleted = false), 0) +
    COALESCE((SELECT COUNT(*) FROM space_members WHERE user_id = p_user_id), 0)
  )::INT INTO user_action_count;

  -- Trending Stories (last 7 days, high engagement)
  SELECT COALESCE(jsonb_agg(story), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', p.id,
      'title', COALESCE(p.title, LEFT(p.content, 100)),
      'excerpt', LEFT(p.content, 200),
      'author_name', COALESCE(pr.display_name, pr.full_name, 'Anonymous'),
      'author_avatar', pr.avatar_url,
      'engagement_count', (
        COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) +
        COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id), 0)
      ),
      'created_at', p.created_at,
      'cover_image', p.cover_image_url
    ) as story
    FROM posts p
    JOIN profiles pr ON pr.id = p.author_id
    WHERE p.created_at > NOW() - INTERVAL '7 days'
    AND p.visibility = 'public'
    AND p.is_deleted = false
    AND (
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) +
      COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id), 0)
    ) > 5
    ORDER BY (
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) +
      COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id), 0)
    ) DESC
    LIMIT 3
  ) sub INTO trending_stories;

  -- Upcoming Events (next 30 days, most popular public events)
  SELECT COALESCE(jsonb_agg(event), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'start_date', e.start_time,
      'location', e.location,
      'cover_image', e.cover_image_url,
      'attendee_count', COALESCE((SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status IN ('going', 'confirmed')), 0),
      'event_type', e.event_type
    ) as event
    FROM events e
    WHERE e.start_time > NOW()
    AND e.start_time < NOW() + INTERVAL '30 days'
    AND e.visibility = 'public'
    AND e.is_cancelled = false
    ORDER BY (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) DESC
    LIMIT 3
  ) sub INTO upcoming_events;

  -- Suggested Connections (based on profile matching)
  SELECT COALESCE(jsonb_agg(connection), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', pr.id,
      'display_name', COALESCE(pr.display_name, pr.full_name),
      'headline', pr.headline,
      'avatar_url', pr.avatar_url,
      'country_of_origin', pr.country_of_origin,
      'industry', pr.industry,
      'match_reasons', (
        SELECT jsonb_agg(reason)
        FROM (
          SELECT 'Same country' as reason WHERE pr.country_of_origin IS NOT NULL AND pr.country_of_origin = p_user_country
          UNION ALL
          SELECT 'Same industry' WHERE pr.industry IS NOT NULL AND pr.industry = p_user_industry
          UNION ALL
          SELECT 'Shared interests' WHERE pr.focus_areas IS NOT NULL AND p_user_focus_areas IS NOT NULL AND pr.focus_areas && p_user_focus_areas
        ) reasons
        WHERE reason IS NOT NULL
      )
    ) as connection
    FROM profiles pr
    WHERE pr.id != p_user_id
    AND pr.is_public = true
    -- Exclude existing connections
    AND NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE (c.requester_id = p_user_id AND c.recipient_id = pr.id)
      OR (c.requester_id = pr.id AND c.recipient_id = p_user_id)
    )
    -- Match criteria
    AND (
      (pr.country_of_origin IS NOT NULL AND pr.country_of_origin = p_user_country)
      OR (pr.industry IS NOT NULL AND pr.industry = p_user_industry)
      OR (pr.focus_areas IS NOT NULL AND p_user_focus_areas IS NOT NULL AND pr.focus_areas && p_user_focus_areas)
    )
    ORDER BY (
      CASE WHEN pr.country_of_origin = p_user_country THEN 2 ELSE 0 END +
      CASE WHEN pr.industry = p_user_industry THEN 2 ELSE 0 END +
      COALESCE(CARDINALITY(pr.focus_areas & p_user_focus_areas), 0)
    ) DESC
    LIMIT 6
  ) sub INTO suggested_connections;

  -- Popular Spaces (active, public)
  SELECT COALESCE(jsonb_agg(space), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'description', LEFT(s.description, 150),
      'member_count', COALESCE((SELECT COUNT(*) FROM space_members WHERE space_id = s.id), 0),
      'active_task_count', 0, -- Tasks may not exist in schema
      'is_open', s.is_public,
      'cover_image', s.cover_image_url
    ) as space
    FROM spaces s
    WHERE s.status = 'active'
    AND s.is_public = true
    ORDER BY (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) DESC
    LIMIT 3
  ) sub INTO popular_spaces;

  -- Marketplace Highlights (open contribution needs matching skills)
  SELECT COALESCE(jsonb_agg(opportunity), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', cn.id,
      'title', cn.title,
      'description', LEFT(cn.description, 150),
      'contribution_type', cn.contribution_type,
      'skills_needed', cn.skills_needed,
      'skills_match_count', COALESCE(CARDINALITY(cn.skills_needed & p_user_skills), 0),
      'created_at', cn.created_at
    ) as opportunity
    FROM contribution_needs cn
    WHERE cn.status = 'open'
    AND (
      cn.skills_needed && p_user_skills
      OR CARDINALITY(p_user_skills) = 0  -- Show some if no skills set
    )
    ORDER BY
      COALESCE(CARDINALITY(cn.skills_needed & p_user_skills), 0) DESC,
      cn.created_at DESC
    LIMIT 3
  ) sub INTO marketplace_highlights;

  -- Assemble result
  result := jsonb_build_object(
    'user_action_count', user_action_count,
    'show_welcome_card', user_action_count < 3,
    'show_discovery_feed', user_action_count < 10,
    'trending_stories', COALESCE(trending_stories, '[]'::jsonb),
    'upcoming_events', COALESCE(upcoming_events, '[]'::jsonb),
    'suggested_connections', COALESCE(suggested_connections, '[]'::jsonb),
    'popular_spaces', COALESCE(popular_spaces, '[]'::jsonb),
    'marketplace_highlights', COALESCE(marketplace_highlights, '[]'::jsonb),
    'generated_at', NOW()
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_zero_state_feed(UUID, TEXT, TEXT, TEXT[], TEXT[]) TO authenticated;

-- Create indexes for better performance (if they don't already exist)
CREATE INDEX IF NOT EXISTS idx_posts_public_recent
ON posts(created_at DESC)
WHERE visibility = 'public' AND is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_events_upcoming_public
ON events(start_time)
WHERE visibility = 'public' AND is_cancelled = false AND start_time > NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_public
ON profiles(id)
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_profiles_country_of_origin
ON profiles(country_of_origin)
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_profiles_industry
ON profiles(industry)
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_spaces_public_active
ON spaces(id)
WHERE status = 'active' AND is_public = true;

CREATE INDEX IF NOT EXISTS idx_contribution_needs_open
ON contribution_needs(created_at DESC)
WHERE status = 'open';
