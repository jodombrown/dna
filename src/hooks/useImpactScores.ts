/**
 * DNA | useImpactScores Hook — Sprint 13A
 *
 * Fetches impact scores for a user with caching.
 * Returns cached scores if fresh (<24h), else recomputes.
 */

import { useQuery } from '@tanstack/react-query';
import { getOrComputeImpactScores, type ImpactScores } from '@/services/impact-score-service';

export function useImpactScores(userId: string | undefined) {
  const query = useQuery({
    queryKey: ['impact-scores', userId],
    queryFn: async (): Promise<ImpactScores | null> => {
      if (!userId) return null;
      return getOrComputeImpactScores(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes client-side
    refetchOnWindowFocus: false,
  });

  return {
    scores: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
