/**
 * DNA | FEED - Universal Feed Component
 * 
 * The canonical feed component used across all feed surfaces:
 * - Home feed (/dna/feed)
 * - Profile activity feed
 * - Space feed
 * - Event feed
 */

import React, { useState } from 'react';
import { useUniversalFeed } from '@/hooks/useUniversalFeed';
import { UniversalFeedItemComponent } from './UniversalFeedItem';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { Card } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import { FeedTab } from '@/types/feed';

interface UniversalFeedProps {
  viewerId: string;
  tab?: FeedTab;
  authorId?: string;
  spaceId?: string;
  eventId?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export const UniversalFeed: React.FC<UniversalFeedProps> = ({
  viewerId,
  tab = 'all',
  authorId,
  spaceId,
  eventId,
  emptyMessage,
  emptyAction,
}) => {
  const { feedItems, isLoading, refetch } = useUniversalFeed({
    viewerId,
    tab,
    authorId,
    spaceId,
    eventId,
  });

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
    </div>
  );
};
