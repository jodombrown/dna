/**
 * DNA | Sprint 11 - Feed Query Hook
 *
 * React Query hook that fetches feed content from Supabase,
 * applies client-side scoring with the new feed-scoring engine,
 * and returns sorted, diversified feed items with infinite scroll.
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logHighError } from '@/lib/errorLogger';
import { feedService } from '@/services/feedService';
import { scoreAndRankItems, type UserProfile } from '@/services/feed-scoring';
import { applyDiversityRules } from '@/services/feed-diversity';
import { interleaveDIACards, getSessionCount, type DIAEngagementStats } from '@/services/dia-feed-cadence';
import type {
  FeedItem,
  FeedRequest,
  FeedSortMode,
  FeedType,
  FeedFilters,
  FeedContentType,
} from '@/types/feedTypes';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================
// TYPES
// ============================================================

interface UseFeedQueryOptions {
  feedType?: FeedType;
  sortMode?: FeedSortMode;
  filters?: FeedFilters;
  pageSize?: number;
  enabled?: boolean;
}

interface UseFeedQueryResult {
  items: FeedItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refresh: () => Promise<void>;
  newPostCount: number;
  clearNewPosts: () => void;
}

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 60_000; // Check for new content every 60s

// ============================================================
// HOOK
// ============================================================

export function useFeedQuery(options: UseFeedQueryOptions = {}): UseFeedQueryResult {
  const {
    feedType = 'universal' as FeedType,
    sortMode = 'for_you' as FeedSortMode,
    filters = {},
    pageSize = PAGE_SIZE,
    enabled = true,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPostCount, setNewPostCount] = useState(0);
  const lastFetchTime = useRef<string>(new Date().toISOString());

  const userId = user?.id || '';

  // Build user profile for scoring (simplified - full version would come from personalization engine)
  const userProfile: UserProfile = {
    id: userId,
    sectors: [],
    skills: [],
    interests: [],
    region: null,
    connectionIds: new Set(),
    secondDegreeIds: new Set(),
    sharedSpaceIds: new Set(),
    messageHistoryUserIds: new Set(),
  };

  const diaStats: DIAEngagementStats = {
    totalDIAImpressions: 0,
    totalDIAEngagements: 0,
    sessionCount: getSessionCount(),
    dismissedTypes: [],
  };

  // ============================================================
  // INFINITE QUERY
  // ============================================================

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed-scored', feedType, sortMode, filters, userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User not authenticated');

      const request: FeedRequest = {
        feedType: feedType as FeedType,
        sortMode: sortMode as FeedSortMode,
        filters: filters as FeedFilters,
        cursor: pageParam || null,
        pageSize: pageSize * 2, // Over-fetch for diversity filtering
        userId,
        userTier: 'free' as unknown as import('@/types/composer').UserTier,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const page = await feedService.getFeed(request);

      // Apply Sprint 11 scoring
      const scored = scoreAndRankItems(page.items, userProfile);

      // Apply diversity rules
      const diversified = applyDiversityRules(scored);

      // Trim to page size
      const trimmed = diversified.slice(0, pageSize);

      // Track last fetch time for new post detection
      lastFetchTime.current = new Date().toISOString();

      return {
        items: trimmed,
        cursor: page.cursor,
        hasMore: page.hasMore,
        diaInsights: page.diaInsights,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.cursor;
    },
    initialPageParam: null as string | null,
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });

  // ============================================================
  // FLATTEN PAGES
  // ============================================================

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  // Apply DIA interleaving across all loaded items
  const diaCards = data?.pages.flatMap((page) =>
    (page.diaInsights || []).map((insight, idx): FeedItem => ({
      id: `dia-${Date.now()}-${idx}`,
      type: 'dia_insight' as FeedContentType,
      contentId: `dia-${idx}`,
      primaryC: 'CONNECT' as FeedItem['primaryC'],
      secondaryCs: [],
      createdBy: {
        id: 'dia',
        displayName: 'DIA',
        avatarUrl: null,
        headline: 'Diaspora Intelligence Agent',
        isVerified: true,
        tier: 'org' as FeedItem['createdBy']['tier'],
        connectionDegree: 0,
        mutualConnectionCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      relevanceScore: 1.0,
      rankingSignals: {
        connectionStrength: 0,
        cModuleDiversity: 0,
        skillMatch: 0,
        regionalRelevance: 0,
        engagementVelocity: 0,
        freshness: 1,
        creatorRelationship: 0,
        contentQuality: 1,
      },
      content: insight,
      engagement: {
        likeCount: 0,
        commentCount: 0,
        reshareCount: 0,
        bookmarkCount: 0,
        viewCount: 0,
        isLikedByMe: false,
        isBookmarkedByMe: false,
        isResharedByMe: false,
      },
      crossReferences: [],
      isPro: false,
      isPromoted: false,
    }))
  ) || [];

  const finalItems = interleaveDIACards(allItems, diaCards, diaStats);

  // ============================================================
  // NEW POST POLLING
  // ============================================================

  useEffect(() => {
    if (!userId || !enabled) return;

    const interval = setInterval(async () => {
      try {
        const { count } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .gt('created_at', lastFetchTime.current)
          .limit(1);

        if (count && count > 0) {
          setNewPostCount((prev) => prev + count);
        }
      } catch {
        // Silent fail for polling
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userId, enabled]);

  // ============================================================
  // REFRESH
  // ============================================================

  const refresh = useCallback(async () => {
    setNewPostCount(0);
    await refetch();
  }, [refetch]);

  const clearNewPosts = useCallback(() => {
    setNewPostCount(0);
  }, []);

  return {
    items: finalItems,
    isLoading,
    isRefreshing: false,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    refresh,
    newPostCount,
    clearNewPosts,
  };
}
