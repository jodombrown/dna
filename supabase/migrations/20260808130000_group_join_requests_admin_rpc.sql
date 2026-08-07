-- =============================================
-- Second audit pass: GroupJoinRequests.tsx RLS crash
-- =============================================
--
-- GroupJoinRequests.tsx joined group_join_requests to profiles(user_id)
-- and read req.profiles.username unconditionally. profiles' SELECT policy
-- ("profiles_select_fixed") only lets a viewer see a profile that is
-- public, their own, or belongs to an accepted connection — exactly the
-- case a join request exists for is a stranger asking to join, often
-- with a private profile and no connection to the admin reviewing it.
-- PostgREST returns profiles: null for that row (no !inner), and the very
-- next line threw a TypeError reading .username off null — failing the
-- whole query, not just that row, so the entire pending-requests panel
-- silently disappeared (`if (!requests || requests.length === 0) return
-- null`) for a group with even one non-public/unconnected requester.
--
-- This RPC gives a group owner/admin the minimal requester identity
-- fields they legitimately need to review a join request, regardless of
-- the requester's general profile visibility — the same "this specific
-- admin action needs a narrower, deliberate carve-out of the general
-- privacy policy" pattern as admin_verify_user.

CREATE OR REPLACE FUNCTION public.get_group_join_requests(p_group_id UUID)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
      AND gm.is_banned = false
  ) THEN
    RAISE EXCEPTION 'Only group owners or admins can view join requests';
  END IF;

  RETURN QUERY
  SELECT
    r.id, r.group_id, r.user_id,
    p.username, p.full_name, p.avatar_url, p.headline,
    r.message, r.status, r.created_at
  FROM public.group_join_requests r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.group_id = p_group_id
    AND r.status = 'pending'
  ORDER BY r.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_group_join_requests(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_group_join_requests(UUID) TO authenticated;
