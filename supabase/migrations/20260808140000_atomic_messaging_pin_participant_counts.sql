-- Second audit pass: messagingPrdService.ts had three more read-then-write
-- counters beyond the unread_count one already fixed (see
-- 20260807160000_atomic_messaging_unread_bump.sql, finding M6 part 2).
-- pinMessage/unpinMessage and addParticipant/removeParticipant each read
-- conversations_new's pinned_message_count/participant_count via
-- getConversation(), then wrote back stale_value ± 1 in a second round
-- trip — the same class of lost-update race as the already-fixed
-- unread_count.
--
-- Note: messagingPrdService is not fully dead — useEventThread calls its
-- read-only getEventThread/getConversation/getConversationsByContext, live
-- via EventThreadCTA — but sendMessage/pinMessage/unpinMessage/
-- addParticipant/removeParticipant etc. have zero live callers today. This
-- closes the defect before the write paths are activated.

CREATE OR REPLACE FUNCTION public.messaging_bump_pinned_count(
  p_conversation_id uuid,
  p_delta integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.conversations_new
  SET pinned_message_count = GREATEST(0, COALESCE(pinned_message_count, 0) + p_delta)
  WHERE id = p_conversation_id;
$$;

GRANT EXECUTE ON FUNCTION public.messaging_bump_pinned_count(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.messaging_bump_participant_count(
  p_conversation_id uuid,
  p_delta integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.conversations_new
  SET participant_count = GREATEST(0, COALESCE(participant_count, 0) + p_delta)
  WHERE id = p_conversation_id;
$$;

GRANT EXECUTE ON FUNCTION public.messaging_bump_participant_count(uuid, integer) TO authenticated;
