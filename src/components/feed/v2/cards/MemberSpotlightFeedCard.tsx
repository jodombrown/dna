/**
 * DNA | FEED v2 - Member Spotlight Card
 *
 * Surfaces member profiles in the feed for connection discovery.
 * Shows profile info, sector tags, and connection reasoning.
 * Content type badge: "CONNECT"
 * Primary CTA: "Connect" button
 */

import React, { useState } from 'react';
import { FeedCardShell } from './FeedCardShell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MapPin, Users, Check } from 'lucide-react';
import type { FeedItem } from '@/types/feedTypes';

interface MemberSpotlightFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
}

interface MemberSpotlightContent {
  type: 'member_spotlight';
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string | null;
  sectors: string[];
  location: string | null;
  connectionReasoning: string;
  mutualConnectionCount: number;
}

export const MemberSpotlightFeedCard: React.FC<MemberSpotlightFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
}) => {
  const [requestSent, setRequestSent] = useState(false);

  // For MemberSpotlight, the content may be structured differently
  // We use what's available from the FeedItem
  const author = item.createdBy;

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requestSent) {
      onEngagementToggle(item.id, 'connect');
      setRequestSent(true);
    }
  };

  const initials = author.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FeedCardShell
      contentType="post"
      primaryC={item.primaryC}
      createdAt={item.createdAt}
      onClick={() => onNavigate?.(item.contentId)}
    >
      {/* Content Type Badge */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className="text-[10px] font-medium border-dna-emerald text-dna-emerald"
        >
          <UserPlus className="h-3 w-3 mr-0.5" />
          CONNECT
        </Badge>
      </div>

      {/* Member Profile */}
      <div className="flex items-start gap-4 mb-3">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatarUrl || undefined} alt={author.displayName} />
          <AvatarFallback className="text-lg bg-dna-emerald/10 text-dna-emerald">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg">{author.displayName}</h3>
          {author.headline && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {author.headline}
            </p>
          )}
        </div>
      </div>

      {/* Mutual Connections */}
      {author.mutualConnectionCount > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Users className="h-3.5 w-3.5" />
          <span>
            {author.mutualConnectionCount} mutual connection
            {author.mutualConnectionCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Connect CTA */}
      <Button
        size="sm"
        className="h-9 text-xs w-full bg-dna-emerald hover:bg-dna-emerald/90"
        onClick={handleConnect}
        disabled={requestSent}
      >
        {requestSent ? (
          <>
            <Check className="h-3.5 w-3.5 mr-1" />
            Request Sent
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Connect
          </>
        )}
      </Button>
    </FeedCardShell>
  );
};
