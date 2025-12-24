-- ============================================
-- DNA HASHTAG SYSTEM - Phase 1 Enhancement
-- Adds hashtags table, followers, reserved hashtags
-- ============================================

-- ============================================
-- ENUM TYPES
-- ============================================

-- Hashtag type (community now, personal in Phase 2)
DO $$ BEGIN
  CREATE TYPE hashtag_type AS ENUM ('community', 'personal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Hashtag status
DO $$ BEGIN
  CREATE TYPE hashtag_status AS ENUM ('active', 'archived', 'suspended', 'reserved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Reserved hashtag categories
DO $$ BEGIN
  CREATE TYPE reserved_category AS ENUM (
    'country',
    'public_figure',
    'company',
    'government',
    'offensive',
    'system',
    'trademark'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Post-hashtag status (for Phase 2 approval flow)
DO $$ BEGIN
  CREATE TYPE hashtag_usage_status AS ENUM ('active', 'pending', 'denied', 'removed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- ============================================
-- HASHTAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name TEXT NOT NULL UNIQUE, -- lowercase, no #
  display_name TEXT NOT NULL, -- preserves original case

  -- Type and ownership (owner_id used in Phase 2)
  type hashtag_type NOT NULL DEFAULT 'community',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  description TEXT,
  status hashtag_status NOT NULL DEFAULT 'active',
  is_verified BOOLEAN DEFAULT false, -- official DNA hashtags

  -- Denormalized counts for performance
  usage_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,

  -- For personal hashtags (Phase 2)
  pinned_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);
CREATE INDEX IF NOT EXISTS idx_hashtags_type ON hashtags(type);
CREATE INDEX IF NOT EXISTS idx_hashtags_status ON hashtags(status);
CREATE INDEX IF NOT EXISTS idx_hashtags_owner ON hashtags(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hashtags_usage_count ON hashtags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_hashtags_created_at ON hashtags(created_at DESC);


-- ============================================
-- HASHTAG FOLLOWERS
-- ============================================

CREATE TABLE IF NOT EXISTS hashtag_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate follows
  UNIQUE(hashtag_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtag_followers_hashtag ON hashtag_followers(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_followers_user ON hashtag_followers(user_id);


-- ============================================
-- RESERVED HASHTAGS
-- ============================================

CREATE TABLE IF NOT EXISTS reserved_hashtags (
  name TEXT PRIMARY KEY, -- lowercase, no #
  category reserved_category NOT NULL,
  reason TEXT,
  can_be_used BOOLEAN DEFAULT true, -- can people USE it (just not own)?
  claimable_with_verification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'system' -- 'system', 'manual', 'user_report'
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reserved_hashtags_category ON reserved_hashtags(category);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_hashtags ENABLE ROW LEVEL SECURITY;

-- Hashtags: Anyone can read
DROP POLICY IF EXISTS "Anyone can view hashtags" ON hashtags;
CREATE POLICY "Anyone can view hashtags"
  ON hashtags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create community hashtags" ON hashtags;
CREATE POLICY "Users can create community hashtags"
  ON hashtags FOR INSERT
  TO authenticated
  WITH CHECK (type = 'community' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "System can update hashtags" ON hashtags;
CREATE POLICY "System can update hashtags"
  ON hashtags FOR UPDATE
  USING (true);

-- Hashtag Followers: Anyone can read, users manage their own
DROP POLICY IF EXISTS "Anyone can view hashtag followers" ON hashtag_followers;
CREATE POLICY "Anyone can view hashtag followers"
  ON hashtag_followers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow hashtags" ON hashtag_followers;
CREATE POLICY "Users can follow hashtags"
  ON hashtag_followers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unfollow hashtags" ON hashtag_followers;
CREATE POLICY "Users can unfollow hashtags"
  ON hashtag_followers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Reserved Hashtags: Anyone can read
DROP POLICY IF EXISTS "Anyone can view reserved hashtags" ON reserved_hashtags;
CREATE POLICY "Anyone can view reserved hashtags"
  ON reserved_hashtags FOR SELECT
  USING (true);


-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get or create hashtag
CREATE OR REPLACE FUNCTION get_or_create_hashtag(
  p_name TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hashtag_id UUID;
  v_name TEXT;
  v_display TEXT;
BEGIN
  -- Normalize name (lowercase, no #)
  v_name := lower(regexp_replace(p_name, '^#', ''));
  v_display := COALESCE(p_display_name, p_name);
  v_display := regexp_replace(v_display, '^#', '');

  -- Check if reserved and cannot be used
  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_name AND can_be_used = false) THEN
    RAISE EXCEPTION 'Hashtag % is reserved and cannot be used', v_name;
  END IF;

  -- Get existing or create new
  SELECT id INTO v_hashtag_id FROM hashtags WHERE name = v_name;

  IF v_hashtag_id IS NULL THEN
    INSERT INTO hashtags (name, display_name, type)
    VALUES (v_name, v_display, 'community')
    RETURNING id INTO v_hashtag_id;
  END IF;

  RETURN v_hashtag_id;
END;
$$;


-- Function to process hashtags for a post (enhanced version)
CREATE OR REPLACE FUNCTION process_post_hashtags_enhanced(
  p_post_id UUID,
  p_user_id UUID,
  p_content TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hashtag TEXT;
  v_hashtag_id UUID;
  v_hashtags TEXT[];
BEGIN
  -- Extract hashtags from content
  SELECT array_agg(DISTINCT LOWER(substring(match FROM 2)))
  INTO v_hashtags
  FROM regexp_matches(p_content, '#([A-Za-z0-9_]+)', 'g') AS match;

  IF v_hashtags IS NULL THEN
    RETURN;
  END IF;

  -- Process each hashtag
  FOREACH v_hashtag IN ARRAY v_hashtags
  LOOP
    BEGIN
      -- Get or create the hashtag
      v_hashtag_id := get_or_create_hashtag(v_hashtag);

      -- Increment usage count
      UPDATE hashtags
      SET usage_count = usage_count + 1, updated_at = now()
      WHERE id = v_hashtag_id;
    EXCEPTION WHEN OTHERS THEN
      -- Skip reserved hashtags that can't be used
      CONTINUE;
    END;
  END LOOP;
END;
$$;


-- Enhanced get_trending_hashtags that returns more data
CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_limit INTEGER DEFAULT 10,
  p_timeframe_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  type hashtag_type,
  usage_count INTEGER,
  follower_count INTEGER,
  recent_uses BIGINT,
  trending_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH recent_usage AS (
    SELECT
      ph.hashtag as tag_name,
      COUNT(*) as recent_count,
      COUNT(DISTINCT p.author_id) as unique_users
    FROM post_hashtags ph
    JOIN posts p ON p.id = ph.post_id
    WHERE ph.created_at > now() - (p_timeframe_hours || ' hours')::INTERVAL
      AND p.is_deleted = false
      AND p.status = 'published'
    GROUP BY ph.hashtag
  )
  SELECT
    h.id,
    h.name,
    h.display_name,
    h.type,
    h.usage_count,
    h.follower_count,
    COALESCE(ru.recent_count, 0) as recent_uses,
    -- Trending score: recent uses * recency weight + unique users bonus
    (COALESCE(ru.recent_count, 0) * 10 + COALESCE(ru.unique_users, 0) * 5 + h.follower_count)::NUMERIC as trending_score
  FROM hashtags h
  LEFT JOIN recent_usage ru ON ru.tag_name = h.name
  WHERE h.status = 'active'
    AND (ru.recent_count > 0 OR h.usage_count > 5) -- Must have some activity
  ORDER BY trending_score DESC, h.usage_count DESC
  LIMIT p_limit;
END;
$$;


-- Function to get hashtag details with user context
CREATE OR REPLACE FUNCTION get_hashtag_details(
  p_hashtag_name TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  type hashtag_type,
  owner_id UUID,
  owner_name TEXT,
  owner_username TEXT,
  owner_avatar TEXT,
  description TEXT,
  status hashtag_status,
  is_verified BOOLEAN,
  usage_count INTEGER,
  follower_count INTEGER,
  is_following BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_name TEXT;
BEGIN
  -- Normalize name
  v_name := lower(regexp_replace(p_hashtag_name, '^#', ''));

  RETURN QUERY
  SELECT
    h.id,
    h.name,
    h.display_name,
    h.type,
    h.owner_id,
    p.display_name as owner_name,
    p.username as owner_username,
    p.avatar_url as owner_avatar,
    h.description,
    h.status,
    h.is_verified,
    h.usage_count,
    h.follower_count,
    EXISTS(
      SELECT 1 FROM hashtag_followers hf
      WHERE hf.hashtag_id = h.id AND hf.user_id = p_user_id
    ) as is_following,
    h.created_at
  FROM hashtags h
  LEFT JOIN profiles p ON p.id = h.owner_id
  WHERE h.name = v_name;
END;
$$;


-- Function to get posts by hashtag (enhanced)
CREATE OR REPLACE FUNCTION get_hashtag_posts(
  p_hashtag_name TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort TEXT DEFAULT 'recent'
)
RETURNS TABLE (
  post_id UUID,
  content TEXT,
  media_urls TEXT[],
  author_id UUID,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  author_headline TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  reshare_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_name TEXT;
BEGIN
  -- Normalize name
  v_name := lower(regexp_replace(p_hashtag_name, '^#', ''));

  RETURN QUERY
  SELECT
    p.id as post_id,
    p.content,
    ARRAY[p.media_url] FILTER (WHERE p.media_url IS NOT NULL) as media_urls,
    p.author_id,
    pr.display_name as author_name,
    pr.username as author_username,
    pr.avatar_url as author_avatar,
    pr.headline as author_headline,
    COALESCE(p.like_count, 0)::INTEGER as like_count,
    COALESCE(p.comment_count, 0)::INTEGER as comment_count,
    COALESCE(p.reshare_count, 0)::INTEGER as reshare_count,
    p.created_at
  FROM posts p
  JOIN post_hashtags ph ON ph.post_id = p.id
  JOIN profiles pr ON pr.id = p.author_id
  WHERE LOWER(ph.hashtag) = v_name
    AND p.is_deleted = false
    AND p.status = 'published'
  ORDER BY
    CASE WHEN p_sort = 'top' THEN COALESCE(p.like_count, 0) + COALESCE(p.comment_count, 0) * 2 END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


-- Function to follow/unfollow hashtag
CREATE OR REPLACE FUNCTION toggle_hashtag_follow(
  p_hashtag_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN -- true if now following, false if unfollowed
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_was_following BOOLEAN;
BEGIN
  -- Check if already following
  SELECT EXISTS(
    SELECT 1 FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id
  ) INTO v_was_following;

  IF v_was_following THEN
    -- Unfollow
    DELETE FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id;

    -- Decrement count
    UPDATE hashtags
    SET follower_count = GREATEST(follower_count - 1, 0), updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN false;
  ELSE
    -- Follow
    INSERT INTO hashtag_followers (hashtag_id, user_id)
    VALUES (p_hashtag_id, p_user_id);

    -- Increment count
    UPDATE hashtags
    SET follower_count = follower_count + 1, updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN true;
  END IF;
END;
$$;


-- Function to search hashtags (for autocomplete)
CREATE OR REPLACE FUNCTION search_hashtags(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  type hashtag_type,
  usage_count INTEGER,
  follower_count INTEGER,
  is_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_query TEXT;
BEGIN
  -- Normalize query (lowercase, no #)
  v_query := lower(regexp_replace(p_query, '^#', ''));

  RETURN QUERY
  SELECT
    h.id,
    h.name,
    h.display_name,
    h.type,
    h.usage_count,
    h.follower_count,
    h.is_verified
  FROM hashtags h
  WHERE h.status = 'active'
    AND h.name LIKE v_query || '%'
  ORDER BY
    CASE WHEN h.name = v_query THEN 0 ELSE 1 END, -- Exact match first
    h.usage_count DESC
  LIMIT p_limit;
END;
$$;


-- Function to check if hashtag is reserved
CREATE OR REPLACE FUNCTION is_hashtag_reserved(p_name TEXT)
RETURNS TABLE (
  is_reserved BOOLEAN,
  category reserved_category,
  reason TEXT,
  can_be_used BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_name TEXT;
  v_found BOOLEAN := false;
BEGIN
  v_name := lower(regexp_replace(p_name, '^#', ''));

  -- Check if reserved
  FOR is_reserved, category, reason, can_be_used IN
    SELECT true, rh.category, rh.reason, rh.can_be_used
    FROM reserved_hashtags rh
    WHERE rh.name = v_name
  LOOP
    v_found := true;
    RETURN NEXT;
  END LOOP;

  -- If no rows returned, hashtag is not reserved
  IF NOT v_found THEN
    is_reserved := false;
    category := NULL;
    reason := NULL;
    can_be_used := true;
    RETURN NEXT;
  END IF;
END;
$$;


-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION get_or_create_hashtag(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_post_hashtags_enhanced(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_hashtags(INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_hashtag_details(TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_hashtag_posts(TEXT, INTEGER, INTEGER, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION toggle_hashtag_follow(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_hashtags(TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_hashtag_reserved(TEXT) TO authenticated, anon;


-- ============================================
-- TRIGGER TO POPULATE HASHTAGS TABLE
-- ============================================

-- Update the sync trigger to also create/update hashtag records
CREATE OR REPLACE FUNCTION sync_post_hashtags_with_table()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hashtag_array TEXT[];
  hashtag TEXT;
BEGIN
  -- Extract hashtags from new content
  SELECT array_agg(DISTINCT LOWER(substring(match FROM 2)))
  INTO hashtag_array
  FROM regexp_matches(NEW.content, '#([A-Za-z0-9_]+)', 'g') AS match;

  -- Delete old hashtags for this post
  DELETE FROM post_hashtags WHERE post_id = NEW.id;

  -- Insert new hashtags and update hashtags table
  IF array_length(hashtag_array, 1) > 0 THEN
    FOREACH hashtag IN ARRAY hashtag_array
    LOOP
      -- Insert into post_hashtags
      INSERT INTO post_hashtags (post_id, hashtag)
      VALUES (NEW.id, hashtag)
      ON CONFLICT (post_id, hashtag) DO NOTHING;

      -- Ensure hashtag exists in hashtags table
      INSERT INTO hashtags (name, display_name, type, usage_count)
      VALUES (hashtag, hashtag, 'community', 1)
      ON CONFLICT (name) DO UPDATE SET
        usage_count = hashtags.usage_count + 1,
        updated_at = now();
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Replace the old trigger
DROP TRIGGER IF EXISTS sync_hashtags_on_post_change ON posts;
CREATE TRIGGER sync_hashtags_on_post_change
  AFTER INSERT OR UPDATE OF content
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_post_hashtags_with_table();


-- ============================================
-- SEED RESERVED HASHTAGS
-- ============================================

-- System reserved (cannot be owned or used as personal)
INSERT INTO reserved_hashtags (name, category, reason, can_be_used, source) VALUES
  ('trending', 'system', 'DNA platform feature', false, 'system'),
  ('foryou', 'system', 'DNA platform feature', false, 'system'),
  ('explore', 'system', 'DNA platform feature', false, 'system'),
  ('connect', 'system', 'DNA 5 Cs methodology', false, 'system'),
  ('convene', 'system', 'DNA 5 Cs methodology', false, 'system'),
  ('collaborate', 'system', 'DNA 5 Cs methodology', false, 'system'),
  ('contribute', 'system', 'DNA 5 Cs methodology', false, 'system'),
  ('convey', 'system', 'DNA 5 Cs methodology', false, 'system'),
  ('dna', 'system', 'DNA platform name', false, 'system'),
  ('dnaplatform', 'system', 'DNA platform name', false, 'system'),
  ('diasporanetwork', 'system', 'DNA platform name', false, 'system')
ON CONFLICT (name) DO NOTHING;

-- African countries (can be used, not owned)
INSERT INTO reserved_hashtags (name, category, reason, can_be_used, source) VALUES
  ('nigeria', 'country', 'Country name', true, 'system'),
  ('ghana', 'country', 'Country name', true, 'system'),
  ('kenya', 'country', 'Country name', true, 'system'),
  ('southafrica', 'country', 'Country name', true, 'system'),
  ('ethiopia', 'country', 'Country name', true, 'system'),
  ('egypt', 'country', 'Country name', true, 'system'),
  ('morocco', 'country', 'Country name', true, 'system'),
  ('tanzania', 'country', 'Country name', true, 'system'),
  ('uganda', 'country', 'Country name', true, 'system'),
  ('senegal', 'country', 'Country name', true, 'system'),
  ('cameroon', 'country', 'Country name', true, 'system'),
  ('ivorycoast', 'country', 'Country name', true, 'system'),
  ('cotedivoire', 'country', 'Country name', true, 'system'),
  ('rwanda', 'country', 'Country name', true, 'system'),
  ('zimbabwe', 'country', 'Country name', true, 'system'),
  ('botswana', 'country', 'Country name', true, 'system'),
  ('namibia', 'country', 'Country name', true, 'system'),
  ('zambia', 'country', 'Country name', true, 'system'),
  ('malawi', 'country', 'Country name', true, 'system'),
  ('mozambique', 'country', 'Country name', true, 'system'),
  ('angola', 'country', 'Country name', true, 'system'),
  ('drc', 'country', 'Country name', true, 'system'),
  ('congo', 'country', 'Country name', true, 'system'),
  ('mali', 'country', 'Country name', true, 'system'),
  ('niger', 'country', 'Country name', true, 'system'),
  ('benin', 'country', 'Country name', true, 'system'),
  ('togo', 'country', 'Country name', true, 'system'),
  ('burkinafaso', 'country', 'Country name', true, 'system'),
  ('gambia', 'country', 'Country name', true, 'system'),
  ('sierraleone', 'country', 'Country name', true, 'system'),
  ('liberia', 'country', 'Country name', true, 'system'),
  ('guineabissau', 'country', 'Country name', true, 'system'),
  ('guinea', 'country', 'Country name', true, 'system'),
  ('mauritania', 'country', 'Country name', true, 'system'),
  ('algeria', 'country', 'Country name', true, 'system'),
  ('tunisia', 'country', 'Country name', true, 'system'),
  ('libya', 'country', 'Country name', true, 'system'),
  ('sudan', 'country', 'Country name', true, 'system'),
  ('southsudan', 'country', 'Country name', true, 'system'),
  ('eritrea', 'country', 'Country name', true, 'system'),
  ('djibouti', 'country', 'Country name', true, 'system'),
  ('somalia', 'country', 'Country name', true, 'system'),
  ('madagascar', 'country', 'Country name', true, 'system'),
  ('mauritius', 'country', 'Country name', true, 'system'),
  ('seychelles', 'country', 'Country name', true, 'system'),
  ('comoros', 'country', 'Country name', true, 'system'),
  ('capeverde', 'country', 'Country name', true, 'system'),
  ('saotome', 'country', 'Country name', true, 'system'),
  ('equatorialguinea', 'country', 'Country name', true, 'system'),
  ('gabon', 'country', 'Country name', true, 'system'),
  ('centralafricanrepublic', 'country', 'Country name', true, 'system'),
  ('chad', 'country', 'Country name', true, 'system'),
  ('burundi', 'country', 'Country name', true, 'system'),
  ('lesotho', 'country', 'Country name', true, 'system'),
  ('eswatini', 'country', 'Country name', true, 'system'),
  ('swaziland', 'country', 'Country name', true, 'system')
ON CONFLICT (name) DO NOTHING;

-- Major diaspora countries
INSERT INTO reserved_hashtags (name, category, reason, can_be_used, source) VALUES
  ('usa', 'country', 'Country name', true, 'system'),
  ('unitedstates', 'country', 'Country name', true, 'system'),
  ('america', 'country', 'Country name', true, 'system'),
  ('uk', 'country', 'Country name', true, 'system'),
  ('unitedkingdom', 'country', 'Country name', true, 'system'),
  ('britain', 'country', 'Country name', true, 'system'),
  ('england', 'country', 'Country name', true, 'system'),
  ('canada', 'country', 'Country name', true, 'system'),
  ('france', 'country', 'Country name', true, 'system'),
  ('germany', 'country', 'Country name', true, 'system'),
  ('brazil', 'country', 'Country name', true, 'system'),
  ('jamaica', 'country', 'Country name', true, 'system'),
  ('haiti', 'country', 'Country name', true, 'system'),
  ('trinidadandtobago', 'country', 'Country name', true, 'system'),
  ('barbados', 'country', 'Country name', true, 'system'),
  ('netherlands', 'country', 'Country name', true, 'system'),
  ('belgium', 'country', 'Country name', true, 'system'),
  ('italy', 'country', 'Country name', true, 'system'),
  ('spain', 'country', 'Country name', true, 'system'),
  ('portugal', 'country', 'Country name', true, 'system'),
  ('uae', 'country', 'Country name', true, 'system'),
  ('dubai', 'country', 'City/Country name', true, 'system'),
  ('china', 'country', 'Country name', true, 'system'),
  ('india', 'country', 'Country name', true, 'system'),
  ('australia', 'country', 'Country name', true, 'system')
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- MIGRATE EXISTING HASHTAGS
-- ============================================

-- Populate hashtags table from existing post_hashtags
INSERT INTO hashtags (name, display_name, type, usage_count, created_at)
SELECT
  LOWER(ph.hashtag) as name,
  ph.hashtag as display_name,
  'community'::hashtag_type as type,
  COUNT(*) as usage_count,
  MIN(ph.created_at) as created_at
FROM post_hashtags ph
GROUP BY LOWER(ph.hashtag), ph.hashtag
ON CONFLICT (name) DO UPDATE SET
  usage_count = EXCLUDED.usage_count;


-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify installation:
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name LIKE '%hashtag%';
-- Expected: 8+ functions
