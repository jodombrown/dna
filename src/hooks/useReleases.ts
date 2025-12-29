/**
 * DNA Platform: Releases & Features Management System
 * React hooks for releases data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReleases,
  fetchFeaturedReleases,
  fetchRecentReleases,
  fetchArchivedReleases,
  fetchReleaseBySlug,
  fetchRelatedReleases,
  getFeaturedReleasesCount,
  incrementViewCount,
  fetchAllReleaseTags,
  searchReleases,
} from '@/lib/releases';
import type {
  ReleaseFilters,
  ReleaseWithDetails,
  RelatedRelease,
  ReleaseCategory,
} from '@/types/releases';
import { useCallback, useEffect } from 'react';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const releaseKeys = {
  all: ['releases'] as const,
  lists: () => [...releaseKeys.all, 'list'] as const,
  list: (filters?: ReleaseFilters, page?: number) =>
    [...releaseKeys.lists(), { filters, page }] as const,
  featured: () => [...releaseKeys.all, 'featured'] as const,
  recent: () => [...releaseKeys.all, 'recent'] as const,
  archived: () => [...releaseKeys.all, 'archived'] as const,
  details: () => [...releaseKeys.all, 'detail'] as const,
  detail: (slug: string) => [...releaseKeys.details(), slug] as const,
  related: (id: string, category?: ReleaseCategory) =>
    [...releaseKeys.all, 'related', id, category] as const,
  count: () => [...releaseKeys.all, 'count'] as const,
  tags: () => [...releaseKeys.all, 'tags'] as const,
  search: (query: string) => [...releaseKeys.all, 'search', query] as const,
};

// =============================================================================
// LIST HOOKS
// =============================================================================

/**
 * Fetch paginated releases with filters
 */
export function useReleases(filters?: ReleaseFilters, page = 1, limit = 20) {
  return useQuery({
    queryKey: releaseKeys.list(filters, page),
    queryFn: () => fetchReleases(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetch featured releases (last 30 days)
 */
export function useFeaturedReleases() {
  return useQuery({
    queryKey: releaseKeys.featured(),
    queryFn: fetchFeaturedReleases,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch recent releases (31-90 days)
 */
export function useRecentReleases() {
  return useQuery({
    queryKey: releaseKeys.recent(),
    queryFn: fetchRecentReleases,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch archived releases
 */
export function useArchivedReleases() {
  return useQuery({
    queryKey: releaseKeys.archived(),
    queryFn: fetchArchivedReleases,
    staleTime: 10 * 60 * 1000, // 10 minutes - archived changes less frequently
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// =============================================================================
// DETAIL HOOKS
// =============================================================================

/**
 * Fetch a single release by slug
 */
export function useRelease(slug: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: releaseKeys.detail(slug),
    queryFn: () => fetchReleaseBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Increment view count on successful fetch
  useEffect(() => {
    if (query.data && slug) {
      incrementViewCount(slug).catch(console.error);
    }
  }, [query.data, slug]);

  return query;
}

/**
 * Fetch related releases for a given release
 */
export function useRelatedReleases(
  releaseId: string,
  category?: ReleaseCategory,
  limit = 3
) {
  return useQuery({
    queryKey: releaseKeys.related(releaseId, category),
    queryFn: () => fetchRelatedReleases(releaseId, category, limit),
    enabled: !!releaseId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// =============================================================================
// COUNT & UTILITY HOOKS
// =============================================================================

/**
 * Get count of featured releases (for pill badge)
 */
export function useFeaturedCount() {
  return useQuery({
    queryKey: releaseKeys.count(),
    queryFn: getFeaturedReleasesCount,
    staleTime: 1 * 60 * 1000, // 1 minute - check frequently for updates
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get all unique tags from releases
 */
export function useReleaseTags() {
  return useQuery({
    queryKey: releaseKeys.tags(),
    queryFn: fetchAllReleaseTags,
    staleTime: 30 * 60 * 1000, // 30 minutes - tags don't change often
    gcTime: 60 * 60 * 1000,
  });
}

/**
 * Search releases by query
 */
export function useSearchReleases(query: string, limit = 10) {
  return useQuery({
    queryKey: releaseKeys.search(query),
    queryFn: () => searchReleases(query, limit),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// =============================================================================
// COMBINED HOOKS
// =============================================================================

/**
 * Fetch a release with its related releases
 */
export function useReleaseWithRelated(slug: string) {
  const releaseQuery = useRelease(slug);
  const relatedQuery = useRelatedReleases(
    releaseQuery.data?.id || '',
    releaseQuery.data?.category
  );

  return {
    release: releaseQuery.data,
    relatedReleases: relatedQuery.data || [],
    isLoading: releaseQuery.isLoading,
    isLoadingRelated: relatedQuery.isLoading,
    error: releaseQuery.error,
    refetch: releaseQuery.refetch,
  };
}

/**
 * Fetch all releases grouped by lifecycle stage
 */
export function useAllReleasesGrouped() {
  const featuredQuery = useFeaturedReleases();
  const recentQuery = useRecentReleases();
  const archivedQuery = useArchivedReleases();

  return {
    featured: featuredQuery.data || [],
    recent: recentQuery.data || [],
    archived: archivedQuery.data || [],
    isLoading:
      featuredQuery.isLoading ||
      recentQuery.isLoading ||
      archivedQuery.isLoading,
    error: featuredQuery.error || recentQuery.error || archivedQuery.error,
    refetch: useCallback(() => {
      featuredQuery.refetch();
      recentQuery.refetch();
      archivedQuery.refetch();
    }, [featuredQuery, recentQuery, archivedQuery]),
  };
}

// =============================================================================
// PREFETCH HOOKS
// =============================================================================

/**
 * Prefetch release data for faster navigation
 */
export function usePrefetchRelease() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: releaseKeys.detail(slug),
        queryFn: () => fetchReleaseBySlug(slug),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Prefetch releases list for a filter
 */
export function usePrefetchReleases() {
  const queryClient = useQueryClient();

  return useCallback(
    (filters?: ReleaseFilters) => {
      queryClient.prefetchQuery({
        queryKey: releaseKeys.list(filters, 1),
        queryFn: () => fetchReleases(filters, 1, 20),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// =============================================================================
// MUTATION HOOKS (for admin operations)
// =============================================================================

/**
 * Invalidate all release queries (call after mutations)
 */
export function useInvalidateReleases() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: releaseKeys.all });
  }, [queryClient]);
}

export default useReleases;
