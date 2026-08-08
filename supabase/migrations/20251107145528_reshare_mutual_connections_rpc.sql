-- ============================================
-- DNA FEATURE FIX: Reshares & Mutual Connections RPC Functions
-- Originally authored December 23, 2024, but filed under an 8-digit
-- "20241223" prefix that predates the migrations creating posts/
-- connections — a from-scratch replay failed on "relation posts does
-- not exist" before this file's statements ever ran. It was never
-- tracked in supabase_migrations.schema_migrations either, confirming
-- it was applied directly against the database, not through migration
-- history. Renamed into its actual dependency order; content unchanged
-- (verified to match the live function bodies exactly).
--
-- 20251221231943_reshare_tracking_and_mutual_connections.sql, which
-- looked like this file's successor, was removed alongside this rename:
-- it redefines these same 4 functions with different return types
-- (bigint/void/bigint -> INTEGER/BOOLEAN/INTEGER) and touches a
-- reshare_count column/trigers that don't exist live, and it is also
-- absent from schema_migrations — it was never applied. Besides
-- reintroducing the "posts does not exist" ordering problem, keeping it
-- would break 20251228020247_...sql's later CREATE OR REPLACE of these
-- functions (which correctly restores the original bigint/void/bigint
-- signatures this file establishes, plus a search_path hardening fix,
-- and IS applied live) via the same return-type-change error.
--
-- This migration adds 4 RPC functions:
-- 1. check_user_reshared - Check if user has reshared a post
-- 2. get_reshare_count - Get reshare count for a post
-- 3. delete_reshare - Soft-delete a reshare (undo)
-- 4. get_mutual_connection_count - Get count of mutual connections
-- ============================================

-- ============================================
-- RESHARE FUNCTIONS
-- ============================================

-- 1. check_user_reshared
-- Returns true if the user has already reshared the specified post
-- Called by: useReshare.ts → hasReshared query
CREATE OR REPLACE FUNCTION check_user_reshared(p_user_id uuid, p_post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM posts
    WHERE author_id = p_user_id
      AND original_post_id = p_post_id
      AND post_type = 'reshare'
      AND is_deleted = false
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_reshared(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION check_user_reshared IS 'Check if a user has reshared a specific post. Returns boolean.';


-- 2. get_reshare_count
-- Returns the total number of reshares for a post
-- Called by: useReshare.ts → reshareCount query
CREATE OR REPLACE FUNCTION get_reshare_count(p_post_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::bigint
  FROM posts
  WHERE original_post_id = p_post_id
    AND post_type = 'reshare'
    AND is_deleted = false;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_reshare_count(uuid) TO authenticated;

COMMENT ON FUNCTION get_reshare_count IS 'Get the number of times a post has been reshared.';


-- 3. delete_reshare
-- Soft-deletes a user's reshare of a specific post (undo reshare)
-- Called by: useReshare.ts → handleUndoReshare mutation
CREATE OR REPLACE FUNCTION delete_reshare(p_user_id uuid, p_original_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET
    is_deleted = true,
    updated_at = now()
  WHERE author_id = p_user_id
    AND original_post_id = p_original_post_id
    AND post_type = 'reshare'
    AND is_deleted = false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_reshare(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION delete_reshare IS 'Soft-delete a reshare (undo reshare functionality).';


-- ============================================
-- MUTUAL CONNECTIONS FUNCTIONS
-- ============================================

-- 4. get_mutual_connection_count
-- Returns the count of mutual connections between two users
-- Optimized count-only query (no need to fetch full profiles)
-- Called by: useMutualConnections.ts → mutualCount query
CREATE OR REPLACE FUNCTION get_mutual_connection_count(user_a uuid, user_b uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT p.id)::bigint
  FROM profiles p
  INNER JOIN connections c1 ON (
    (c1.requester_id = user_a AND c1.recipient_id = p.id)
    OR (c1.recipient_id = user_a AND c1.requester_id = p.id)
  )
  INNER JOIN connections c2 ON (
    (c2.requester_id = user_b AND c2.recipient_id = p.id)
    OR (c2.recipient_id = user_b AND c2.requester_id = p.id)
  )
  WHERE c1.status = 'accepted'
    AND c2.status = 'accepted'
    AND p.id != user_a
    AND p.id != user_b;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_mutual_connection_count(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION get_mutual_connection_count IS 'Get count of mutual connections between two users. Optimized for performance.';


-- ============================================
-- VERIFICATION QUERY
-- Run this after migration to confirm all functions exist
-- ============================================
-- SELECT routine_name
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN (
--     'check_user_reshared',
--     'get_reshare_count',
--     'delete_reshare',
--     'get_mutual_connection_count'
--   );
-- Expected: 4 rows
