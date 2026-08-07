-- Fix the Critical/High findings from the second (deeper) audit pass,
-- 2026-08-08. This pass specifically swept every migration for the same
-- two bug classes that produced the original C1/H1 findings: (a)
-- SECURITY DEFINER functions trusting a caller-supplied identity
-- parameter with no auth.uid() check, and (b) RLS write policies named
-- "System"/"Service role" with no actual TO service_role restriction.
-- It found several more live instances the first pass's grep hits
-- happened not to surface.
--
-- See docs/audits/codebase-bug-audit-2026-08-08.md for the full findings
-- and rationale for each fix below.

-- =====================================================================
-- 1. Write-IDOR on profile update RPCs — any user could overwrite any
--    other user's identity/bio/skills/contributions/interests.
--    (update_profile_diaspora was already DROPped by a later migration
--    — 20260530034743 — so it's not included here.)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_profile_identity(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_headline TEXT DEFAULT NULL,
  p_professional_role TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    full_name = COALESCE(p_full_name, full_name),
    headline = COALESCE(p_headline, headline),
    professional_role = COALESCE(p_professional_role, professional_role),
    company = COALESCE(p_company, company),
    location = COALESCE(p_location, location),
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Identity updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_about(
  p_user_id UUID,
  p_bio TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    bio = p_bio,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'About section updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_skills(
  p_user_id UUID,
  p_skills JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    skills = p_skills,
    skill_tags = p_skills,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Skills updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_contributions(
  p_user_id UUID,
  p_contribution_tags JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    contribution_tags = p_contribution_tags,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Contributions updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_interests(
  p_user_id UUID,
  p_interests JSONB,
  p_interest_tags JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    interests = p_interests,
    interest_tags = COALESCE(p_interest_tags, p_interests),
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM update_profile_completion_score(p_user_id);

  SELECT json_build_object('success', true, 'message', 'Interests updated')
  INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================================
-- 2. Zero-auth group-membership tampering — add_group_participant and
--    remove_group_participant had NO caller check at all (not even that
--    the caller was a participant). Any authenticated user could add
--    themselves/anyone to, or remove anyone from, any private group.
--    Fixed to require the caller be an existing owner/admin of the
--    conversation, matching the correct pattern already used in the
--    sibling set_group_participant_role (self-leave has its own,
--    already-correct RPC: leave_group_conversation).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.add_group_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_caller_role
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only group owners or admins can add participants';
  END IF;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (p_conversation_id, p_user_id)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_group_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_caller_role
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only group owners or admins can remove participants';
  END IF;

  DELETE FROM conversation_participants
  WHERE conversation_id = p_conversation_id
  AND user_id = p_user_id;
END;
$$;

-- =====================================================================
-- 3. IDOR chain in the hashtag-ownership review flow — any caller could
--    view/approve/deny hashtag ownership requests by passing another
--    owner's UUID, and toggle hashtag-follow state on another user's
--    behalf.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_user_owned_hashtags(p_user_id uuid)
RETURNS TABLE(id uuid, tag text, description text, status text, usage_count integer, follower_count integer, pending_requests bigint, created_at timestamp with time zone, archived_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

CREATE OR REPLACE FUNCTION public.get_pending_hashtag_requests(p_owner_id uuid)
RETURNS TABLE(request_id uuid, hashtag_id uuid, hashtag_tag text, post_id uuid, post_content text, requester_id uuid, requester_name text, requester_avatar text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

CREATE OR REPLACE FUNCTION public.review_hashtag_request(p_owner_id uuid, p_request_id uuid, p_approved boolean, p_note text DEFAULT NULL::text)
RETURNS TABLE(success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
  v_post_id UUID;
  v_requester_id UUID;
BEGIN
  IF p_owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

CREATE OR REPLACE FUNCTION public.toggle_hashtag_follow(p_hashtag_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_was_following BOOLEAN;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

-- =====================================================================
-- 4. admin_verify_user granted "fully verified" status with a literal
--    TODO instead of a permission check ("you can add role check here
--    later" — never added).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_verify_user(target_user_id UUID, admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF admin_user_id IS DISTINCT FROM auth.uid() OR NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET
    verification_status = 'fully_verified',
    verification_updated_at = NOW(),
    verification_method = 'admin_verified',
    verified = TRUE,
    verified_at = NOW()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- =====================================================================
-- 5. Dead-but-live vulnerable block_user/unblock_user overload. The app
--    only ever calls the correctly-scoped overload
--    (block_user(p_blocked_user_id, p_reason) / unblock_user(p_blocked_user_id),
--    which already use auth.uid() internally and are unaffected by this
--    migration) — this 2-UUID overload is unused dead code that's still
--    directly RPC-addressable, letting an attacker force-block or
--    force-unblock connections on a victim's behalf. Drop it.
-- =====================================================================

DROP FUNCTION IF EXISTS public.block_user(uuid, uuid);
DROP FUNCTION IF EXISTS public.unblock_user(uuid, uuid);

-- =====================================================================
-- 6. RLS write policies misnamed "System"/"Service role" with no actual
--    role restriction — same class as the original H1 fix, found on
--    four more tables this pass.
-- =====================================================================

ALTER POLICY "System can insert reminder logs" ON public.reminder_logs TO service_role;
ALTER POLICY "System can update reminder logs" ON public.reminder_logs TO service_role;
ALTER POLICY "System can delete reminder logs" ON public.reminder_logs TO service_role;
ALTER POLICY "System can update messaging metadata" ON public.messaging_metadata TO service_role;
ALTER POLICY "System manages rematch queue" ON public.dia_rematch_queue TO service_role;
ALTER POLICY "System can update hashtags" ON public.hashtags TO service_role;

-- =====================================================================
-- 7. Dead-but-live notification-tampering RPCs (superseded by the
--    canonical get/mark-read notification system, but never dropped and
--    still directly RPC-addressable).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE notifications
  SET is_read = true,
      read = true,
      updated_at = now()
  WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE notifications
  SET is_read = true,
      read = true,
      updated_at = now()
  WHERE user_id = p_user_id
    AND is_read = false;
END;
$$;

-- =====================================================================
-- 8. Forgeable skill endorsements and profile-view analytics — neither
--    validated the caller-identity parameter. Dead code today (no live
--    caller anywhere in src/ or supabase/functions/), but directly
--    RPC-addressable via the blanket EXECUTE grant to authenticated.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.endorse_skill(p_skill_id UUID, p_endorser_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_endorser_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profile_skills
  SET
    endorsement_count = endorsement_count + 1,
    endorsed_by = array_append(endorsed_by, p_endorser_id)
  WHERE id = p_skill_id
    AND NOT (p_endorser_id = ANY(endorsed_by));
END;
$$;

CREATE OR REPLACE FUNCTION public.record_profile_view_hub(
  p_profile_id UUID,
  p_viewer_id UUID,
  p_context TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_view TIMESTAMPTZ;
BEGIN
  IF p_viewer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Rate limit: max 1 view per viewer per profile per hour
  SELECT viewed_at INTO v_last_view
  FROM profile_views_hub
  WHERE profile_id = p_profile_id AND viewer_id = p_viewer_id
  ORDER BY viewed_at DESC LIMIT 1;

  IF v_last_view IS NULL OR v_last_view < NOW() - INTERVAL '1 hour' THEN
    INSERT INTO profile_views_hub (profile_id, viewer_id, view_context)
    VALUES (p_profile_id, p_viewer_id, p_context);

    UPDATE profiles
    SET profile_views_count = COALESCE(profile_views_count, 0) + 1
    WHERE id = p_profile_id;
  END IF;
END;
$$;

-- trigger_dia_rematch(p_user_id, ...): also dead code today with no
-- caller anywhere; guarded to self-only since that's the only semantic
-- confirmed by any usage pattern in this codebase (queuing a rematch for
-- someone else would need a role check, not a plain identity match) —
-- whoever revives this with a legitimate "queue on behalf of" need
-- should loosen this deliberately, not by this migration silently
-- assuming that need exists.
CREATE OR REPLACE FUNCTION public.trigger_dia_rematch(p_user_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO dia_rematch_queue (user_id, reason, queued_at)
  VALUES (p_user_id, p_reason, NOW())
  ON CONFLICT (user_id) DO UPDATE SET reason = p_reason, queued_at = NOW();
END;
$$;
