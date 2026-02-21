/**
 * Pinned Posts Section for Profile
 * 
 * Displays user's pinned posts at the top of their profile activity.
 */

import React from 'react';
import { usePinnedPosts } from '@/hooks/usePinnedPosts';
import { UniversalFeedItem as FeedItemComponent } from '@/components/feed/UniversalFeedItem';
import { Card, CardContent } from '@/components/ui/card';
import { Pin, Loader2 } from 'lucide-react';

interface PinnedPostsSectionProps {
  profileUserId: string;
  currentUserId: string;
  isOwnProfile: boolean;
}

export const PinnedPostsSection: React.FC<PinnedPostsSectionProps> = ({
  profileUserId,
  currentUserId,
  isOwnProfile,
}) => {
  const { data: pinnedPosts, isLoading, refetch } = usePinnedPosts(profileUserId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pinnedPosts || pinnedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
        <Pin className="h-4 w-4" />
        <span>Pinned</span>
      </div>
      
      <div className="space-y-4">
        {pinnedPosts.map((post) => (
          <div key={post.post_id} className="relative">
            <FeedItemComponent
              item={post}
              currentUserId={currentUserId}
              onUpdate={refetch}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
