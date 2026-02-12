/**
 * DNA | FEED v2 - Feed Container (Root)
 *
 * The root component for DNA's Intelligence Stream.
 * Orchestrates feed header, stream, empty states, and real-time updates.
 *
 * Usage:
 *   <FeedContainer feedType={FeedType.UNIVERSAL} userId={user.id} />
 *   <FeedContainer feedType={FeedType.CONVENE} userId={user.id} />
 */

import React, { useCallback } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { useFeedRealtime } from '@/hooks/useFeedRealtime';
import { FeedHeader } from './FeedHeader';
import { FeedStream } from './FeedStream';
import { FeedEmptyState } from './FeedEmptyState';
import { FeedLoadingState } from './FeedLoadingState';
import {
  FeedType,
  FeedSortMode,
  type FeedFilters,
  type DIAInsightFeedContent,
} from '@/types/feedTypes';

interface FeedContainerProps {
  feedType: FeedType;
  userId: string;
  userTier?: string;
  userTimezone?: string;
  initialSortMode?: FeedSortMode;
  initialFilters?: FeedFilters;
  onNavigate?: (contentType: string, contentId: string) => void;
  onEmptyAction?: () => void;
  className?: string;
}

export const FeedContainer: React.FC<FeedContainerProps> = ({
  feedType,
  userId,
  userTier = 'free',
  userTimezone,
  initialSortMode,
  initialFilters,
  onNavigate,
  onEmptyAction,
  className,
}) => {
  const feed = useFeed({
    feedType,
    userId,
    userTier,
    userTimezone,
    initialSortMode,
    initialFilters,
  });

  // Real-time subscription
  useFeedRealtime({
    feedType,
    userId,
    onNewItem: feed.incrementNewItems,
    enabled: !!userId,
  });

  // DIA action handler
  const handleDIAAction = useCallback(
    (action: DIAInsightFeedContent['actionCTA']) => {
      if (action.type === 'navigate' && action.payload.targetType && action.payload.targetId) {
        onNavigate?.(action.payload.targetType, action.payload.targetId);
      }
    },
    [onNavigate]
  );

  // DIA dismiss handler
  const handleDIADismiss = useCallback((_feedItemId: string) => {
    // Mark insight as dismissed — future enhancement
  }, []);

  // Show match scores for Pro+ users
  const showMatchScores = feed.tierConfig.canSeeMatchScores;

  return (
    <div className={className}>
      {/* Feed Header */}
      <FeedHeader
        feedType={feedType}
        sortMode={feed.sortMode}
        filters={feed.filters}
        tierConfig={feed.tierConfig}
        onSortChange={feed.onSortChange}
        onFilterChange={feed.onFilterChange}
        newItemCount={feed.newItemCount}
        onNewItemsBannerClick={feed.onNewItemsBannerClick}
      />

      {/* Feed Content */}
      {feed.isLoading ? (
        <FeedLoadingState />
      ) : feed.items.length === 0 ? (
        <FeedEmptyState feedType={feedType} onAction={onEmptyAction} />
      ) : (
        <FeedStream
          items={feed.items}
          isLoading={feed.isLoading}
          isLoadingMore={feed.isLoadingMore}
          hasMore={feed.hasMore}
          onLoadMore={feed.onLoadMore}
          onEngagementToggle={feed.onEngagementToggle}
          onNavigate={onNavigate}
          onDIAAction={handleDIAAction}
          onDIADismiss={handleDIADismiss}
          onItemVisible={feed.onItemVisible}
          showMatchScores={showMatchScores}
        />
      )}
    </div>
  );
};
