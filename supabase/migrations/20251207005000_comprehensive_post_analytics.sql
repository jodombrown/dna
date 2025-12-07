-- Migration: Comprehensive Post Analytics
-- Adds advanced analytics functions for post performance insights

-- Function: Get comprehensive post analytics
CREATE OR REPLACE FUNCTION public.get_post_analytics(
  p_post_id UUID
)
RETURNS TABLE (
  -- View metrics
  total_views BIGINT,
  unique_viewers BIGINT,
  views_today BIGINT,
  views_this_week BIGINT,

  -- Engagement metrics
  total_reactions BIGINT,
  reaction_breakdown JSONB,
  total_comments BIGINT,
  total_reshares BIGINT,

  -- Performance metrics
  engagement_rate NUMERIC,
  virality_score NUMERIC,

  -- Viewer demographics
  viewer_connections BIGINT,
  viewer_non_connections BIGINT,
  top_viewer_industries JSONB,
  top_viewer_regions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get post author
  SELECT author_id INTO v_author_id FROM posts WHERE id = p_post_id;

  RETURN QUERY
  WITH view_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_views,
      COUNT(DISTINCT viewer_id)::BIGINT AS unique_viewers,
      COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE)::BIGINT AS views_today,
      COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT AS views_this_week
    FROM post_views
    WHERE post_id = p_post_id
  ),
  reaction_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_reactions,
      jsonb_object_agg(
        emoji,
        count
      ) AS reaction_breakdown
    FROM (
      SELECT
        emoji,
        COUNT(*)::INTEGER AS count
      FROM post_reactions
      WHERE post_id = p_post_id
      GROUP BY emoji
      ORDER BY count DESC
    ) r
  ),
  engagement_stats AS (
    SELECT
      COUNT(DISTINCT id)::BIGINT AS total_comments
    FROM post_comments
    WHERE post_id = p_post_id
  ),
  reshare_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_reshares
    FROM post_shares
    WHERE post_id = p_post_id
  ),
  viewer_demo AS (
    SELECT
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM connections c
          WHERE ((c.requester_id = v_author_id AND c.recipient_id = pv.viewer_id)
             OR (c.recipient_id = v_author_id AND c.requester_id = pv.viewer_id))
            AND c.status = 'accepted'
        )
      )::BIGINT AS viewer_connections,
      COUNT(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1 FROM connections c
          WHERE ((c.requester_id = v_author_id AND c.recipient_id = pv.viewer_id)
             OR (c.recipient_id = v_author_id AND c.requester_id = pv.viewer_id))
            AND c.status = 'accepted'
        )
      )::BIGINT AS viewer_non_connections
    FROM post_views pv
    WHERE pv.post_id = p_post_id
      AND pv.viewer_id IS NOT NULL
  ),
  industry_demo AS (
    SELECT
      jsonb_agg(
        jsonb_build_object('industry', industry, 'count', count)
        ORDER BY count DESC
      ) FILTER (WHERE industry IS NOT NULL) AS top_industries
    FROM (
      SELECT
        unnest(p.industries) AS industry,
        COUNT(*)::INTEGER AS count
      FROM post_views pv
      INNER JOIN profiles p ON pv.viewer_id = p.id
      WHERE pv.post_id = p_post_id
        AND p.industries IS NOT NULL
        AND array_length(p.industries, 1) > 0
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 5
    ) i
  ),
  region_demo AS (
    SELECT
      jsonb_agg(
        jsonb_build_object('region', region, 'count', count)
        ORDER BY count DESC
      ) FILTER (WHERE region IS NOT NULL) AS top_regions
    FROM (
      SELECT
        unnest(p.regional_expertise) AS region,
        COUNT(*)::INTEGER AS count
      FROM post_views pv
      INNER JOIN profiles p ON pv.viewer_id = p.id
      WHERE pv.post_id = p_post_id
        AND p.regional_expertise IS NOT NULL
        AND array_length(p.regional_expertise, 1) > 0
      GROUP BY region
      ORDER BY count DESC
      LIMIT 5
    ) r
  )
  SELECT
    COALESCE(vs.total_views, 0),
    COALESCE(vs.unique_viewers, 0),
    COALESCE(vs.views_today, 0),
    COALESCE(vs.views_this_week, 0),

    COALESCE(rs.total_reactions, 0),
    COALESCE(rs.reaction_breakdown, '{}'::jsonb),
    COALESCE(es.total_comments, 0),
    COALESCE(rhs.total_reshares, 0),

    -- Engagement rate: (reactions + comments + reshares) / unique_viewers
    CASE
      WHEN COALESCE(vs.unique_viewers, 0) > 0
      THEN ROUND(
        ((COALESCE(rs.total_reactions, 0) + COALESCE(es.total_comments, 0) + COALESCE(rhs.total_reshares, 0))::NUMERIC / vs.unique_viewers::NUMERIC) * 100,
        2
      )
      ELSE 0
    END,

    -- Virality score: reshares * 10 + (reactions + comments) / views
    ROUND(
      (COALESCE(rhs.total_reshares, 0) * 10)::NUMERIC +
      CASE
        WHEN COALESCE(vs.total_views, 0) > 0
        THEN (COALESCE(rs.total_reactions, 0) + COALESCE(es.total_comments, 0))::NUMERIC / vs.total_views::NUMERIC
        ELSE 0
      END,
      2
    ),

    COALESCE(vd.viewer_connections, 0),
    COALESCE(vd.viewer_non_connections, 0),
    COALESCE(id.top_industries, '[]'::jsonb),
    COALESCE(rd.top_regions, '[]'::jsonb)
  FROM view_stats vs
  CROSS JOIN reaction_stats rs
  CROSS JOIN engagement_stats es
  CROSS JOIN reshare_stats rhs
  CROSS JOIN viewer_demo vd
  CROSS JOIN industry_demo id
  CROSS JOIN region_demo rd;
END;
$$;

-- Function: Get user's top performing posts
CREATE OR REPLACE FUNCTION public.get_user_top_posts(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  total_views BIGINT,
  total_reactions BIGINT,
  total_comments BIGINT,
  engagement_rate NUMERIC,
  virality_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS post_id,
    p.content,
    p.created_at,
    COALESCE(v.view_count, 0)::BIGINT AS total_views,
    COALESCE(r.reaction_count, 0)::BIGINT AS total_reactions,
    COALESCE(c.comment_count, 0)::BIGINT AS total_comments,
    CASE
      WHEN COALESCE(v.view_count, 0) > 0
      THEN ROUND(
        ((COALESCE(r.reaction_count, 0) + COALESCE(c.comment_count, 0))::NUMERIC / v.view_count::NUMERIC) * 100,
        2
      )
      ELSE 0
    END AS engagement_rate,
    ROUND(
      (COALESCE(s.share_count, 0) * 10)::NUMERIC +
      CASE
        WHEN COALESCE(v.view_count, 0) > 0
        THEN (COALESCE(r.reaction_count, 0) + COALESCE(c.comment_count, 0))::NUMERIC / v.view_count::NUMERIC
        ELSE 0
      END,
      2
    ) AS virality_score
  FROM posts p
  LEFT JOIN (
    SELECT post_id, COUNT(DISTINCT viewer_id) AS view_count
    FROM post_views
    GROUP BY post_id
  ) v ON v.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS reaction_count
    FROM post_reactions
    GROUP BY post_id
  ) r ON r.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS comment_count
    FROM post_comments
    GROUP BY post_id
  ) c ON c.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS share_count
    FROM post_shares
    GROUP BY post_id
  ) s ON s.post_id = p.id
  WHERE p.author_id = p_user_id
    AND p.created_at >= NOW() - INTERVAL '90 days'
  ORDER BY virality_score DESC, engagement_rate DESC, total_views DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_post_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_top_posts TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_post_analytics IS 'Returns comprehensive analytics for a single post including views, reactions breakdown, demographics, and performance metrics';
COMMENT ON FUNCTION public.get_user_top_posts IS 'Returns user''s top performing posts ranked by virality score and engagement rate';
