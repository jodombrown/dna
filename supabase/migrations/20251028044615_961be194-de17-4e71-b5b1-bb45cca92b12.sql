-- =====================================================
-- GROUP_PRIVACY ENUM
-- =====================================================
CREATE TYPE group_privacy AS ENUM (
  'public',
  'private',
  'secret'
);

CREATE TYPE group_member_role AS ENUM (
  'owner',
  'admin',
  'moderator',
  'member'
);

CREATE TYPE group_join_policy AS ENUM (
  'open',
  'approval_required',
  'invite_only'
);

-- =====================================================
-- GROUPS TABLE
-- =====================================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (length(slug) > 0 AND length(slug) <= 100),
  description TEXT CHECK (length(description) <= 2000),
  
  -- Visual
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Settings
  privacy group_privacy NOT NULL DEFAULT 'public',
  join_policy group_join_policy NOT NULL DEFAULT 'open',
  
  -- Metadata
  category TEXT,
  location TEXT,
  tags TEXT[],
  
  -- Stats
  member_count INT NOT NULL DEFAULT 0,
  post_count INT NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

-- Indexes
CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_privacy ON groups(privacy);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_category ON groups(category);
CREATE INDEX idx_groups_active ON groups(is_active) WHERE is_active = true;
CREATE INDEX idx_groups_search ON groups USING gin(search_vector);
CREATE INDEX idx_groups_tags ON groups USING gin(tags);

-- Updated at trigger
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GROUP_MEMBERS TABLE
-- =====================================================
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role group_member_role NOT NULL DEFAULT 'member',
  
  -- Status
  is_banned BOOLEAN NOT NULL DEFAULT false,
  banned_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES auth.users(id),
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group ON group_members(group_id, role);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

-- Updated at trigger
CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GROUP_JOIN_REQUESTS TABLE
-- =====================================================
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT CHECK (length(message) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_group_join_request UNIQUE (group_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_join_requests_group ON group_join_requests(group_id, status);
CREATE INDEX idx_group_join_requests_user ON group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_status ON group_join_requests(status);

-- =====================================================
-- GROUP_POSTS TABLE
-- =====================================================
CREATE TABLE group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 5000),
  
  -- Media
  image_urls TEXT[],
  
  -- Engagement
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  
  -- Moderation
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_group_posts_group ON group_posts(group_id, created_at DESC);
CREATE INDEX idx_group_posts_author ON group_posts(author_id);
CREATE INDEX idx_group_posts_pinned ON group_posts(group_id, is_pinned) WHERE is_pinned = true;

-- Updated at trigger
CREATE TRIGGER update_group_posts_updated_at
  BEFORE UPDATE ON group_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GROUP_POST_LIKES TABLE
-- =====================================================
CREATE TABLE group_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_group_post_like UNIQUE (post_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_post_likes_post ON group_post_likes(post_id);
CREATE INDEX idx_group_post_likes_user ON group_post_likes(user_id);

-- =====================================================
-- GROUP_POST_COMMENTS TABLE
-- =====================================================
CREATE TABLE group_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_group_post_comments_post ON group_post_comments(post_id, created_at ASC);
CREATE INDEX idx_group_post_comments_author ON group_post_comments(author_id);

-- Updated at trigger
CREATE TRIGGER update_group_post_comments_updated_at
  BEFORE UPDATE ON group_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES - GROUPS
-- =====================================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Anyone can view public groups
CREATE POLICY "Anyone can view public groups"
  ON groups FOR SELECT
  USING (privacy = 'public' AND is_active = true);

-- Members can view private groups they belong to
CREATE POLICY "Members can view their private groups"
  ON groups FOR SELECT
  USING (
    privacy = 'private' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id AND user_id = auth.uid() AND is_banned = false
    )
  );

-- Only members can view secret groups
CREATE POLICY "Members can view secret groups"
  ON groups FOR SELECT
  USING (
    privacy = 'secret' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id AND user_id = auth.uid() AND is_banned = false
    )
  );

-- Users can create groups
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Admins can update their groups
CREATE POLICY "Admins can update groups"
  ON groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND is_banned = false
    )
  );

-- =====================================================
-- RLS POLICIES - GROUP_MEMBERS
-- =====================================================
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Members can view other members of groups they belong to
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_id AND (
        g.privacy = 'public' OR
        EXISTS (
          SELECT 1 FROM group_members gm2
          WHERE gm2.group_id = g.id AND gm2.user_id = auth.uid() AND gm2.is_banned = false
        )
      )
    )
  );

-- Users can join groups (insert will be validated by triggers)
CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can leave groups
CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (user_id = auth.uid() AND role != 'owner');

-- Admins can update member roles
CREATE POLICY "Admins can update members"
  ON group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role IN ('owner', 'admin')
        AND gm.is_banned = false
    )
  );

-- =====================================================
-- RLS POLICIES - GROUP_JOIN_REQUESTS
-- =====================================================
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own join requests"
  ON group_join_requests FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view requests for their groups
CREATE POLICY "Admins can view group join requests"
  ON group_join_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_join_requests.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'moderator')
        AND is_banned = false
    )
  );

-- Users can create join requests
CREATE POLICY "Users can create join requests"
  ON group_join_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update requests
CREATE POLICY "Admins can update join requests"
  ON group_join_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_join_requests.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'moderator')
        AND is_banned = false
    )
  );

-- =====================================================
-- RLS POLICIES - GROUP_POSTS
-- =====================================================
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- Members can view posts in their groups
CREATE POLICY "Members can view group posts"
  ON group_posts FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
      WHERE g.id = group_id AND (
        (g.privacy = 'public') OR
        (gm.user_id IS NOT NULL AND gm.is_banned = false)
      )
    )
  );

-- Members can create posts in their groups
CREATE POLICY "Members can create posts"
  ON group_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_posts.group_id
        AND user_id = auth.uid()
        AND is_banned = false
    )
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update their posts"
  ON group_posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their posts"
  ON group_posts FOR DELETE
  USING (author_id = auth.uid());

-- Moderators can update/delete any post
CREATE POLICY "Moderators can manage posts"
  ON group_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_posts.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'moderator')
        AND is_banned = false
    )
  );

-- =====================================================
-- RLS POLICIES - GROUP_POST_LIKES
-- =====================================================
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;

-- Members can view likes
CREATE POLICY "Members can view likes"
  ON group_post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_posts gp
      INNER JOIN groups g ON g.id = gp.group_id
      LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
      WHERE gp.id = post_id AND (
        g.privacy = 'public' OR
        (gm.user_id IS NOT NULL AND gm.is_banned = false)
      )
    )
  );

-- Members can like posts
CREATE POLICY "Members can like posts"
  ON group_post_likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_posts gp
      INNER JOIN group_members gm ON gm.group_id = gp.group_id
      WHERE gp.id = post_id 
        AND gm.user_id = auth.uid()
        AND gm.is_banned = false
    )
  );

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
  ON group_post_likes FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES - GROUP_POST_COMMENTS
-- =====================================================
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- Members can view comments
CREATE POLICY "Members can view comments"
  ON group_post_comments FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM group_posts gp
      INNER JOIN groups g ON g.id = gp.group_id
      LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
      WHERE gp.id = post_id AND (
        g.privacy = 'public' OR
        (gm.user_id IS NOT NULL AND gm.is_banned = false)
      )
    )
  );

-- Members can comment
CREATE POLICY "Members can create comments"
  ON group_post_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_posts gp
      INNER JOIN group_members gm ON gm.group_id = gp.group_id
      WHERE gp.id = post_id
        AND gm.user_id = auth.uid()
        AND gm.is_banned = false
    )
  );

-- Authors can update their comments
CREATE POLICY "Authors can update comments"
  ON group_post_comments FOR UPDATE
  USING (author_id = auth.uid());

-- Authors can delete their comments
CREATE POLICY "Authors can delete comments"
  ON group_post_comments FOR DELETE
  USING (author_id = auth.uid());

-- =====================================================
-- TRIGGERS: Update Counters
-- =====================================================

-- Update member count when member added/removed
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_member_count
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- Update post count when post added/removed
CREATE OR REPLACE FUNCTION update_group_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET post_count = post_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_post_count
  AFTER INSERT OR DELETE ON group_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_group_post_count();

-- Update like count
CREATE OR REPLACE FUNCTION update_group_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_post_like_count
  AFTER INSERT OR DELETE ON group_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_group_post_like_count();

-- Update comment count
CREATE OR REPLACE FUNCTION update_group_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_post_comment_count
  AFTER INSERT OR DELETE ON group_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_group_post_comment_count();

-- Auto-add creator as owner when group created
CREATE OR REPLACE FUNCTION auto_add_group_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_add_group_owner
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_group_owner();

-- =====================================================
-- RPC FUNCTION: get_groups
-- =====================================================
CREATE OR REPLACE FUNCTION get_groups(
  p_user_id UUID,
  p_filter TEXT DEFAULT 'all',
  p_category TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  group_id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  privacy group_privacy,
  join_policy group_join_policy,
  category TEXT,
  location TEXT,
  member_count INT,
  post_count INT,
  created_at TIMESTAMPTZ,
  is_member BOOLEAN,
  user_role group_member_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id as group_id,
    g.name,
    g.slug,
    g.description,
    g.avatar_url,
    g.cover_image_url,
    g.privacy,
    g.join_policy,
    g.category,
    g.location,
    g.member_count,
    g.post_count,
    g.created_at,
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
    ) as is_member,
    (
      SELECT role FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
    ) as user_role
  FROM groups g
  WHERE g.is_active = true
    AND (
      (p_filter = 'all' AND g.privacy = 'public') OR
      (p_filter = 'my_groups' AND EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
      )) OR
      (p_filter = 'popular' AND g.privacy = 'public' AND g.member_count > 5) OR
      (p_filter = 'recommended' AND g.privacy = 'public')
    )
    AND (p_category IS NULL OR g.category = p_category)
    AND (
      p_search IS NULL OR
      g.search_vector @@ plainto_tsquery('english', p_search)
    )
  ORDER BY 
    CASE WHEN p_filter = 'popular' THEN g.member_count END DESC,
    g.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_group_details
-- =====================================================
CREATE OR REPLACE FUNCTION get_group_details(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  group_id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  privacy group_privacy,
  join_policy group_join_policy,
  category TEXT,
  location TEXT,
  tags TEXT[],
  member_count INT,
  post_count INT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  is_member BOOLEAN,
  user_role group_member_role,
  can_post BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id as group_id,
    g.name,
    g.slug,
    g.description,
    g.avatar_url,
    g.cover_image_url,
    g.privacy,
    g.join_policy,
    g.category,
    g.location,
    g.tags,
    g.member_count,
    g.post_count,
    g.created_by,
    g.created_at,
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
    ) as is_member,
    (
      SELECT role FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
    ) as user_role,
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
    ) as can_post
  FROM groups g
  WHERE g.id = p_group_id
    AND (
      g.privacy = 'public' OR
      EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = p_user_id AND gm.is_banned = false
      )
    );
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_group_members
-- =====================================================
CREATE OR REPLACE FUNCTION get_group_members(
  p_group_id UUID,
  p_role group_member_role DEFAULT NULL
)
RETURNS TABLE (
  member_id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  role group_member_role,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.id as member_id,
    gm.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.headline,
    gm.role,
    gm.joined_at
  FROM group_members gm
  INNER JOIN profiles p ON gm.user_id = p.id
  WHERE gm.group_id = p_group_id
    AND gm.is_banned = false
    AND (p_role IS NULL OR gm.role = p_role)
  ORDER BY 
    CASE gm.role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'moderator' THEN 3
      WHEN 'member' THEN 4
    END,
    gm.joined_at ASC;
END;
$$;

-- =====================================================
-- RPC FUNCTION: get_group_posts
-- =====================================================
CREATE OR REPLACE FUNCTION get_group_posts(
  p_group_id UUID,
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  image_urls TEXT[],
  like_count INT,
  comment_count INT,
  is_pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  user_has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gp.id as post_id,
    gp.author_id,
    p.username as author_username,
    p.full_name as author_full_name,
    p.avatar_url as author_avatar_url,
    gp.content,
    gp.image_urls,
    gp.like_count,
    gp.comment_count,
    gp.is_pinned,
    gp.created_at,
    EXISTS (
      SELECT 1 FROM group_post_likes gpl
      WHERE gpl.post_id = gp.id AND gpl.user_id = p_user_id
    ) as user_has_liked
  FROM group_posts gp
  INNER JOIN profiles p ON gp.author_id = p.id
  WHERE gp.group_id = p_group_id
    AND gp.is_deleted = false
  ORDER BY gp.is_pinned DESC, gp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;