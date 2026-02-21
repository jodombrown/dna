/**
 * Hook for fetching an opportunity's discussion thread(s).
 *
 * DUAL PATH based on whether the current user is the poster:
 *  - Non-poster: calls messagingPrdService.getOpportunityThread to get their
 *    private 1:1 thread with the poster (RLS scopes to own threads).
 *  - Poster: calls getConversationsByContext to count all response threads
 *    and, when exactly one response exists, provides that threadId for
 *    direct navigation.
 *
 * Participant count is NOT fetched here — opportunity threads are always 1:1.
 */

import { useQuery } from '@tanstack/react-query';
import { messagingPrdService } from '@/services/messagingPrdService';
import { logger } from '@/lib/logger';
import { STALE_TIMES } from '@/lib/queryClient';

const LOG_TAG = 'useOpportunityThread';

interface UseOpportunityThreadReturn {
  threadId: string | null;
  responseCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useOpportunityThread(
  opportunityId: string,
  currentUserId: string,
  posterId: string,
  enabled: boolean
): UseOpportunityThreadReturn {
  const isPoster = currentUserId === posterId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['opportunity-thread', opportunityId, currentUserId, isPoster],
    queryFn: async () => {
      if (isPoster) {
        // Poster path: count all response threads for this opportunity
        const threads = await messagingPrdService.getConversationsByContext('opportunity', opportunityId);
        return {
          threadId: threads.length === 1 ? threads[0].id : null,
          responseCount: threads.length,
        };
      }

      // Non-poster path: get/create their private 1:1 thread with the poster
      const thread = await messagingPrdService.getOpportunityThread(opportunityId);
      return {
        threadId: thread?.id ?? null,
        responseCount: 0,
      };
    },
    enabled: !!opportunityId && !!currentUserId && enabled,
    staleTime: STALE_TIMES.default,
    retry: 1,
  });

  if (error) {
    logger.error(LOG_TAG, `Failed to fetch opportunity thread for ${opportunityId}`, error);
  }

  return {
    threadId: data?.threadId ?? null,
    responseCount: data?.responseCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
