-- ============================================
-- HASHTAG SYSTEM RECONCILIATION
--
-- Supersedes 20241223_hashtag_system_phase1.sql and
-- 20241224_hashtag_ownership_phase2.sql (both removed in this change).
--
-- Those two files were mis-timestamped against a fresh replay: they
-- predate the migrations that create `profiles`, `posts`, and
-- `post_hashtags`, so a from-scratch build (e.g. CI's Supabase Preview
-- check) fails immediately on "relation profiles does not exist".
-- Production itself was never broken by this, because these files were
-- never applied through tracked migration history (they do not appear
-- in supabase_migrations.schema_migrations) — the real hashtags system
-- was built directly against the live database, on top of the tag-based
-- `hashtags`/`post_hashtags` tables from 20251107143319, layering in
-- ownership, following, and moderation. That is the schema this file
-- reconstructs, matching the current live database exactly, so this
-- migration is a no-op on production and a correct build from scratch.
--
-- Reordering alone was not enough: the old phase1 file also defines
-- get_trending_hashtags(integer, integer) with a different return
-- shape than the one added in 20251107143319, and Postgres refuses to
-- CREATE OR REPLACE a function across a return-type change. This file
-- drops that function first so the real (hybrid) definition below can
-- replace it cleanly.
-- ============================================

-- ============================================
-- ENUM TYPES
-- ============================================

DO $$ BEGIN
  CREATE TYPE hashtag_type AS ENUM ('community', 'personal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hashtag_status AS ENUM ('active', 'archived', 'suspended', 'reserved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- ============================================
-- HASHTAGS TABLE — add the ownership/moderation columns onto the
-- tag-based table created by 20251107143319
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'type') THEN
    ALTER TABLE hashtags ADD COLUMN type hashtag_type DEFAULT 'community';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'owner_id') THEN
    ALTER TABLE hashtags ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'description') THEN
    ALTER TABLE hashtags ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'status') THEN
    ALTER TABLE hashtags ADD COLUMN status hashtag_status DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'is_verified') THEN
    ALTER TABLE hashtags ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'follower_count') THEN
    ALTER TABLE hashtags ADD COLUMN follower_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'updated_at') THEN
    ALTER TABLE hashtags ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'is_personal') THEN
    ALTER TABLE hashtags ADD COLUMN is_personal BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'requires_approval') THEN
    ALTER TABLE hashtags ADD COLUMN requires_approval BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'archived_at') THEN
    ALTER TABLE hashtags ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hashtags_owner_id ON hashtags(owner_id);

-- ============================================
-- HASHTAG FOLLOWERS
-- ============================================

CREATE TABLE IF NOT EXISTS hashtag_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hashtag_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hashtag_followers_hashtag ON hashtag_followers(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_followers_user ON hashtag_followers(user_id);

ALTER TABLE hashtag_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own hashtag follows" ON hashtag_followers;
CREATE POLICY "Users view their own hashtag follows"
  ON hashtag_followers FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can follow hashtags" ON hashtag_followers;
CREATE POLICY "Users can follow hashtags"
  ON hashtag_followers FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can unfollow hashtags" ON hashtag_followers;
CREATE POLICY "Users can unfollow hashtags"
  ON hashtag_followers FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================
-- RESERVED HASHTAGS
-- ============================================

CREATE TABLE IF NOT EXISTS reserved_hashtags (
  name TEXT PRIMARY KEY,
  category reserved_category NOT NULL,
  reason TEXT,
  can_be_used BOOLEAN DEFAULT true,
  claimable_with_verification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_reserved_hashtags_category ON reserved_hashtags(category);

ALTER TABLE reserved_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reserved hashtags" ON reserved_hashtags;
CREATE POLICY "Anyone can view reserved hashtags"
  ON reserved_hashtags FOR SELECT
  USING (true);

-- ============================================
-- HASHTAG USAGE REQUESTS (approval flow for personal hashtags)
-- ============================================

CREATE TABLE IF NOT EXISTS hashtag_usage_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hashtag_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_hashtag_requests_hashtag ON hashtag_usage_requests(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_owner ON hashtag_usage_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_requester ON hashtag_usage_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_status ON hashtag_usage_requests(status);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_pending ON hashtag_usage_requests(owner_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_hashtag_usage_requests_post_id ON hashtag_usage_requests(post_id);

ALTER TABLE hashtag_usage_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own requests" ON hashtag_usage_requests;
CREATE POLICY "Users can view their own requests"
  ON hashtag_usage_requests FOR SELECT
  USING (requester_id = (SELECT auth.uid()) OR owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create requests" ON hashtag_usage_requests;
CREATE POLICY "Users can create requests"
  ON hashtag_usage_requests FOR INSERT
  WITH CHECK (requester_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Owners can update request status" ON hashtag_usage_requests;
CREATE POLICY "Owners can update request status"
  ON hashtag_usage_requests FOR UPDATE
  USING (owner_id = (SELECT auth.uid()));

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_hashtag(
  p_name TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
  v_tag TEXT;
BEGIN
  v_tag := lower(regexp_replace(p_name, '^#', ''));

  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_tag AND can_be_used = false) THEN
    RAISE EXCEPTION 'Hashtag % is reserved and cannot be used', v_tag;
  END IF;

  SELECT id INTO v_hashtag_id FROM hashtags WHERE tag = v_tag;

  IF v_hashtag_id IS NULL THEN
    INSERT INTO hashtags (tag, type, usage_count, first_used_at, last_used_at, status)
    VALUES (v_tag, 'community', 0, now(), now(), 'active')
    RETURNING id INTO v_hashtag_id;
  END IF;

  RETURN v_hashtag_id;
END;
$$;

CREATE OR REPLACE FUNCTION process_post_hashtags(
  p_post_id UUID,
  p_user_id UUID,
  p_content TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag TEXT;
  v_hashtag_id UUID;
  v_hashtags TEXT[];
  v_owner_id UUID;
  v_is_personal BOOLEAN;
  v_requires_approval BOOLEAN;
BEGIN
  v_hashtags := extract_hashtags(p_content);

  FOREACH v_hashtag IN ARRAY v_hashtags
  LOOP
    BEGIN
      v_hashtag_id := get_or_create_hashtag(v_hashtag);

      SELECT owner_id, is_personal, requires_approval
      INTO v_owner_id, v_is_personal, v_requires_approval
      FROM hashtags WHERE id = v_hashtag_id;

      IF v_is_personal AND v_requires_approval AND v_owner_id IS NOT NULL AND v_owner_id != p_user_id THEN
        PERFORM request_hashtag_usage(p_user_id, v_hashtag_id, p_post_id);
        CONTINUE;
      END IF;

      INSERT INTO post_hashtags (post_id, hashtag_id)
      VALUES (p_post_id, v_hashtag_id)
      ON CONFLICT (post_id, hashtag_id) DO NOTHING;

      UPDATE hashtags
      SET usage_count = usage_count + 1,
          last_used_at = now(),
          updated_at = now()
      WHERE id = v_hashtag_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error processing hashtag %: %', v_hashtag, SQLERRM;
        CONTINUE;
    END;
  END LOOP;
END;
$$;

-- Return type changed from the 20251107143319 definition (tag, usage_count,
-- recent_usage_count) — must drop before CREATE OR REPLACE will accept it.
DROP FUNCTION IF EXISTS get_trending_hashtags(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  tag TEXT,
  name TEXT,
  display_name TEXT,
  type TEXT,
  usage_count INTEGER,
  follower_count INTEGER,
  recent_uses BIGINT,
  trending_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH recent_usage AS (
    SELECT
      ph.hashtag_id,
      COUNT(*) as recent_count
    FROM post_hashtags ph
    JOIN posts p ON p.id = ph.post_id
    WHERE ph.created_at > now() - (p_days || ' days')::INTERVAL
      AND p.is_deleted = false
    GROUP BY ph.hashtag_id
  )
  SELECT
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    h.usage_count,
    COALESCE(h.follower_count, 0) as follower_count,
    COALESCE(ru.recent_count, 0) as recent_uses,
    (COALESCE(ru.recent_count, 0) * 10 + COALESCE(h.follower_count, 0))::NUMERIC as trending_score
  FROM hashtags h
  LEFT JOIN recent_usage ru ON ru.hashtag_id = h.id
  WHERE h.status = 'active'
    AND (ru.recent_count > 0 OR h.usage_count > 0)
  ORDER BY trending_score DESC, h.usage_count DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION get_hashtag_details(
  p_hashtag_name TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tag TEXT,
  name TEXT,
  display_name TEXT,
  type TEXT,
  owner_id UUID,
  owner_name TEXT,
  owner_username TEXT,
  owner_avatar TEXT,
  description TEXT,
  status TEXT,
  is_verified BOOLEAN,
  usage_count INTEGER,
  follower_count INTEGER,
  is_following BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag TEXT;
BEGIN
  v_tag := lower(regexp_replace(p_hashtag_name, '^#', ''));

  RETURN QUERY
  SELECT
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    h.owner_id,
    p.display_name as owner_name,
    p.username as owner_username,
    p.avatar_url as owner_avatar,
    h.description,
    h.status::TEXT,
    COALESCE(h.is_verified, false),
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    EXISTS(
      SELECT 1 FROM hashtag_followers hf
      WHERE hf.hashtag_id = h.id AND hf.user_id = p_user_id
    ) as is_following,
    h.created_at
  FROM hashtags h
  LEFT JOIN profiles p ON p.id = h.owner_id
  WHERE h.tag = v_tag;
END;
$$;

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
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
BEGIN
  SELECT h.id INTO v_hashtag_id
  FROM hashtags h
  WHERE lower(h.tag) = lower(p_hashtag_name);

  IF v_hashtag_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id as post_id,
    p.content,
    CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE NULL END as media_urls,
    p.author_id,
    COALESCE(pr.full_name, pr.username, 'DNA Member') as author_name,
    pr.username as author_username,
    pr.avatar_url as author_avatar,
    pr.headline as author_headline,
    COALESCE((SELECT COUNT(*)::integer FROM post_likes pl WHERE pl.post_id = p.id), 0) as like_count,
    COALESCE((SELECT COUNT(*)::integer FROM post_comments pc WHERE pc.post_id = p.id), 0) as comment_count,
    0 as reshare_count,
    p.created_at
  FROM posts p
  JOIN post_hashtags ph ON ph.post_id = p.id
  JOIN profiles pr ON pr.id = p.author_id
  WHERE ph.hashtag_id = v_hashtag_id
    AND p.is_deleted = false
  ORDER BY
    CASE WHEN p_sort = 'top' THEN COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id), 0) + COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id), 0) * 2 END DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_hashtag_follow(
  p_hashtag_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_was_following BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id
  ) INTO v_was_following;

  IF v_was_following THEN
    DELETE FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id;

    UPDATE hashtags
    SET follower_count = GREATEST(follower_count - 1, 0), updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN false;
  ELSE
    INSERT INTO hashtag_followers (hashtag_id, user_id)
    VALUES (p_hashtag_id, p_user_id);

    UPDATE hashtags
    SET follower_count = follower_count + 1, updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN true;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION search_hashtags(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  tag TEXT,
  name TEXT,
  display_name TEXT,
  type TEXT,
  usage_count INTEGER,
  follower_count INTEGER,
  is_verified BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query TEXT;
BEGIN
  v_query := lower(regexp_replace(p_query, '^#', ''));

  RETURN QUERY
  SELECT
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    COALESCE(h.is_verified, false)
  FROM hashtags h
  WHERE h.status = 'active'
    AND h.tag LIKE v_query || '%'
  ORDER BY
    CASE WHEN h.tag = v_query THEN 0 ELSE 1 END,
    h.usage_count DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION is_hashtag_reserved(p_name TEXT)
RETURNS TABLE (
  is_reserved BOOLEAN,
  category reserved_category,
  reason TEXT,
  can_be_used BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_found BOOLEAN := false;
BEGIN
  v_name := lower(regexp_replace(p_name, '^#', ''));

  FOR is_reserved, category, reason, can_be_used IN
    SELECT true, rh.category, rh.reason, rh.can_be_used
    FROM reserved_hashtags rh
    WHERE rh.name = v_name
  LOOP
    v_found := true;
    RETURN NEXT;
  END LOOP;

  IF NOT v_found THEN
    is_reserved := false;
    category := NULL;
    reason := NULL;
    can_be_used := true;
    RETURN NEXT;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION create_personal_hashtag(
  p_user_id UUID,
  p_tag TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, hashtag_id UUID, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag TEXT;
  v_active_count INTEGER;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  v_tag := lower(regexp_replace(p_tag, '^#', ''));

  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_tag) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is reserved and cannot be owned';
    RETURN;
  END IF;

  SELECT id INTO v_existing_id FROM hashtags WHERE tag = v_tag;

  IF v_existing_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id IS NOT NULL AND owner_id != p_user_id) THEN
      RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is already owned by another user';
      RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id = p_user_id) THEN
      RETURN QUERY SELECT false, v_existing_id, 'You already own this hashtag';
      RETURN;
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You have reached your limit of 5 personal hashtags. Archive one to create another.';
    RETURN;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    UPDATE hashtags
    SET owner_id = p_user_id,
        type = 'personal',
        is_personal = true,
        requires_approval = true,
        description = COALESCE(p_description, description),
        updated_at = now()
    WHERE id = v_existing_id
    RETURNING id INTO v_new_id;
  ELSE
    INSERT INTO hashtags (tag, type, owner_id, is_personal, requires_approval, description, status)
    VALUES (v_tag, 'personal', p_user_id, true, true, p_description, 'active')
    RETURNING id INTO v_new_id;
  END IF;

  RETURN QUERY SELECT true, v_new_id, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION archive_personal_hashtag(
  p_user_id UUID,
  p_hashtag_id UUID
)
RETURNS TABLE (success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is already archived';
    RETURN;
  END IF;

  UPDATE hashtags
  SET status = 'archived',
      archived_at = now(),
      requires_approval = false,
      updated_at = now()
  WHERE id = p_hashtag_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION reactivate_personal_hashtag(
  p_user_id UUID,
  p_hashtag_id UUID
)
RETURNS TABLE (success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is not archived';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, 'You have reached your limit of 5 active hashtags. Archive one first.';
    RETURN;
  END IF;

  UPDATE hashtags
  SET status = 'active',
      archived_at = NULL,
      requires_approval = true,
      updated_at = now()
  WHERE id = p_hashtag_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION request_hashtag_usage(
  p_requester_id UUID,
  p_hashtag_id UUID,
  p_post_id UUID
)
RETURNS TABLE (success BOOLEAN, request_id UUID, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_new_request_id UUID;
  v_hashtag_tag TEXT;
  v_requester_name TEXT;
BEGIN
  SELECT owner_id, tag INTO v_owner_id, v_hashtag_tag
  FROM hashtags
  WHERE id = p_hashtag_id AND type = 'personal' AND requires_approval = true;

  IF v_owner_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag does not require approval';
    RETURN;
  END IF;

  IF v_owner_id = p_requester_id THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You own this hashtag, no approval needed';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM hashtag_usage_requests WHERE hashtag_id = p_hashtag_id AND post_id = p_post_id) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'A request for this hashtag on this post already exists';
    RETURN;
  END IF;

  INSERT INTO hashtag_usage_requests (hashtag_id, post_id, requester_id, owner_id)
  VALUES (p_hashtag_id, p_post_id, p_requester_id, v_owner_id)
  RETURNING id INTO v_new_request_id;

  SELECT display_name INTO v_requester_name FROM profiles WHERE id = p_requester_id;

  INSERT INTO notifications (user_id, type, title, message, link_url, payload)
  VALUES (
    v_owner_id,
    'hashtag_request',
    'New hashtag usage request',
    v_requester_name || ' wants to use #' || v_hashtag_tag,
    '/dna/settings/hashtags',
    jsonb_build_object(
      'request_id', v_new_request_id,
      'hashtag_id', p_hashtag_id,
      'post_id', p_post_id,
      'requester_id', p_requester_id
    )
  );

  RETURN QUERY SELECT true, v_new_request_id, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION review_hashtag_request(
  p_owner_id UUID,
  p_request_id UUID,
  p_approved BOOLEAN,
  p_note TEXT DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
  v_post_id UUID;
  v_requester_id UUID;
BEGIN
  SELECT hashtag_id, post_id, requester_id INTO v_hashtag_id, v_post_id, v_requester_id
  FROM hashtag_usage_requests
  WHERE id = p_request_id AND owner_id = p_owner_id AND status = 'pending';

  IF v_hashtag_id IS NULL THEN
    RETURN QUERY SELECT false, 'Request not found or already reviewed';
    RETURN;
  END IF;

  UPDATE hashtag_usage_requests
  SET status = CASE WHEN p_approved THEN 'approved' ELSE 'denied' END,
      reviewed_at = now(),
      review_note = p_note
  WHERE id = p_request_id;

  IF p_approved THEN
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (v_post_id, v_hashtag_id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;

    UPDATE hashtags
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = v_hashtag_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, link_url, payload)
  VALUES (
    v_requester_id,
    'hashtag_request_reviewed',
    CASE WHEN p_approved
      THEN 'Your hashtag request was approved'
      ELSE 'Your hashtag request was denied'
    END,
    CASE WHEN p_approved
      THEN 'Your post can now use the hashtag'
      ELSE COALESCE(p_note, 'The hashtag owner declined your request')
    END,
    '/feed?post=' || v_post_id,
    jsonb_build_object(
      'request_id', p_request_id,
      'hashtag_id', v_hashtag_id,
      'approved', p_approved
    )
  );

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION get_pending_hashtag_requests(p_owner_id UUID)
RETURNS TABLE (
  request_id UUID,
  hashtag_id UUID,
  hashtag_tag TEXT,
  post_id UUID,
  post_content TEXT,
  requester_id UUID,
  requester_name TEXT,
  requester_avatar TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as request_id,
    r.hashtag_id,
    h.tag as hashtag_tag,
    r.post_id,
    p.content as post_content,
    r.requester_id,
    pr.display_name as requester_name,
    pr.avatar_url as requester_avatar,
    r.created_at
  FROM hashtag_usage_requests r
  JOIN hashtags h ON h.id = r.hashtag_id
  JOIN posts p ON p.id = r.post_id
  JOIN profiles pr ON pr.id = r.requester_id
  WHERE r.owner_id = p_owner_id
    AND r.status = 'pending'
  ORDER BY r.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_hashtag_limits(p_user_id UUID)
RETURNS TABLE (
  max_hashtags INTEGER,
  active_count INTEGER,
  archived_count INTEGER,
  available_slots INTEGER
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max INTEGER := 5;
  v_active INTEGER;
  v_archived INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_active
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  SELECT COUNT(*) INTO v_archived
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'archived';

  RETURN QUERY SELECT v_max, v_active, v_archived, (v_max - v_active);
END;
$$;

CREATE OR REPLACE FUNCTION get_user_owned_hashtags(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  tag TEXT,
  description TEXT,
  status TEXT,
  usage_count INTEGER,
  follower_count INTEGER,
  pending_requests BIGINT,
  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.tag,
    h.description,
    h.status::TEXT,
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    (SELECT COUNT(*) FROM hashtag_usage_requests r
     WHERE r.hashtag_id = h.id AND r.status = 'pending'),
    h.created_at,
    h.archived_at
  FROM hashtags h
  WHERE h.owner_id = p_user_id
    AND h.type = 'personal'
  ORDER BY h.status, h.created_at DESC;
END;
$$;

-- ============================================
-- TRIGGER TO PROCESS HASHTAGS ON NEW POSTS
-- ============================================

CREATE OR REPLACE FUNCTION trigger_process_post_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.content ~ '#\w+' THEN
    PERFORM process_post_hashtags(NEW.id, NEW.author_id, NEW.content);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_process_post_hashtags ON posts;
CREATE TRIGGER trg_process_post_hashtags
  AFTER INSERT
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_post_hashtags();

-- ============================================
-- GRANT PERMISSIONS (authenticated only — matches the write-lockdown
-- applied across the hashtag RPCs; extract_hashtags is a pure text
-- helper so it stays open to anon like the rest of the read surface)
-- ============================================

GRANT EXECUTE ON FUNCTION get_or_create_hashtag(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_post_hashtags(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_hashtags(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_hashtag_details(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_hashtag_posts(TEXT, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_hashtag_follow(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_hashtags(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_hashtag_reserved(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_personal_hashtag(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_personal_hashtag(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_personal_hashtag(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION request_hashtag_usage(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION review_hashtag_request(UUID, UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_hashtag_requests(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_hashtag_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_owned_hashtags(UUID) TO authenticated;

-- ============================================
-- SEED RESERVED HASHTAGS
-- ============================================

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
