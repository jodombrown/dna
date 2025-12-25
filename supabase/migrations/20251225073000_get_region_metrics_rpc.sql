-- =====================================================
-- RPC FUNCTION: get_region_metrics
-- Returns aggregated metrics for regions, countries, or cities
-- Part of ADIN Intelligence feature set
-- =====================================================

-- Drop existing functions if exist
DROP FUNCTION IF EXISTS get_region_metrics(text, text);
DROP FUNCTION IF EXISTS calculate_hub_metrics();

-- =====================================================
-- RPC FUNCTION: get_region_metrics
-- =====================================================
CREATE OR REPLACE FUNCTION get_region_metrics(
  p_hub_type TEXT DEFAULT 'region',
  p_hub_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  hub_name TEXT,
  hub_type TEXT,
  members_count BIGINT,
  events_count BIGINT,
  active_projects BIGINT,
  total_contributions NUMERIC,
  stories_count BIGINT,
  connections_count BIGINT,
  top_skills TEXT[],
  top_interests TEXT[],
  member_growth_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH
  -- Normalize hub names based on type
  region_mapping AS (
    SELECT
      p.id AS profile_id,
      CASE
        WHEN p_hub_type = 'region' THEN
          CASE
            -- Map countries to African regions
            WHEN LOWER(COALESCE(p.country_of_origin, p.current_country, '')) IN ('nigeria', 'ghana', 'senegal', 'mali', 'burkina faso', 'niger', 'benin', 'togo', 'guinea', 'sierra leone', 'liberia', 'gambia', 'guinea-bissau', 'cape verde', 'mauritania') THEN 'West Africa'
            WHEN LOWER(COALESCE(p.country_of_origin, p.current_country, '')) IN ('kenya', 'tanzania', 'uganda', 'rwanda', 'burundi', 'ethiopia', 'eritrea', 'djibouti', 'somalia', 'south sudan', 'sudan') THEN 'East Africa'
            WHEN LOWER(COALESCE(p.country_of_origin, p.current_country, '')) IN ('south africa', 'botswana', 'namibia', 'zimbabwe', 'zambia', 'mozambique', 'malawi', 'angola', 'lesotho', 'eswatini', 'madagascar', 'mauritius', 'comoros', 'seychelles') THEN 'Southern Africa'
            WHEN LOWER(COALESCE(p.country_of_origin, p.current_country, '')) IN ('egypt', 'morocco', 'algeria', 'tunisia', 'libya') THEN 'North Africa'
            WHEN LOWER(COALESCE(p.country_of_origin, p.current_country, '')) IN ('cameroon', 'central african republic', 'chad', 'congo', 'democratic republic of congo', 'drc', 'gabon', 'equatorial guinea', 'sao tome and principe') THEN 'Central Africa'
            ELSE 'Global Diaspora'
          END
        WHEN p_hub_type = 'country' THEN COALESCE(p.country_of_origin, p.current_country)
        WHEN p_hub_type = 'city' THEN COALESCE(p.current_city, SPLIT_PART(p.location, ',', 1))
        ELSE 'Unknown'
      END AS hub_name
    FROM profiles p
    WHERE COALESCE(p.country_of_origin, p.current_country, p.location) IS NOT NULL
  ),
  -- Get member counts by hub
  member_stats AS (
    SELECT
      rm.hub_name,
      COUNT(DISTINCT rm.profile_id) AS member_count
    FROM region_mapping rm
    WHERE rm.hub_name IS NOT NULL
      AND rm.hub_name != 'Unknown'
      AND (p_hub_name IS NULL OR LOWER(rm.hub_name) = LOWER(p_hub_name))
    GROUP BY rm.hub_name
  ),
  -- Get event counts (events hosted in region)
  event_stats AS (
    SELECT
      CASE
        WHEN p_hub_type = 'region' THEN
          CASE
            WHEN LOWER(COALESCE(e.location, '')) LIKE '%nigeria%' OR LOWER(COALESCE(e.location, '')) LIKE '%ghana%' OR LOWER(COALESCE(e.location, '')) LIKE '%senegal%' THEN 'West Africa'
            WHEN LOWER(COALESCE(e.location, '')) LIKE '%kenya%' OR LOWER(COALESCE(e.location, '')) LIKE '%tanzania%' OR LOWER(COALESCE(e.location, '')) LIKE '%uganda%' OR LOWER(COALESCE(e.location, '')) LIKE '%ethiopia%' THEN 'East Africa'
            WHEN LOWER(COALESCE(e.location, '')) LIKE '%south africa%' OR LOWER(COALESCE(e.location, '')) LIKE '%zimbabwe%' OR LOWER(COALESCE(e.location, '')) LIKE '%botswana%' THEN 'Southern Africa'
            WHEN LOWER(COALESCE(e.location, '')) LIKE '%egypt%' OR LOWER(COALESCE(e.location, '')) LIKE '%morocco%' OR LOWER(COALESCE(e.location, '')) LIKE '%algeria%' THEN 'North Africa'
            WHEN LOWER(COALESCE(e.location, '')) LIKE '%cameroon%' OR LOWER(COALESCE(e.location, '')) LIKE '%congo%' THEN 'Central Africa'
            ELSE 'Global Diaspora'
          END
        ELSE COALESCE(e.location, 'Unknown')
      END AS hub_name,
      COUNT(*) AS event_count
    FROM events e
    WHERE e.status != 'cancelled'
    GROUP BY 1
  ),
  -- Get contribution stats
  contribution_stats AS (
    SELECT
      rm.hub_name,
      COUNT(cc.id) AS project_count,
      COALESCE(SUM(cc.amount_raised), 0) AS total_raised
    FROM region_mapping rm
    LEFT JOIN contribution_cards cc ON cc.created_by = rm.profile_id AND cc.status = 'active'
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name
  ),
  -- Get post/story counts
  story_stats AS (
    SELECT
      rm.hub_name,
      COUNT(p.id) AS story_count
    FROM region_mapping rm
    LEFT JOIN posts p ON p.user_id = rm.profile_id AND p.is_published = true
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name
  ),
  -- Get connection counts within hub
  connection_stats AS (
    SELECT
      rm.hub_name,
      COUNT(DISTINCT c.id) AS connection_count
    FROM region_mapping rm
    LEFT JOIN connections c ON (c.requester_id = rm.profile_id OR c.recipient_id = rm.profile_id) AND c.status = 'accepted'
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name
  ),
  -- Get top skills per hub
  skill_stats AS (
    SELECT
      rm.hub_name,
      skill,
      COUNT(*) AS skill_count
    FROM region_mapping rm
    INNER JOIN profiles p ON p.id = rm.profile_id
    CROSS JOIN LATERAL UNNEST(COALESCE(p.skills, ARRAY[]::TEXT[])) AS skill
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name, skill
  ),
  top_skills_per_hub AS (
    SELECT
      hub_name,
      ARRAY_AGG(skill ORDER BY skill_count DESC) FILTER (WHERE skill IS NOT NULL)[1:5] AS top_skills
    FROM skill_stats
    GROUP BY hub_name
  ),
  -- Get top interests per hub
  interest_stats AS (
    SELECT
      rm.hub_name,
      interest,
      COUNT(*) AS interest_count
    FROM region_mapping rm
    INNER JOIN profiles p ON p.id = rm.profile_id
    CROSS JOIN LATERAL UNNEST(COALESCE(p.interests, ARRAY[]::TEXT[])) AS interest
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name, interest
  ),
  top_interests_per_hub AS (
    SELECT
      hub_name,
      ARRAY_AGG(interest ORDER BY interest_count DESC) FILTER (WHERE interest IS NOT NULL)[1:5] AS top_interests
    FROM interest_stats
    GROUP BY hub_name
  ),
  -- Calculate member growth (profiles created in last 30 days vs prior 30 days)
  growth_stats AS (
    SELECT
      rm.hub_name,
      COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '30 days') AS recent_members,
      COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '60 days' AND p.created_at < NOW() - INTERVAL '30 days') AS prior_members
    FROM region_mapping rm
    INNER JOIN profiles p ON p.id = rm.profile_id
    WHERE rm.hub_name IS NOT NULL
    GROUP BY rm.hub_name
  )
  SELECT
    ms.hub_name,
    p_hub_type::TEXT,
    ms.member_count,
    COALESCE(es.event_count, 0),
    COALESCE(cs.project_count, 0),
    COALESCE(cs.total_raised, 0),
    COALESCE(ss.story_count, 0),
    COALESCE(cons.connection_count, 0),
    COALESCE(tsh.top_skills, ARRAY[]::TEXT[]),
    COALESCE(tih.top_interests, ARRAY[]::TEXT[]),
    CASE
      WHEN COALESCE(gs.prior_members, 0) = 0 THEN 0
      ELSE ROUND(((gs.recent_members::NUMERIC - gs.prior_members::NUMERIC) / gs.prior_members::NUMERIC) * 100, 1)
    END AS member_growth_percent
  FROM member_stats ms
  LEFT JOIN event_stats es ON es.hub_name = ms.hub_name
  LEFT JOIN contribution_stats cs ON cs.hub_name = ms.hub_name
  LEFT JOIN story_stats ss ON ss.hub_name = ms.hub_name
  LEFT JOIN connection_stats cons ON cons.hub_name = ms.hub_name
  LEFT JOIN top_skills_per_hub tsh ON tsh.hub_name = ms.hub_name
  LEFT JOIN top_interests_per_hub tih ON tih.hub_name = ms.hub_name
  LEFT JOIN growth_stats gs ON gs.hub_name = ms.hub_name
  ORDER BY ms.member_count DESC
  LIMIT 20;
END;
$$;

-- =====================================================
-- FUNCTION: calculate_hub_metrics
-- Populates hub_metrics table with live data
-- Run this periodically (e.g., via cron job)
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_hub_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
BEGIN
  -- Calculate metrics for African regions
  FOR r IN (SELECT * FROM get_region_metrics('region'))
  LOOP
    INSERT INTO hub_metrics (
      hub_type,
      hub_id,
      members_connected,
      events_hosted,
      projects_active,
      contributions_total,
      stories_published,
      connections_made,
      last_calculated_at
    )
    SELECT
      'region',
      gen_random_uuid(), -- Using random UUID as we don't have specific region table IDs
      r.members_count::INT,
      r.events_count::INT,
      r.active_projects::INT,
      r.total_contributions,
      r.stories_count::INT,
      r.connections_count::INT,
      NOW()
    ON CONFLICT (hub_type, hub_id) DO UPDATE SET
      members_connected = EXCLUDED.members_connected,
      events_hosted = EXCLUDED.events_hosted,
      projects_active = EXCLUDED.projects_active,
      contributions_total = EXCLUDED.contributions_total,
      stories_published = EXCLUDED.stories_published,
      connections_made = EXCLUDED.connections_made,
      last_calculated_at = EXCLUDED.last_calculated_at,
      updated_at = NOW();
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_region_metrics(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_region_metrics(text, text) TO anon;
GRANT EXECUTE ON FUNCTION calculate_hub_metrics() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_region_metrics IS 'Returns aggregated metrics for African regions, countries, or cities. Part of ADIN Intelligence.';
COMMENT ON FUNCTION calculate_hub_metrics IS 'Calculates and stores hub metrics from live data. Run periodically.';
