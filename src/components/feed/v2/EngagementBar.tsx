/**
 * DNA | FEED v2 - Engagement Bar
 *
 * Standard engagement bar for feed cards. Renders contextual
 * actions based on content type (like, comment, reshare, RSVP, join, etc.)
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  CalendarPlus,
  CalendarCheck,
  UserPlus,
  UserCheck,
  HandMetal,
} from 'lucide-react';
import type { FeedContentType, FeedEngagement, EngagementAction } from '@/types/feedTypes';
import { getEngagementConfig } from '@/lib/feedConfig';

interface EngagementBarProps {
  contentType: FeedContentType;
  engagement: FeedEngagement;
  feedItemId: string;
  onToggle: (feedItemId: string, action: string) => void;
  onCommentClick?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  CalendarPlus,
  CalendarCheck,
  UserPlus,
  UserCheck,
  HandMetal,
};

function getCount(engagement: FeedEngagement, actionType: string): number {
  switch (actionType) {
    case 'like':
      return engagement.likeCount;
    case 'comment':
      return engagement.commentCount;
    case 'reshare':
      return engagement.reshareCount;
    case 'bookmark':
      return engagement.bookmarkCount;
    case 'rsvp':
      return engagement.rsvpCount || 0;
    case 'join':
      return engagement.memberCount || 0;
    case 'interest':
      return engagement.interestCount || 0;
    default:
      return 0;
  }
}

function isActive(engagement: FeedEngagement, actionType: string): boolean {
  switch (actionType) {
    case 'like':
      return engagement.isLikedByMe;
    case 'bookmark':
      return engagement.isBookmarkedByMe;
    case 'reshare':
      return engagement.isResharedByMe;
    default:
      return false;
  }
}

function formatCount(count: number): string {
  if (count === 0) return '';
  if (count < 1000) return String(count);
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  return `${Math.floor(count / 1000)}K`;
}

export const EngagementBar: React.FC<EngagementBarProps> = ({
  contentType,
  engagement,
  feedItemId,
  onToggle,
  onCommentClick,
}) => {
  const actions = getEngagementConfig(contentType);

  const handleAction = useCallback(
    (actionType: string) => {
      if (actionType === 'comment' && onCommentClick) {
        onCommentClick();
        return;
      }
      onToggle(feedItemId, actionType);
    },
    [feedItemId, onToggle, onCommentClick]
  );

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      {actions.map((action) => {
        const active = isActive(engagement, action.type);
        const count = getCount(engagement, action.type);
        const IconComponent = ICON_MAP[active ? action.activeIcon : action.icon];

        return (
          <Button
            key={action.type}
            variant="ghost"
            size="sm"
            className={cn(
              'flex items-center gap-1.5 h-9 px-3 text-xs font-medium',
              'transition-colors duration-150',
              active && 'font-semibold'
            )}
            style={active ? { color: action.activeColor } : undefined}
            onClick={() => handleAction(action.type)}
            aria-label={action.label}
          >
            {IconComponent && (
              <IconComponent
                className={cn(
                  'w-[18px] h-[18px]',
                  active && 'fill-current'
                )}
              />
            )}
            {action.countVisible && count > 0 && (
              <span>{formatCount(count)}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
