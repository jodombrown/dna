-- Create get_activity_feed RPC that aggregates activities from all 5Cs
-- This returns a unified activity stream for the logged-in user

CREATE OR REPLACE FUNCTION get_activity_feed(
  p_user_id UUID,
  p_activity_types TEXT[] DEFAULT NULL, -- Filter by types: 'post', 'connection', 'space', 'event', 'contribution', 'story'
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  activity_id UUID,
  activity_type TEXT,
  created_at TIMESTAMPTZ,
  actor_id UUID,
  actor_username TEXT,
  actor_full_name TEXT,
  actor_avatar_url TEXT,
  entity_id UUID,
  entity_type TEXT,
  entity_title TEXT,
  entity_data JSONB,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Get user's connections for filtering
  user_connections AS (
    SELECT 
      CASE 
        WHEN requester_id = p_user_id THEN recipient_id
        ELSE requester_id
      END AS connection_id
    FROM connections
    WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
      AND status = 'accepted'
  ),
  
  -- Get blocked users to exclude
  blocked_users_list AS (
    SELECT blocked_id FROM blocked_users WHERE blocker_id = p_user_id
    UNION
    SELECT blocker_id FROM blocked_users WHERE blocked_id = p_user_id
  ),
  
  -- Get user's spaces for filtering
  user_spaces AS (
    SELECT DISTINCT space_id 
    FROM collaboration_memberships
    WHERE user_id = p_user_id AND status = 'approved'
  ),
  
  -- Activity 1: Posts from connections and own posts
  posts_activity AS (
    SELECT
      p.id AS activity_id,
      'post'::TEXT AS activity_type,
      p.created_at,
      p.author_id AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      p.id AS entity_id,
      'post'::TEXT AS entity_type,
      LEFT(p.content, 100) AS entity_title,
      jsonb_build_object(
        'content', p.content,
        'media_url', p.media_url,
        'like_count', p.like_count,
        'comment_count', p.comment_count
      ) AS entity_data,
      jsonb_build_object(
        'visibility', p.visibility
      ) AS metadata
    FROM posts p
    JOIN profiles prof ON prof.id = p.author_id
    WHERE p.status = 'published'
      AND p.author_id NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND (
        p.author_id = p_user_id
        OR (p.visibility = 'public' AND p.author_id IN (SELECT connection_id FROM user_connections))
        OR (p.visibility = 'connections' AND p.author_id IN (SELECT connection_id FROM user_connections))
      )
      AND (p_activity_types IS NULL OR 'post' = ANY(p_activity_types))
  ),
  
  -- Activity 2: New accepted connections
  connections_activity AS (
    SELECT
      c.id AS activity_id,
      'connection'::TEXT AS activity_type,
      c.updated_at AS created_at,
      CASE 
        WHEN c.requester_id = p_user_id THEN c.recipient_id
        ELSE c.requester_id
      END AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      c.id AS entity_id,
      'connection'::TEXT AS entity_type,
      'New connection' AS entity_title,
      jsonb_build_object(
        'requester_id', c.requester_id,
        'recipient_id', c.recipient_id
      ) AS entity_data,
      jsonb_build_object(
        'message', c.message
      ) AS metadata
    FROM connections c
    JOIN profiles prof ON prof.id = CASE 
      WHEN c.requester_id = p_user_id THEN c.recipient_id
      ELSE c.requester_id
    END
    WHERE (c.requester_id = p_user_id OR c.recipient_id = p_user_id)
      AND c.status = 'accepted'
      AND c.updated_at > NOW() - INTERVAL '30 days' -- Only recent connections
      AND prof.id NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND (p_activity_types IS NULL OR 'connection' = ANY(p_activity_types))
  ),
  
  -- Activity 3: Space joins and updates
  space_activity AS (
    SELECT
      cm.id AS activity_id,
      'space'::TEXT AS activity_type,
      cm.joined_at AS created_at,
      cm.user_id AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      s.id AS entity_id,
      'space'::TEXT AS entity_type,
      s.title AS entity_title,
      jsonb_build_object(
        'space_id', s.id,
        'space_title', s.title,
        'space_description', s.description,
        'space_visibility', s.visibility
      ) AS entity_data,
      jsonb_build_object(
        'role', cm.role
      ) AS metadata
    FROM collaboration_memberships cm
    JOIN collaboration_spaces s ON s.id = cm.space_id
    JOIN profiles prof ON prof.id = cm.user_id
    WHERE cm.status = 'approved'
      AND cm.user_id NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND (
        cm.user_id = p_user_id -- Own joins
        OR (cm.user_id IN (SELECT connection_id FROM user_connections) AND s.visibility = 'public') -- Connections' public joins
      )
      AND cm.joined_at > NOW() - INTERVAL '30 days' -- Recent joins only
      AND (p_activity_types IS NULL OR 'space' = ANY(p_activity_types))
  ),
  
  -- Activity 4: Events (new events in user's spaces or from connections)
  event_activity AS (
    SELECT
      e.id AS activity_id,
      'event'::TEXT AS activity_type,
      e.created_at,
      e.created_by AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      e.id AS entity_id,
      'event'::TEXT AS entity_type,
      e.title AS entity_title,
      jsonb_build_object(
        'event_id', e.id,
        'event_title', e.title,
        'event_description', e.description,
        'start_time', e.start_time,
        'location', e.location,
        'is_virtual', e.is_virtual
      ) AS entity_data,
      jsonb_build_object(
        'visibility', e.visibility
      ) AS metadata
    FROM events e
    JOIN profiles prof ON prof.id = e.created_by
    WHERE e.status = 'published'
      AND e.created_by NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND (
        e.visibility = 'public'
        OR (e.space_id IN (SELECT space_id FROM user_spaces))
        OR (e.created_by IN (SELECT connection_id FROM user_connections))
      )
      AND e.start_time > NOW() - INTERVAL '7 days' -- Recent or upcoming events
      AND (p_activity_types IS NULL OR 'event' = ANY(p_activity_types))
  ),
  
  -- Activity 5: Contribution needs and offers from user's spaces
  contribution_activity AS (
    SELECT
      cn.id AS activity_id,
      'contribution'::TEXT AS activity_type,
      cn.created_at,
      cn.created_by AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      cn.id AS entity_id,
      'need'::TEXT AS entity_type,
      cn.title AS entity_title,
      jsonb_build_object(
        'need_id', cn.id,
        'need_title', cn.title,
        'need_description', cn.description,
        'need_type', cn.type,
        'priority', cn.priority,
        'space_id', cn.space_id
      ) AS entity_data,
      jsonb_build_object(
        'status', cn.status
      ) AS metadata
    FROM contribution_needs cn
    JOIN profiles prof ON prof.id = cn.created_by
    WHERE cn.space_id IN (SELECT space_id FROM user_spaces)
      AND cn.created_by NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND cn.status IN ('open', 'in_progress')
      AND (p_activity_types IS NULL OR 'contribution' = ANY(p_activity_types))
  ),
  
  -- Activity 6: Stories from CONVEY
  story_activity AS (
    SELECT
      ci.id AS activity_id,
      'story'::TEXT AS activity_type,
      ci.published_at AS created_at,
      ci.author_id AS actor_id,
      prof.username AS actor_username,
      prof.full_name AS actor_full_name,
      prof.avatar_url AS actor_avatar_url,
      ci.id AS entity_id,
      ci.type AS entity_type,
      ci.title AS entity_title,
      jsonb_build_object(
        'story_id', ci.id,
        'story_title', ci.title,
        'story_subtitle', ci.subtitle,
        'story_type', ci.type,
        'primary_space_id', ci.primary_space_id
      ) AS entity_data,
      jsonb_build_object(
        'visibility', ci.visibility,
        'focus_areas', ci.focus_areas,
        'region', ci.region
      ) AS metadata
    FROM convey_items ci
    JOIN profiles prof ON prof.id = ci.author_id
    WHERE ci.status = 'published'
      AND ci.author_id NOT IN (SELECT blocked_id FROM blocked_users_list)
      AND (
        ci.visibility = 'public'
        OR (ci.visibility = 'members_only')
        OR (ci.visibility = 'space_members_only' AND ci.primary_space_id IN (SELECT space_id FROM user_spaces))
      )
      AND ci.published_at > NOW() - INTERVAL '30 days' -- Recent stories
      AND (p_activity_types IS NULL OR 'story' = ANY(p_activity_types))
  ),
  
  -- Union all activities and sort by created_at
  all_activities AS (
    SELECT * FROM posts_activity
    UNION ALL
    SELECT * FROM connections_activity
    UNION ALL
    SELECT * FROM space_activity
    UNION ALL
    SELECT * FROM event_activity
    UNION ALL
    SELECT * FROM contribution_activity
    UNION ALL
    SELECT * FROM story_activity
  )
  
  SELECT * FROM all_activities
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;