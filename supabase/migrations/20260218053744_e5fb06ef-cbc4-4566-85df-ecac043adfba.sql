
-- ============================================================
-- DNA Platform: RLS Remediation Sprint 1
-- CRITICAL: Fix before any alpha tester logs in
-- ============================================================

-- FIX 1: billing_transactions
-- No user_id column exists; keep admin + org owner access only
DROP POLICY IF EXISTS "billing_transactions_select" ON billing_transactions;

CREATE POLICY "billing_transactions_select_fixed"
ON billing_transactions FOR SELECT
USING (
  has_role((SELECT auth.uid() AS uid), 'admin'::app_role)
  OR organization_id IN (
    SELECT id FROM organizations WHERE owner_user_id = (SELECT auth.uid() AS uid)
  )
);

-- FIX 2: dia_queries — SKIPPED
-- dia_queries is a shared response cache (keyed by query_hash), not user-owned.
-- Per-user query logs live in dia_query_log which already has proper policies.

-- FIX 3: dia_insights
-- ALL policy with USING (true) lets any user write DIA insights
-- Writes must come from service role only
DROP POLICY IF EXISTS "adin_insights_manage_service" ON dia_insights;

-- FIX 4: user_vectors
DROP POLICY IF EXISTS "User vectors access policy" ON user_vectors;

CREATE POLICY "user_vectors_select_own_or_admin"
ON user_vectors FOR SELECT
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR has_role((SELECT auth.uid() AS uid), 'admin'::app_role)
);

-- FIX 5: entity_vectors
-- Writes must come from service role only
DROP POLICY IF EXISTS "System can insert entity vectors" ON entity_vectors;
DROP POLICY IF EXISTS "System can update entity vectors" ON entity_vectors;
DROP POLICY IF EXISTS "System can delete entity vectors" ON entity_vectors;

-- FIX 6: space_members
-- Bug: sm.space_id = sm.space_id (always true) — any member can manage ALL spaces
DROP POLICY IF EXISTS "Space leads can add members" ON space_members;
DROP POLICY IF EXISTS "Space leads can remove members or users can leave" ON space_members;
DROP POLICY IF EXISTS "Space leads can update member roles" ON space_members;

CREATE POLICY "space_members_insert_fixed"
ON space_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM spaces s
    WHERE s.id = space_members.space_id
    AND s.created_by = (SELECT auth.uid() AS uid)
  )
  OR EXISTS (
    SELECT 1 FROM space_members lead_sm
    WHERE lead_sm.space_id = space_members.space_id
    AND lead_sm.user_id = (SELECT auth.uid() AS uid)
    AND lead_sm.role = 'lead'
  )
  OR user_id = (SELECT auth.uid() AS uid)
);

CREATE POLICY "space_members_delete_fixed"
ON space_members FOR DELETE
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM spaces s
    WHERE s.id = space_members.space_id
    AND s.created_by = (SELECT auth.uid() AS uid)
  )
  OR EXISTS (
    SELECT 1 FROM space_members lead_sm
    WHERE lead_sm.space_id = space_members.space_id
    AND lead_sm.user_id = (SELECT auth.uid() AS uid)
    AND lead_sm.role = 'lead'
  )
);

CREATE POLICY "space_members_update_fixed"
ON space_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM spaces s
    WHERE s.id = space_members.space_id
    AND s.created_by = (SELECT auth.uid() AS uid)
  )
  OR EXISTS (
    SELECT 1 FROM space_members lead_sm
    WHERE lead_sm.space_id = space_members.space_id
    AND lead_sm.user_id = (SELECT auth.uid() AS uid)
    AND lead_sm.role = 'lead'
  )
);

-- FIX 7: profiles
-- Private profiles invisible to accepted connections
DROP POLICY IF EXISTS "profiles_select" ON profiles;

CREATE POLICY "profiles_select_fixed"
ON profiles FOR SELECT
USING (
  is_public = true
  OR id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1 FROM connections c
    WHERE (
      (c.requester_id = (SELECT auth.uid() AS uid) AND c.recipient_id = profiles.id)
      OR
      (c.recipient_id = (SELECT auth.uid() AS uid) AND c.requester_id = profiles.id)
    )
    AND c.status = 'accepted'
  )
);

-- FIX 8: user_dna_points — missing SELECT policy
CREATE POLICY "user_dna_points_select_own"
ON user_dna_points FOR SELECT
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR has_role((SELECT auth.uid() AS uid), 'admin'::app_role)
);

-- FIX 9: user_adin_profile — missing SELECT policy
CREATE POLICY "user_adin_profile_select_own"
ON user_adin_profile FOR SELECT
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR has_role((SELECT auth.uid() AS uid), 'admin'::app_role)
);

-- FIX 10: post_bookmarks
DROP POLICY IF EXISTS "Users can view all post bookmarks" ON post_bookmarks;

CREATE POLICY "post_bookmarks_select_own"
ON post_bookmarks FOR SELECT
USING (user_id = (SELECT auth.uid() AS uid));

-- FIX 11: invites
-- UPDATE USING (true) lets any user burn any alpha invite
DROP POLICY IF EXISTS "System can update invite usage" ON invites;
