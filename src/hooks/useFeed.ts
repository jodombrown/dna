/**
 * DNA | FEED v2 - Core Feed Hook
 *
 * Single hook for fetching and managing feed state.
 * Supports infinite scroll pagination, sort modes, and filters.
 */

import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '@/services/feedService';
import { logHighError } from '@/lib/errorLogger';
import {
  FeedType,
  FeedSortMode,
  UserTier,
  type FeedFilters,
  type FeedItem,
  type FeedRequest,
  type FeedPage,
} from '@/types/feedTypes';
import { FEED_SCROLL_CONFIG, FEED_TIER_CONFIG } from '@/lib/feedConfig';

interface UseFeedOptions {
  feedType: FeedType;
  userId: string;
  userTier?: string;
  userTimezone?: string;
  initialSortMode?: FeedSortMode;
  initialFilters?: FeedFilters;
  enabled?: boolean;
}

export function useFeed({
  feedType,
  userId,
  userTier = 'free',
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  initialSortMode = FeedSortMode.FOR_YOU,
  initialFilters = {},
  enabled = true,
}: UseFeedOptions) {
  const queryClient = useQueryClient();
  const [sortMode, setSortMode] = useState(initialSortMode);
  const [filters, setFilters] = useState<FeedFilters>(initialFilters);
  const [newItemCount, setNewItemCount] = useState(0);

  const tierConfig = FEED_TIER_CONFIG[userTier] || FEED_TIER_CONFIG.free;

  const queryKey = ['feed-v2', feedType, userId, sortMode, JSON.stringify(filters)];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const request: FeedRequest = {
        feedType,
        sortMode,
        filters,
        cursor: pageParam,
        pageSize: pageParam ? FEED_SCROLL_CONFIG.pageSize : FEED_SCROLL_CONFIG.initialLoadSize,
        userId,
        userTier: userTier as UserTier,
        userTimezone,
      };
      return feedService.getFeed(request);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: FeedPage) => (lastPage.hasMore ? lastPage.cursor : undefined),
    enabled: !!userId && enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Flatten pages into a single items array
  const items: FeedItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Sort mode change
  const handleSortChange = useCallback(
    (mode: FeedSortMode) => {
      if (!tierConfig.sortModes.includes(mode)) return;
      setSortMode(mode);
      setNewItemCount(0);
    },
    [tierConfig.sortModes]
  );

  // Filter change
  const handleFilterChange = useCallback((updates: Partial<FeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setNewItemCount(0);
  }, []);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refresh
  const handleRefresh = useCallback(async () => {
    setNewItemCount(0);
    await refetch();
  }, [refetch]);

  // Engagement toggle
  const engagementMutation = useMutation({
    mutationFn: ({ feedItemId, action }: { feedItemId: string; action: string }) =>
      feedService.toggleEngagement(feedItemId, action, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 2) });
    },
    onError: (err) => {
      logHighError(err, 'feed', 'engagement toggle failed');
    },
  });

  const handleEngagementToggle = useCallback(
    (feedItemId: string, action: string) => {
      engagementMutation.mutate({ feedItemId, action });
    },
    [engagementMutation]
  );

  // View tracking
  const handleItemVisible = useCallback(
    (feedItemId: string) => {
      feedService.trackView(feedItemId, userId);
    },
    [userId]
  );

  // Increment new item count (called by realtime)
  const incrementNewItems = useCallback(() => {
    setNewItemCount((prev) => prev + 1);
  }, []);

  return {
    // Data
    items,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    isRefreshing: isRefetching,
    isError,
    error,
    hasMore: !!hasNextPage,

    // State
    feedType,
    sortMode,
    filters,
    newItemCount,
    tierConfig,

    // Actions
    onSortChange: handleSortChange,
    onFilterChange: handleFilterChange,
    onLoadMore: handleLoadMore,
    onRefresh: handleRefresh,
    onEngagementToggle: handleEngagementToggle,
    onItemVisible: handleItemVisible,
    onNewItemsBannerClick: handleRefresh,
    incrementNewItems,
  };
}
