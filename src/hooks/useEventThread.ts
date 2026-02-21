/**
 * Hook for fetching an event's discussion thread.
 *
 * Uses messagingPrdService.getEventThread to look up (or lazily create)
 * the conversation linked to an event. Only fetches when `enabled` is true
 * (i.e. the user is a registered attendee or the organizer).
 */

import { useQuery } from '@tanstack/react-query';
import { messagingPrdService } from '@/services/messagingPrdService';
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
      return thread;
    },
    enabled: !!eventId && enabled,
    staleTime: STALE_TIMES.default, // 5 minutes
    retry: 1,
  });

  if (error) {
    logger.error(LOG_TAG, `Failed to fetch event thread for ${eventId}`, error);
  }

  return {
    threadId: data?.id ?? null,
    participantCount: data?.participantCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
