-- ============================================================================
-- DNA | FEED - Unified Content Model Migration
-- ============================================================================
-- This migration extends the posts table to support a unified feed architecture
-- where posts can represent or link to other entity types (events, spaces, needs, stories)

-- 1. Extend posts table with linked entity support
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS linked_entity_type TEXT,
ADD COLUMN IF NOT EXISTS linked_entity_id UUID,
ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_linked_entity ON posts(linked_entity_type, linked_entity_id);
CREATE INDEX IF NOT EXISTS idx_posts_space_id ON posts(space_id);
CREATE INDEX IF NOT EXISTS idx_posts_event_id ON posts(event_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);

-- 3. Create enhanced universal feed function
CREATE OR REPLACE FUNCTION get_universal_feed(
  p_user_id UUID,
  p_feed_type TEXT DEFAULT 'all', -- 'all' | 'network' | 'my_posts'
  p_author_id UUID DEFAULT NULL,  -- for profile feeds
  p_space_id UUID DEFAULT NULL,   -- for space feeds
  p_event_id UUID DEFAULT NULL,   -- for event feeds
  p_hashtag TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  author_headline TEXT,
  content TEXT,
  post_type TEXT,
  privacy_level TEXT,
  image_url TEXT,
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  space_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  views_count BIGINT,
  user_has_liked BOOLEAN,
  user_has_saved BOOLEAN,
  is_connection BOOLEAN,
  original_post_id UUID,
  shared_by TEXT,
  share_commentary TEXT,
  original_author_id UUID,
  original_author_username TEXT,
  original_author_full_name TEXT,
  original_author_avatar_url TEXT,
  original_author_headline TEXT,
  original_content TEXT,
  original_image_url TEXT,
  original_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH user_connections AS (
    SELECT 
      CASE 
        WHEN requester_id = p_user_id THEN recipient_id
        WHEN recipient_id = p_user_id THEN requester_id
      END as connected_user_id
    FROM connections
    WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
      AND status = 'accepted'
  ),
  user_spaces AS (
    SELECT DISTINCT space_id
    FROM space_members
    WHERE user_id = p_user_id AND status = 'active'
  ),
  filtered_posts AS (
    SELECT p.*
    FROM posts p
    WHERE p.is_deleted = false
      AND (p.privacy_level = 'public' OR p.author_id = p_user_id)
      -- Filter by feed type
      AND (
        p_feed_type = 'all' OR
        (p_feed_type = 'network' AND (
          p.author_id IN (SELECT connected_user_id FROM user_connections) OR
          p.space_id IN (SELECT space_id FROM user_spaces) OR
          p.author_id = p_user_id
        )) OR
        (p_feed_type = 'my_posts' AND p.author_id = p_user_id)
      )
      -- Filter by specific context
      AND (p_author_id IS NULL OR p.author_id = p_author_id)
      AND (p_space_id IS NULL OR p.space_id = p_space_id)
      AND (p_event_id IS NULL OR p.event_id = p_event_id)
      AND (p_hashtag IS NULL OR p.content ILIKE '%' || p_hashtag || '%')
  )
  SELECT 
    p.id as post_id,
    p.author_id,
    prof.username as author_username,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url,
    prof.headline as author_headline,
    p.content,
    p.post_type,
    p.privacy_level,
    p.image_url,
    p.link_url,
    p.link_title,
    p.link_description,
    p.linked_entity_type,
    p.linked_entity_id,
    p.space_id,
    p.event_id,
    p.created_at,
    COALESCE(like_counts.count, 0)::BIGINT as likes_count,
    COALESCE(comment_counts.count, 0)::BIGINT as comments_count,
    COALESCE(share_counts.count, 0)::BIGINT as shares_count,
    COALESCE(view_counts.count, 0)::BIGINT as views_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id) as user_has_liked,
    EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = p_user_id) as user_has_saved,
    EXISTS(SELECT 1 FROM user_connections WHERE connected_user_id = p.author_id) as is_connection,
    -- Reshare fields
    CASE WHEN p.post_type = 'reshare' THEN p.linked_entity_id ELSE NULL END as original_post_id,
    CASE WHEN p.post_type = 'reshare' THEN prof.username ELSE NULL END as shared_by,
    CASE WHEN p.post_type = 'reshare' THEN p.content ELSE NULL END as share_commentary,
    op.author_id as original_author_id,
    op_prof.username as original_author_username,
    op_prof.full_name as original_author_full_name,
    op_prof.avatar_url as original_author_avatar_url,
    op_prof.headline as original_author_headline,
    op.content as original_content,
    op.image_url as original_image_url,
    op.created_at as original_created_at
  FROM filtered_posts p
  LEFT JOIN profiles prof ON p.author_id = prof.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_likes WHERE post_id = p.id
  ) like_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_comments WHERE post_id = p.id AND is_deleted = false
  ) comment_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_shares WHERE post_id = p.id
  ) share_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count FROM post_views WHERE post_id = p.id
  ) view_counts ON true
  -- Join original post for reshares
  LEFT JOIN posts op ON (p.post_type = 'reshare' AND p.linked_entity_type = 'post' AND op.id = p.linked_entity_id)
  LEFT JOIN profiles op_prof ON op.author_id = op_prof.id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to auto-create feed posts for entities
CREATE OR REPLACE FUNCTION create_entity_feed_post(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_author_id UUID,
  p_content TEXT,
  p_space_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO posts (
    author_id,
    content,
    post_type,
    privacy_level,
    linked_entity_type,
    linked_entity_id,
    space_id,
    event_id
  ) VALUES (
    p_author_id,
    p_content,
    p_entity_type,
    'public',
    p_entity_type,
    p_entity_id,
    p_space_id,
    p_event_id
  )
  RETURNING id INTO v_post_id;
  
  RETURN v_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add comment to document the schema design
COMMENT ON COLUMN posts.linked_entity_type IS 'Type of linked entity: event, space, need, story, community_post, post (for reshares), or null for standalone posts';
COMMENT ON COLUMN posts.linked_entity_id IS 'UUID of the linked entity';
COMMENT ON COLUMN posts.space_id IS 'Context: which space this post belongs to (if any)';
COMMENT ON COLUMN posts.event_id IS 'Context: which event this post is about (if any)';
