-- Fix M6 (part 2) from the 2026-08-07 codebase bug audit:
-- messagingPrdService.sendMessage bumped each other participant's
-- unread_count with a client-computed read-then-write
-- (`(p.unread_count || 0) + 1`) in a per-participant loop, instead of an
-- atomic DB-side increment — two messages sent to the same participant in
-- quick succession could race and lose an increment.
--
-- Fix: a single atomic UPDATE statement bumps every other participant's
-- unread_count in one round trip, replacing the entire read-then-write
-- loop. (Note: messagingPrdService.sendMessage is not currently wired
-- into any live hook/component — messageService.ts and
-- groupMessageService.ts are the reachable messaging paths — so this
-- closes the defect before it's activated, per the audit's original
-- note.)
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding M6.

CREATE OR REPLACE FUNCTION public.messaging_bump_unread_counts(
  p_conversation_id uuid,
  p_exclude_user_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.messaging_participants
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE conversation_id = p_conversation_id
    AND user_id <> p_exclude_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.messaging_bump_unread_counts(uuid, uuid) TO authenticated;
