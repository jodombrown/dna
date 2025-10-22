-- =====================================================
-- ALTER EXISTING POSTS TABLE
-- =====================================================

-- Rename visibility to privacy_level if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE posts RENAME COLUMN visibility TO privacy_level;
  END IF;
END $$;

-- Add new columns to posts table
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS link_title TEXT,
  ADD COLUMN IF NOT EXISTS link_description TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Update existing post_type values to match new enum
UPDATE posts SET post_type = 'update' WHERE post_type NOT IN ('update', 'article', 'question', 'celebration');

-- Drop old constraint and add new one
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('update', 'article', 'question', 'celebration'));

-- Update privacy_level constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_privacy_level_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_visibility_check;
ALTER TABLE posts ADD CONSTRAINT posts_privacy_level_check CHECK (privacy_level IN ('public', 'connections'));

-- Update default for privacy_level
ALTER TABLE posts ALTER COLUMN privacy_level SET DEFAULT 'connections';

-- Add content length constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_check;
ALTER TABLE posts ADD CONSTRAINT posts_content_check CHECK (length(content) > 0 AND length(content) <= 5000);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy_level);
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(is_deleted) WHERE is_deleted = false;

-- =====================================================
-- CREATE POST_LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- Indexes for post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON post_likes(created_at DESC);

-- =====================================================
-- ALTER POST_COMMENTS TABLE
-- =====================================================

-- Add is_deleted column to post_comments
ALTER TABLE post_comments 
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add content length constraint
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_content_check;
ALTER TABLE post_comments ADD CONSTRAINT post_comments_content_check CHECK (length(content) > 0 AND length(content) <= 2000);

-- Create indexes for post_comments (using user_id instead of author_id)
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at DESC);

-- =====================================================
-- DROP OLD RLS POLICIES
-- =====================================================

-- Drop old posts policies
DROP POLICY IF EXISTS "Users can create their own comments" ON posts;
DROP POLICY IF EXISTS "Users can delete their own comments" ON posts;
DROP POLICY IF EXISTS "Users can update their own comments" ON posts;

-- Drop old post_comments policies
DROP POLICY IF EXISTS "Users can create their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;

-- =====================================================
-- RLS POLICIES - POSTS
-- =====================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view public posts
DROP POLICY IF EXISTS "Anyone can view public posts" ON posts;
CREATE POLICY "Anyone can view public posts"
  ON posts FOR SELECT
  USING (privacy_level = 'public' AND is_deleted = false);

-- Users can view their own posts
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (author_id = auth.uid());

-- Users can view posts from their connections
DROP POLICY IF EXISTS "Users can view connection posts" ON posts;
CREATE POLICY "Users can view connection posts"
  ON posts FOR SELECT
  USING (
    privacy_level = 'connections' AND
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE ((requester_id = auth.uid() AND recipient_id = author_id) OR
             (recipient_id = auth.uid() AND requester_id = author_id))
        AND status = 'accepted'
    )
  );

-- Users can create posts
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own posts
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- =====================================================
-- RLS POLICIES - POST_LIKES
-- =====================================================
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Users can view likes on posts they can see
DROP POLICY IF EXISTS "Users can view likes on visible posts" ON post_likes;
CREATE POLICY "Users can view likes on visible posts"
  ON post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
        AND (
          posts.privacy_level = 'public' OR
          posts.author_id = auth.uid() OR
          (posts.privacy_level = 'connections' AND
           EXISTS (
             SELECT 1 FROM connections
             WHERE ((requester_id = auth.uid() AND recipient_id = posts.author_id) OR
                    (recipient_id = auth.uid() AND requester_id = posts.author_id))
               AND status = 'accepted'
           ))
        )
    )
  );

-- Users can create likes
DROP POLICY IF EXISTS "Users can create likes" ON post_likes;
CREATE POLICY "Users can create likes"
  ON post_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own likes
DROP POLICY IF EXISTS "Users can delete their own likes" ON post_likes;
CREATE POLICY "Users can delete their own likes"
  ON post_likes FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES - POST_COMMENTS (using user_id)
-- =====================================================
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on posts they can see
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON post_comments;
CREATE POLICY "Users can view comments on visible posts"
  ON post_comments FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
        AND (
          posts.privacy_level = 'public' OR
          posts.author_id = auth.uid() OR
          (posts.privacy_level = 'connections' AND
           EXISTS (
             SELECT 1 FROM connections
             WHERE ((requester_id = auth.uid() AND recipient_id = posts.author_id) OR
                    (recipient_id = auth.uid() AND requester_id = posts.author_id))
               AND status = 'accepted'
           ))
        )
    )
  );

-- Users can create comments on posts they can see
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id
        AND (
          posts.privacy_level = 'public' OR
          posts.author_id = auth.uid() OR
          (posts.privacy_level = 'connections' AND
           EXISTS (
             SELECT 1 FROM connections
             WHERE ((requester_id = auth.uid() AND recipient_id = posts.author_id) OR
                    (recipient_id = auth.uid() AND requester_id = posts.author_id))
               AND status = 'accepted'
           ))
        )
    )
  );

-- Users can update their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION get_feed_posts(
  p_user_id UUID,
  p_feed_type TEXT DEFAULT 'all',
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
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN,
  is_connection BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    p.created_at,
    COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) as likes_count,
    COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND is_deleted = false), 0) as comments_count,
    EXISTS (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id) as user_has_liked,
    EXISTS (
      SELECT 1 FROM connections
      WHERE ((requester_id = p_user_id AND recipient_id = p.author_id) OR
             (recipient_id = p_user_id AND requester_id = p.author_id))
        AND status = 'accepted'
    ) as is_connection
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  WHERE p.is_deleted = false
    AND (
      (p_feed_type = 'my_posts' AND p.author_id = p_user_id) OR
      (p_feed_type != 'my_posts' AND p.privacy_level = 'public') OR
      (p_feed_type != 'my_posts' AND p.author_id = p_user_id) OR
      (p_feed_type != 'my_posts' AND p.privacy_level = 'connections' AND
       EXISTS (
         SELECT 1 FROM connections
         WHERE ((requester_id = p_user_id AND recipient_id = p.author_id) OR
                (recipient_id = p_user_id AND requester_id = p.author_id))
           AND status = 'accepted'
       ))
    )
    AND (
      p_feed_type = 'all' OR
      p_feed_type = 'my_posts' OR
      (p_feed_type = 'connections' AND
       EXISTS (
         SELECT 1 FROM connections
         WHERE ((requester_id = p_user_id AND recipient_id = p.author_id) OR
                (recipient_id = p_user_id AND requester_id = p.author_id))
           AND status = 'accepted'
       ))
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION get_post_details(
  p_post_id UUID,
  p_user_id UUID
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
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    p.created_at,
    p.updated_at,
    COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) as likes_count,
    COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND is_deleted = false), 0) as comments_count,
    EXISTS (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id) as user_has_liked
  FROM posts p
  INNER JOIN profiles prof ON p.author_id = prof.id
  WHERE p.id = p_post_id
    AND p.is_deleted = false
    AND (
      p.privacy_level = 'public' OR
      p.author_id = p_user_id OR
      (p.privacy_level = 'connections' AND
       EXISTS (
         SELECT 1 FROM connections
         WHERE ((requester_id = p_user_id AND recipient_id = p.author_id) OR
                (recipient_id = p_user_id AND requester_id = p.author_id))
           AND status = 'accepted'
       ))
    );
END;
$$;

CREATE OR REPLACE FUNCTION get_post_comments(
  p_post_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  comment_id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = p_post_id
      AND p.is_deleted = false
      AND (
        p.privacy_level = 'public' OR
        p.author_id = p_user_id OR
        (p.privacy_level = 'connections' AND
         EXISTS (
           SELECT 1 FROM connections
           WHERE ((requester_id = p_user_id AND recipient_id = p.author_id) OR
                  (recipient_id = p_user_id AND requester_id = p.author_id))
             AND status = 'accepted'
         ))
      )
  ) THEN
    RAISE EXCEPTION 'Post not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    c.id as comment_id,
    c.user_id as author_id,
    prof.username as author_username,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url,
    c.content,
    c.created_at,
    c.updated_at
  FROM post_comments c
  INNER JOIN profiles prof ON c.user_id = prof.id
  WHERE c.post_id = p_post_id
    AND c.is_deleted = false
  ORDER BY c.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_post_likers(
  p_post_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  liked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    prof.id as user_id,
    prof.username,
    prof.full_name,
    prof.avatar_url,
    prof.headline,
    pl.created_at as liked_at
  FROM post_likes pl
  INNER JOIN profiles prof ON pl.user_id = prof.id
  WHERE pl.post_id = p_post_id
  ORDER BY pl.created_at DESC
  LIMIT p_limit;
END;
$$;