// src/components/feed/UniversalFeed.tsx
import React from 'react';
import { useUniversalFeed } from '@/hooks/useUniversalFeed';
import { UniversalFeedItemComponent } from './UniversalFeedItem';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalFeedProps } from '@/types/feed';

export const UniversalFeed: React.FC<UniversalFeedProps> = ({
  viewerId,
  tab = 'all',
  authorId,
  spaceId,
  eventId,
  emptyMessage,
  emptyAction,
}) => {
  const { feedItems, isLoading } = useUniversalFeed({
    viewerId,
    tab,
    authorId,
    spaceId,
    eventId,
  });

  if (!viewerId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {emptyMessage || 'No posts to show yet.'}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <UniversalFeedItemComponent
          key={item.post_id}
          item={item}
          currentUserId={viewerId}
          onUpdate={() => {}}
        />
      ))}
    </div>
  );
};
