/**
 * DNA Platform: Releases & Features Management System
 * React hooks for releases data fetching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ReleaseCategory = 'CONNECT' | 'CONVENE' | 'COLLABORATE' | 'CONTRIBUTE' | 'CONVEY' | 'PLATFORM';
export type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type HeroType = 'gradient' | 'image' | 'video' | 'animation' | 'map' | 'chat' | 'network' | 'notification';
export type FilterType = 'all' | 'featured' | 'recent' | 'archived';

export interface Release {
  id: string;
  slug: string;
  version: string | null;
  title: string;
  subtitle: string | null;
  description: string;
  category: ReleaseCategory;
  tags: string[] | null;
  release_date: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  is_pinned: boolean;
  hero_type: HeroType;
  hero_image_url: string | null;
  hero_video_url: string | null;
  cta_text: string;
  cta_link: string | null;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_by: string | null;
  features?: ReleaseFeature[];
  lifecycle_stage?: 'featured' | 'recent' | 'archived';
}

export interface ReleaseFeature {
  id: string;
  release_id: string;
  feature_text: string;
  sort_order: number;
  created_at: string;
}

interface UseReleasesOptions {
  filter?: FilterType;
  category?: ReleaseCategory | null;
  search?: string;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const releaseKeys = {
  all: ['releases'] as const,
  lists: () => [...releaseKeys.all, 'list'] as const,
  list: (filter?: FilterType, category?: ReleaseCategory | null, search?: string) =>
    [...releaseKeys.lists(), { filter, category, search }] as const,
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
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get lifecycle stage based on release date
 */
export const getReleaseBadgeStatus = (releaseDate: string): 'featured' | 'recent' | 'archived' => {
  const now = new Date();
  const release = new Date(releaseDate);
  const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 'featured';
  if (diffDays <= 90) return 'recent';
  return 'archived';
};

/**
 * Group releases by month
 */
export const groupReleasesByMonth = (releases: Release[]): Record<string, Release[]> => {
  return releases.reduce((groups, release) => {
    const date = new Date(release.release_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(release);
    return groups;
  }, {} as Record<string, Release[]>);
};

// =============================================================================
// MAIN HOOKS
// =============================================================================

/**
 * Fetch releases with filters
 */
export const useReleases = (options: UseReleasesOptions = {}) => {
  const { filter = 'all', category = null, search = '' } = options;

  return useQuery({
    queryKey: releaseKeys.list(filter, category, search),
    queryFn: async () => {
      // Use type assertion to bypass TypeScript until types are regenerated
      let query = (supabase as any)
        .from('releases')
        .select(`
          *,
          features:release_features(*)
        `)
        .order('release_date', { ascending: false });

      // Apply filters based on status
      if (filter === 'featured') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query
          .eq('status', 'published')
          .gte('release_date', thirtyDaysAgo.toISOString().split('T')[0]);
      } else if (filter === 'recent') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query
          .eq('status', 'published')
          .lt('release_date', thirtyDaysAgo.toISOString().split('T')[0])
          .gte('release_date', ninetyDaysAgo.toISOString().split('T')[0]);
      } else if (filter === 'archived') {
        query = query.eq('status', 'archived');
      } else {
        // 'all' - show published and archived
        query = query.in('status', ['published', 'archived']);
      }

      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add lifecycle_stage to each release
      return ((data || []) as Release[]).map(release => ({
        ...release,
        lifecycle_stage: getReleaseBadgeStatus(release.release_date)
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Fetch a single release by slug
 */
export const useRelease = (slug: string) => {
  return useQuery({
    queryKey: releaseKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('releases')
        .select(`
          *,
          features:release_features(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      // Increment view count
      if (data?.id) {
        await (supabase as any)
          .from('releases')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

      return {
        ...data,
        lifecycle_stage: getReleaseBadgeStatus(data.release_date)
      } as Release;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Get count of featured releases (for NewFeaturePill badge)
 */
export const useFeaturedCount = () => {
  return useQuery({
    queryKey: releaseKeys.count(),
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count, error } = await (supabase as any)
        .from('releases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('release_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch related releases for a given release
 */
export const useRelatedReleases = (
  releaseId: string,
  category?: ReleaseCategory,
  limit = 3
) => {
  return useQuery({
    queryKey: releaseKeys.related(releaseId, category),
    queryFn: async () => {
      let query = (supabase as any)
        .from('releases')
        .select('id, slug, title, subtitle, category, release_date, hero_type, hero_image_url')
        .neq('id', releaseId)
        .eq('status', 'published')
        .order('release_date', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Release[];
    },
    enabled: !!releaseId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Fetch all unique tags from releases
 */
export const useReleaseTags = () => {
  return useQuery({
    queryKey: releaseKeys.tags(),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('releases')
        .select('tags')
        .eq('status', 'published');

      if (error) throw error;

      // Flatten and dedupe tags
      const allTags = (data || [])
        .flatMap((r: { tags: string[] | null }) => r.tags || [])
        .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index);

      return allTags as string[];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * Search releases by query
 */
export const useSearchReleases = (query: string, limit = 10) => {
  return useQuery({
    queryKey: releaseKeys.search(query),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('releases')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('release_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Release[];
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// =============================================================================
// COMBINED HOOKS
// =============================================================================

/**
 * Fetch a release with its related releases
 */
export const useReleaseWithRelated = (slug: string) => {
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
};

/**
 * Fetch all releases grouped by lifecycle stage
 */
export const useAllReleasesGrouped = () => {
  const featuredQuery = useReleases({ filter: 'featured' });
  const recentQuery = useReleases({ filter: 'recent' });
  const archivedQuery = useReleases({ filter: 'archived' });

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
};

// =============================================================================
// PREFETCH & UTILITY HOOKS
// =============================================================================

/**
 * Prefetch release data for faster navigation
 */
export const usePrefetchRelease = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: releaseKeys.detail(slug),
        queryFn: async () => {
          const { data, error } = await (supabase as any)
            .from('releases')
            .select(`
              *,
              features:release_features(*)
            `)
            .eq('slug', slug)
            .single();

          if (error) throw error;
          return data as Release;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};

/**
 * Invalidate all release queries (call after mutations)
 */
export const useInvalidateReleases = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: releaseKeys.all });
  }, [queryClient]);
};

export default useReleases;
