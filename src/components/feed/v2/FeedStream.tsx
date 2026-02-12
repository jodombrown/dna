/**
 * DNA | FEED v2 - Feed Stream
 *
 * Virtualized infinite scroll container with progressive loading.
 * Observes the last few items to trigger pagination.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { FeedCard } from './FeedCard';
import { FeedLoadingState } from './FeedLoadingState';
import type { FeedItem, DIAInsightFeedContent } from '@/types/feedTypes';
import { FEED_SCROLL_CONFIG } from '@/lib/feedConfig';

interface FeedStreamProps {
  items: FeedItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentType: string, contentId: string) => void;
  onDIAAction?: (action: DIAInsightFeedContent['actionCTA']) => void;
  onDIADismiss?: (feedItemId: string) => void;
  onItemVisible?: (feedItemId: string) => void;
  showMatchScores?: boolean;
}

export const FeedStream: React.FC<FeedStreamProps> = ({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onEngagementToggle,
  onNavigate,
  onDIAAction,
  onDIADismiss,
  onItemVisible,
  showMatchScores = false,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin: '200px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, onLoadMore]
  );

  // View tracking observer
  const viewObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!onItemVisible) return;

    viewObserverRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-feed-item-id');
            if (itemId) onItemVisible(itemId);
          }
        }
      },
      { threshold: 0.5 }
    );

    return () => {
      viewObserverRef.current?.disconnect();
    };
  }, [onItemVisible]);

  const itemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && viewObserverRef.current) {
        viewObserverRef.current.observe(node);
      }
    },
    []
  );

  if (isLoading) {
    return <FeedLoadingState count={FEED_SCROLL_CONFIG.initialLoadSize > 4 ? 4 : 3} />;
  }

  return (
    <div className="space-y-0 md:space-y-2">
      {items.map((item, index) => {
        const isNearEnd = index >= items.length - FEED_SCROLL_CONFIG.loadThreshold;

        return (
          <div
            key={item.id}
            ref={(node) => {
              // Attach to last items for infinite scroll
              if (isNearEnd) lastItemRef(node);
              // Attach for view tracking
              itemRef(node);
            }}
            data-feed-item-id={item.id}
          >
            <FeedCard
              item={item}
              onEngagementToggle={onEngagementToggle}
              onNavigate={onNavigate}
              onDIAAction={onDIAAction}
              onDIADismiss={onDIADismiss}
              showMatchScores={showMatchScores}
            />
          </div>
        );
      })}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div ref={loadMoreRef}>
          <FeedLoadingState count={2} />
        </div>
      )}

      {/* End of feed */}
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;re all caught up
          </p>
        </div>
      )}
    </div>
  );
};
