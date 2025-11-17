-- DNA | FEED - Unified Content Model Schema
-- Extends posts table to support all content types in one feed

-- 1. Create enum for linked entity types
CREATE TYPE linked_entity_type AS ENUM (
  'event',
  'space', 
  'need',
  'story',
  'community_post'
);

-- 2. Alter posts table to support unified content model
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS linked_entity_type linked_entity_type,
  ADD COLUMN IF NOT EXISTS linked_entity_id uuid,
  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES collaboration_spaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

-- 3. Add indexes for efficient feed queries
CREATE INDEX IF NOT EXISTS idx_posts_linked_entity ON posts(linked_entity_type, linked_entity_id) WHERE linked_entity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_space_id ON posts(space_id) WHERE space_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_event_id ON posts(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type_created ON posts(post_type, created_at DESC);

-- 4. Create or replace universal feed function
CREATE OR REPLACE FUNCTION get_universal_feed(
  p_viewer_id uuid,
  p_tab text DEFAULT 'all',
  p_author_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  post_id uuid,
  author_id uuid,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  content text,
  media_url text,
  post_type text,
  privacy_level text,
  linked_entity_type text,
  linked_entity_id uuid,
  space_id uuid,
  space_title text,
  event_id uuid,
  event_title text,
  created_at timestamptz,
  updated_at timestamptz,
  like_count bigint,
  comment_count bigint,
  share_count bigint,
  view_count bigint,
  bookmark_count bigint,
  has_liked boolean,
  has_bookmarked boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH user_connections AS (
    SELECT recipient_id AS connected_user_id FROM connections 
    WHERE requester_id = p_viewer_id AND status = 'accepted'
    UNION
    SELECT requester_id AS connected_user_id FROM connections 
    WHERE recipient_id = p_viewer_id AND status = 'accepted'
  ),
  user_spaces AS (
    SELECT space_id FROM collaboration_memberships
    WHERE user_id = p_viewer_id AND status = 'active'
  ),
  user_events AS (
    SELECT event_id FROM event_attendees
    WHERE user_id = p_viewer_id AND status = 'going'
  )
  SELECT 
    p.id AS post_id,
    p.author_id,
    prof.username AS author_username,
    prof.display_name AS author_display_name,
    prof.avatar_url AS author_avatar_url,
    p.content,
    p.media_url,
    p.post_type,
    p.privacy_level,
    p.linked_entity_type::text,
    p.linked_entity_id,
    p.space_id,
    cs.title AS space_title,
    p.event_id,
    e.title AS event_title,
    p.created_at,
    p.updated_at,
    COALESCE(pl.like_count, 0) AS like_count,
    COALESCE(pc.comment_count, 0) AS comment_count,
    COALESCE(ps.share_count, 0) AS share_count,
    COALESCE(pv.view_count, 0) AS view_count,
    COALESCE(pb.bookmark_count, 0) AS bookmark_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_viewer_id) AS has_liked,
    EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id) AS has_bookmarked
  FROM posts p
  LEFT JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN collaboration_spaces cs ON p.space_id = cs.id
  LEFT JOIN events e ON p.event_id = e.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id = p.id
  ) pl ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS comment_count FROM post_comments WHERE post_id = p.id
  ) pc ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS share_count FROM post_shares WHERE post_id = p.id
  ) ps ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS view_count FROM post_views WHERE post_id = p.id
  ) pv ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS bookmark_count FROM post_bookmarks WHERE post_id = p.id
  ) pb ON true
  WHERE 
    -- Privacy filtering
    (p.privacy_level = 'public' OR
     p.privacy_level = 'connections' AND p.author_id IN (SELECT connected_user_id FROM user_connections) OR
     p.author_id = p_viewer_id)
    -- Tab filtering
    AND (
      p_tab = 'all' OR
      (p_tab = 'network' AND (
        p.author_id IN (SELECT connected_user_id FROM user_connections) OR
        p.space_id IN (SELECT space_id FROM user_spaces) OR
        p.event_id IN (SELECT event_id FROM user_events)
      )) OR
      (p_tab = 'my_posts' AND p.author_id = p_viewer_id)
    )
    -- Context filtering
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_space_id IS NULL OR p.space_id = p_space_id)
    AND (p_event_id IS NULL OR p.event_id = p_event_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;