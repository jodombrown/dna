import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { opportunityMatchingService, MatchingOpportunity, OpportunityMatchScore } from '@/services/opportunityMatchingService';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';

/**
 * Hook to get matching opportunities for the current user
 */
export function useMatchingOpportunities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['matching-opportunities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return opportunityMatchingService.getMatchingOpportunities(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get match score for a specific opportunity
 */
export function useOpportunityMatchScore(opportunityId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['opportunity-match-score', user?.id, opportunityId],
    queryFn: async () => {
      if (!user?.id || !opportunityId) return null;
      return opportunityMatchingService.getMatchScore(user.id, opportunityId);
    },
    enabled: !!user?.id && !!opportunityId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get trending opportunities
 */
export function useTrendingOpportunities(limit: number = 5) {
  return useQuery({
    queryKey: ['trending-opportunities', limit],
    queryFn: () => opportunityMatchingService.getTrendingOpportunities(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get network opportunities (from user's spaces)
 */
export function useNetworkOpportunities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['network-opportunities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return opportunityMatchingService.getNetworkOpportunities(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search opportunities with profile matching
 */
export function useOpportunitySearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (query: string) => {
      if (!user?.id) return [];
      return opportunityMatchingService.searchOpportunities(user.id, query);
    },
    onSuccess: (data) => {
      // Cache search results
      queryClient.setQueryData(['opportunity-search-results'], data);
    },
  });
}

/**
 * Hook to generate opportunity nudge message
 */
export function useOpportunityNudge() {
  const { user } = useAuth();

  const generateNudge = (
    opportunity: ContributionNeedWithSpace,
    matchData: OpportunityMatchScore
  ): string => {
    if (!user?.id) return '';
    return opportunityMatchingService.generateOpportunityNudge(user.id, opportunity, matchData);
  };

  return { generateNudge };
}

/**
 * Combined hook for opportunity recommendations widget
 */
export function useOpportunityRecommendations() {
  const matchingQuery = useMatchingOpportunities();
  const trendingQuery = useTrendingOpportunities(3);
  const networkQuery = useNetworkOpportunities();

  return {
    matching: {
      data: matchingQuery.data,
      isLoading: matchingQuery.isLoading,
      error: matchingQuery.error,
      refetch: matchingQuery.refetch,
    },
    trending: {
      data: trendingQuery.data,
      isLoading: trendingQuery.isLoading,
    },
    network: {
      data: networkQuery.data,
      isLoading: networkQuery.isLoading,
    },
    isLoading: matchingQuery.isLoading,
    refetch: matchingQuery.refetch,
  };
}
