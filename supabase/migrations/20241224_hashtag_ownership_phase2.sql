-- ============================================
-- DNA HASHTAG SYSTEM - Phase 2: Personal Ownership
-- ============================================

-- ============================================
-- 1. ADD COLUMNS TO HASHTAGS TABLE
-- ============================================

-- Add columns if they don't exist
DO $$
BEGIN
  -- Track if this is a personal hashtag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'is_personal') THEN
    ALTER TABLE hashtags ADD COLUMN is_personal BOOLEAN DEFAULT false;
  END IF;

  -- Track if approval is required for others to use
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'requires_approval') THEN
    ALTER TABLE hashtags ADD COLUMN requires_approval BOOLEAN DEFAULT false;
  END IF;

  -- Track last used timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hashtags' AND column_name = 'last_used_at') THEN
    ALTER TABLE hashtags ADD COLUMN last_used_at TIMESTAMPTZ;
  END IF;
END $$;


-- ============================================
-- 2. HASHTAG USAGE REQUESTS TABLE
-- For approval flow when using personal hashtags
-- ============================================

CREATE TABLE IF NOT EXISTS hashtag_usage_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Request details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),

  -- Review info
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One request per post per hashtag
  UNIQUE(hashtag_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_hashtag ON hashtag_usage_requests(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_owner ON hashtag_usage_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_requester ON hashtag_usage_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_status ON hashtag_usage_requests(status);
CREATE INDEX IF NOT EXISTS idx_hashtag_requests_pending ON hashtag_usage_requests(owner_id, status) WHERE status = 'pending';

-- RLS
ALTER TABLE hashtag_usage_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own requests" ON hashtag_usage_requests;
CREATE POLICY "Users can view their own requests"
  ON hashtag_usage_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create requests" ON hashtag_usage_requests;
CREATE POLICY "Users can create requests"
  ON hashtag_usage_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update request status" ON hashtag_usage_requests;
CREATE POLICY "Owners can update request status"
  ON hashtag_usage_requests FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());


-- ============================================
-- 3. USER HASHTAG LIMITS TABLE
-- Track how many personal hashtags each user has
-- ============================================

CREATE TABLE IF NOT EXISTS user_hashtag_limits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  max_hashtags INTEGER DEFAULT 5,
  active_count INTEGER DEFAULT 0,
  archived_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE user_hashtag_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own limits" ON user_hashtag_limits;
CREATE POLICY "Users can view their own limits"
  ON user_hashtag_limits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own limits" ON user_hashtag_limits;
CREATE POLICY "Users can update their own limits"
  ON user_hashtag_limits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());


-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to get user's hashtag limit info
CREATE OR REPLACE FUNCTION get_user_hashtag_limits(p_user_id UUID)
RETURNS TABLE (
  max_hashtags INTEGER,
  active_count INTEGER,
  archived_count INTEGER,
  available_slots INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_max INTEGER := 5;
  v_active INTEGER;
  v_archived INTEGER;
BEGIN
  -- Count active personal hashtags
  SELECT COUNT(*) INTO v_active
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  -- Count archived personal hashtags
  SELECT COUNT(*) INTO v_archived
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'archived';

  RETURN QUERY SELECT v_max, v_active, v_archived, (v_max - v_active);
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_hashtag_limits(UUID) TO authenticated;


-- Function to create a personal hashtag
CREATE OR REPLACE FUNCTION create_personal_hashtag(
  p_user_id UUID,
  p_tag TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  hashtag_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tag TEXT;
  v_active_count INTEGER;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Normalize tag
  v_tag := lower(regexp_replace(p_tag, '^#', ''));

  -- Check if reserved
  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_tag) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is reserved and cannot be owned'::TEXT;
    RETURN;
  END IF;

  -- Check if already exists and is owned
  SELECT id INTO v_existing_id FROM hashtags WHERE name = v_tag;

  IF v_existing_id IS NOT NULL THEN
    -- Check if already owned by someone else
    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id IS NOT NULL AND owner_id != p_user_id) THEN
      RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is already owned by another user'::TEXT;
      RETURN;
    END IF;

    -- Check if already owned by this user
    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id = p_user_id) THEN
      RETURN QUERY SELECT false, v_existing_id, 'You already own this hashtag'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Check user's limit
  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You have reached your limit of 5 personal hashtags. Archive one to create another.'::TEXT;
    RETURN;
  END IF;

  -- Create or claim the hashtag
  IF v_existing_id IS NOT NULL THEN
    -- Claim existing community hashtag
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
    -- Create new personal hashtag
    INSERT INTO hashtags (name, display_name, type, owner_id, is_personal, requires_approval, description, status)
    VALUES (v_tag, v_tag, 'personal', p_user_id, true, true, p_description, 'active')
    RETURNING id INTO v_new_id;
  END IF;

  RETURN QUERY SELECT true, v_new_id, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION create_personal_hashtag(UUID, TEXT, TEXT) TO authenticated;


-- Function to archive a personal hashtag
CREATE OR REPLACE FUNCTION archive_personal_hashtag(
  p_user_id UUID,
  p_hashtag_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag'::TEXT;
    RETURN;
  END IF;

  -- Check if already archived
  IF EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is already archived'::TEXT;
    RETURN;
  END IF;

  -- Archive it
  UPDATE hashtags
  SET status = 'archived',
      archived_at = now(),
      requires_approval = false,
      updated_at = now()
  WHERE id = p_hashtag_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION archive_personal_hashtag(UUID, UUID) TO authenticated;


-- Function to reactivate an archived hashtag
CREATE OR REPLACE FUNCTION reactivate_personal_hashtag(
  p_user_id UUID,
  p_hashtag_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag'::TEXT;
    RETURN;
  END IF;

  -- Check if archived
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is not archived'::TEXT;
    RETURN;
  END IF;

  -- Check user's limit
  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';

  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, 'You have reached your limit of 5 active hashtags. Archive one first.'::TEXT;
    RETURN;
  END IF;

  -- Reactivate it
  UPDATE hashtags
  SET status = 'active',
      archived_at = NULL,
      requires_approval = true,
      updated_at = now()
  WHERE id = p_hashtag_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION reactivate_personal_hashtag(UUID, UUID) TO authenticated;


-- Function to get user's owned hashtags
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
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.name as tag,
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

GRANT EXECUTE ON FUNCTION get_user_owned_hashtags(UUID) TO authenticated;


-- Function to get pending requests for an owner
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
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as request_id,
    r.hashtag_id,
    h.name as hashtag_tag,
    r.post_id,
    p.content as post_content,
    r.requester_id,
    COALESCE(pr.display_name, pr.full_name) as requester_name,
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

GRANT EXECUTE ON FUNCTION get_pending_hashtag_requests(UUID) TO authenticated;


-- Function to approve/deny a hashtag usage request
CREATE OR REPLACE FUNCTION review_hashtag_request(
  p_owner_id UUID,
  p_request_id UUID,
  p_approved BOOLEAN,
  p_note TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hashtag_id UUID;
  v_post_id UUID;
  v_requester_id UUID;
  v_hashtag_tag TEXT;
BEGIN
  -- Get request details and verify ownership
  SELECT r.hashtag_id, r.post_id, r.requester_id, h.name
  INTO v_hashtag_id, v_post_id, v_requester_id, v_hashtag_tag
  FROM hashtag_usage_requests r
  JOIN hashtags h ON h.id = r.hashtag_id
  WHERE r.id = p_request_id AND r.owner_id = p_owner_id AND r.status = 'pending';

  IF v_hashtag_id IS NULL THEN
    RETURN QUERY SELECT false, 'Request not found or already reviewed'::TEXT;
    RETURN;
  END IF;

  -- Update request status
  UPDATE hashtag_usage_requests
  SET status = CASE WHEN p_approved THEN 'approved' ELSE 'denied' END,
      reviewed_at = now(),
      review_note = p_note
  WHERE id = p_request_id;

  -- If approved, link the hashtag to the post
  IF p_approved THEN
    INSERT INTO post_hashtags (post_id, hashtag)
    VALUES (v_post_id, v_hashtag_tag)
    ON CONFLICT (post_id, hashtag) DO NOTHING;

    -- Increment usage count
    UPDATE hashtags
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = v_hashtag_id;
  END IF;

  -- Create notification for requester using existing notification function
  PERFORM create_notification(
    v_requester_id,
    CASE WHEN p_approved THEN 'hashtag_approved' ELSE 'hashtag_denied' END,
    CASE WHEN p_approved
      THEN 'Your hashtag request was approved'
      ELSE 'Your hashtag request was denied'
    END,
    CASE WHEN p_approved
      THEN 'Your post can now use #' || v_hashtag_tag
      ELSE COALESCE(p_note, 'The hashtag owner declined your request to use #' || v_hashtag_tag)
    END,
    '/feed?post=' || v_post_id,
    p_owner_id
  );

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION review_hashtag_request(UUID, UUID, BOOLEAN, TEXT) TO authenticated;


-- Function to request usage of a personal hashtag
CREATE OR REPLACE FUNCTION request_hashtag_usage(
  p_requester_id UUID,
  p_hashtag_id UUID,
  p_post_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  request_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
  v_new_request_id UUID;
  v_hashtag_tag TEXT;
  v_requester_name TEXT;
BEGIN
  -- Get hashtag owner
  SELECT owner_id, name INTO v_owner_id, v_hashtag_tag
  FROM hashtags
  WHERE id = p_hashtag_id AND type = 'personal' AND requires_approval = true;

  IF v_owner_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag does not require approval'::TEXT;
    RETURN;
  END IF;

  -- Can't request your own hashtag
  IF v_owner_id = p_requester_id THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You own this hashtag, no approval needed'::TEXT;
    RETURN;
  END IF;

  -- Check if request already exists
  IF EXISTS (SELECT 1 FROM hashtag_usage_requests WHERE hashtag_id = p_hashtag_id AND post_id = p_post_id) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'A request for this hashtag on this post already exists'::TEXT;
    RETURN;
  END IF;

  -- Create request
  INSERT INTO hashtag_usage_requests (hashtag_id, post_id, requester_id, owner_id)
  VALUES (p_hashtag_id, p_post_id, p_requester_id, v_owner_id)
  RETURNING id INTO v_new_request_id;

  -- Get requester name for notification
  SELECT COALESCE(display_name, full_name) INTO v_requester_name FROM profiles WHERE id = p_requester_id;

  -- Notify owner using existing notification function
  PERFORM create_notification(
    v_owner_id,
    'hashtag_request',
    'New hashtag usage request',
    COALESCE(v_requester_name, 'Someone') || ' wants to use #' || v_hashtag_tag,
    '/settings/hashtags',
    p_requester_id
  );

  RETURN QUERY SELECT true, v_new_request_id, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION request_hashtag_usage(UUID, UUID, UUID) TO authenticated;


-- Update process_post_hashtags to handle personal hashtags
-- This function is called when a post is created/updated
CREATE OR REPLACE FUNCTION process_post_hashtags(
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
  v_owner_id UUID;
  v_is_personal BOOLEAN;
  v_requires_approval BOOLEAN;
BEGIN
  -- Extract hashtags from content
  SELECT array_agg(DISTINCT LOWER(substring(match FROM 2)))
  INTO v_hashtags
  FROM regexp_matches(p_content, '#([A-Za-z0-9_]+)', 'g') AS match;

  IF v_hashtags IS NULL THEN
    RETURN;
  END IF;

  FOREACH v_hashtag IN ARRAY v_hashtags
  LOOP
    BEGIN
      -- Get or create hashtag
      v_hashtag_id := get_or_create_hashtag(v_hashtag);

      -- Check if personal and requires approval
      SELECT owner_id, is_personal, requires_approval
      INTO v_owner_id, v_is_personal, v_requires_approval
      FROM hashtags WHERE id = v_hashtag_id;

      -- If personal hashtag owned by someone else, create request
      IF v_is_personal AND v_requires_approval AND v_owner_id IS NOT NULL AND v_owner_id != p_user_id THEN
        PERFORM request_hashtag_usage(p_user_id, v_hashtag_id, p_post_id);
        -- Don't link yet - wait for approval
        CONTINUE;
      END IF;

      -- Otherwise, link directly
      INSERT INTO post_hashtags (post_id, hashtag)
      VALUES (p_post_id, v_hashtag)
      ON CONFLICT (post_id, hashtag) DO NOTHING;

      -- Increment usage count
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

GRANT EXECUTE ON FUNCTION process_post_hashtags(UUID, UUID, TEXT) TO authenticated;


-- ============================================
-- 5. VERIFICATION
-- ============================================

-- Verify all new functions exist
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_hashtag_limits',
    'create_personal_hashtag',
    'archive_personal_hashtag',
    'reactivate_personal_hashtag',
    'get_user_owned_hashtags',
    'get_pending_hashtag_requests',
    'review_hashtag_request',
    'request_hashtag_usage',
    'process_post_hashtags'
  );

  RAISE NOTICE 'Phase 2 functions created: % (expected 9)', v_count;
END;
$$;
