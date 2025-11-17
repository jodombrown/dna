/**
 * DNA | FEED - Space Activity Feed
 * 
 * Shows activity within a space via the universal feed.
 */

import React from 'react';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SpaceActivityFeedProps {
  spaceId: string;
  spaceName: string;
  canPost?: boolean;
  onCreatePost?: () => void;
}

export const SpaceActivityFeed: React.FC<SpaceActivityFeedProps> = ({
  spaceId,
  spaceName,
  canPost = false,
  onCreatePost,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const emptyAction = canPost && onCreatePost ? (
    <Button variant="outline" className="mt-4" onClick={onCreatePost}>
      <Plus className="w-4 h-4 mr-2" />
      Start a Conversation
    </Button>
  ) : undefined;

  return (
    <UniversalFeed
      viewerId={user.id}
      spaceId={spaceId}
      tab="all"
      emptyMessage={`No activity in ${spaceName} yet.`}
      emptyAction={emptyAction}
    />
  );
};
