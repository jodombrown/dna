/**
 * DNA | FEED - Profile Activity Feed
 * 
 * Shows a user's activity via the universal feed.
 */

import React from 'react';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ProfileActivityFeedProps {
  profileUserId: string;
  profileUsername: string;
  isOwnProfile: boolean;
}

export const ProfileActivityFeed: React.FC<ProfileActivityFeedProps> = ({
  profileUserId,
  profileUsername,
  isOwnProfile,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const emptyMessage = isOwnProfile
    ? "You haven't shared anything yet."
    : `@${profileUsername} hasn't shared anything yet.`;

  const emptyAction = isOwnProfile ? (
    <Button variant="outline" className="mt-4">
      <Sparkles className="w-4 h-4 mr-2" />
      Create Your First Post
    </Button>
  ) : undefined;

  return (
    <UniversalFeed
      viewerId={user.id}
      authorId={profileUserId}
      tab="all"
      emptyMessage={emptyMessage}
      emptyAction={emptyAction}
    />
  );
};
