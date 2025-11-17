/**
 * DNA | FEED v1.2 - Infinite Scroll Component
 * 
 * Universal Feed with infinite scrolling and Top/Latest toggle.
 */

import React, { useEffect, useRef } from 'react';
import { useInfiniteUniversalFeed } from '@/hooks/useInfiniteUniversalFeed';
import { UniversalFeedItemComponent } from './UniversalFeedItem';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { Card } from '@/components/ui/card';
import { Newspaper, Loader2 } from 'lucide-react';
import { FeedTab, RankingMode } from '@/types/feed';
import { supabase } from '@/integrations/supabase/client';

type FeedSurface = 'home' | 'profile' | 'space' | 'event' | 'mobile';

interface UniversalFeedInfiniteProps {
  viewerId: string;
  tab?: FeedTab;
  authorId?: string;
  spaceId?: string;
  eventId?: string;
  rankingMode?: RankingMode;
  surface?: FeedSurface;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export const UniversalFeedInfinite: React.FC<UniversalFeedInfiniteProps> = ({
  viewerId,
  tab = 'all',
  authorId,
  spaceId,
  eventId,
  rankingMode = 'latest',
  surface = 'home',
  emptyMessage,
  emptyAction,
}) => {
  const { 
    feedItems, 
    isLoading, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch 
  } = useInfiniteUniversalFeed({
    viewerId,
    tab,
    authorId,
    spaceId,
    eventId,
    rankingMode,
  });

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);
  const itemsViewedRef = useRef(0);

  // Track feed view on mount
  useEffect(() => {
    supabase.from('analytics_events').insert({
      event_name: 'feed_view',
      event_metadata: { surface, tab, rankingMode, viewerId },
      route: window.location.pathname,
    }).then(() => {});
  }, [surface, tab, rankingMode, viewerId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonPostCard key={i} />
        ))}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          {emptyMessage || 'No posts to show'}
        </h3>
        {emptyAction}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <UniversalFeedItemComponent
          key={item.post_id}
          item={item}
          currentUserId={viewerId}
          onUpdate={refetch}
        />
      ))}
      
      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!hasNextPage && feedItems.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            You're all caught up! 🎉
          </p>
        )}
      </div>
    </div>
  );
};
