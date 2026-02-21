/**
 * Hook for fetching an event's discussion thread.
 *
 * Uses messagingPrdService.getEventThread to look up (or lazily create)
 * the conversation linked to an event. Only fetches when `enabled` is true
 * (i.e. the user is a registered attendee or the organizer).
 *
 * Participant count is fetched via a SECURITY DEFINER RPC to bypass
 * conversation_participants RLS (which restricts SELECT to own rows).
 */

import { useQuery } from '@tanstack/react-query';
import { messagingPrdService } from '@/services/messagingPrdService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { STALE_TIMES } from '@/lib/queryClient';

const LOG_TAG = 'useEventThread';

interface UseEventThreadReturn {
  threadId: string | null;
  participantCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useEventThread(eventId: string, enabled: boolean): UseEventThreadReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['event-thread', eventId],
    queryFn: async () => {
      const thread = await messagingPrdService.getEventThread(eventId);
      if (!thread?.id) return { threadId: null, participantCount: 0 };

      // Fetch real count via SECURITY DEFINER RPC
      const { data: count, error: countError } = await (supabase as unknown as { rpc: (fn: string, params: Record<string, string>) => Promise<{ data: number | null; error: { message: string } | null }> })
        .rpc('get_thread_participant_count', { p_conversation_id: thread.id });

      if (countError) {
        logger.error(LOG_TAG, `Failed to fetch participant count for thread ${thread.id}`, countError);
      }

      return {
        threadId: thread.id,
        participantCount: (count as number) ?? 0,
      };
    },
    enabled: !!eventId && enabled,
    staleTime: STALE_TIMES.default,
    retry: 1,
  });

  if (error) {
    logger.error(LOG_TAG, `Failed to fetch event thread for ${eventId}`, error);
  }

  return {
    threadId: data?.threadId ?? null,
    participantCount: data?.participantCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
