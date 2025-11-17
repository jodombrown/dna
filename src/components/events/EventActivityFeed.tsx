/**
 * DNA | FEED - Event Activity Feed
 * 
 * Shows activity around an event via the universal feed.
 */

import React from 'react';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface EventActivityFeedProps {
  eventId: string;
  eventTitle: string;
  canPost?: boolean;
  onCreatePost?: () => void;
}

export const EventActivityFeed: React.FC<EventActivityFeedProps> = ({
  eventId,
  eventTitle,
  canPost = false,
  onCreatePost,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const emptyAction = canPost && onCreatePost ? (
    <Button variant="outline" className="mt-4" onClick={onCreatePost}>
      <MessageCircle className="w-4 h-4 mr-2" />
      Start a Discussion
    </Button>
  ) : undefined;

  return (
    <UniversalFeed
      viewerId={user.id}
      eventId={eventId}
      tab="all"
      emptyMessage={`No activity around "${eventTitle}" yet.`}
      emptyAction={emptyAction}
    />
  );
};
