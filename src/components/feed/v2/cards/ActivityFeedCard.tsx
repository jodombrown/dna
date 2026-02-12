/**
 * DNA | FEED v2 - Activity Card (lightweight)
 *
 * Renders lightweight network activity items like
 * "Sarah connected with James", "Maria joined Space X".
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, CalendarCheck, Users, HandMetal, BookOpen, CheckCircle } from 'lucide-react';
import type { FeedItem, ActivityFeedContent, ActivityType } from '@/types/feedTypes';

interface ActivityFeedCardProps {
  item: FeedItem;
  onNavigate?: (targetType: string | null, targetId: string | null) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, React.FC<{ className?: string }>> = {
  new_connection: UserPlus,
  event_rsvp: CalendarCheck,
  space_joined: Users,
  opportunity_interest: HandMetal,
  story_published: BookOpen,
  task_completed: CheckCircle,
  role_filled: Users,
};

export const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ item, onNavigate }) => {
  const content = item.content as ActivityFeedContent;
  const Icon = ACTIVITY_ICONS[content.activityType] || UserPlus;

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        'px-4 py-3 md:px-5',
        'border-b border-border/20 md:border md:border-border/30 md:rounded-xl',
        'hover:bg-accent/20 transition-colors cursor-pointer'
      )}
      style={{
        borderLeftWidth: '2px',
        borderLeftColor: '#4A8D77',
        borderLeftStyle: 'solid',
      }}
      onClick={() => onNavigate?.(content.targetType, content.targetId)}
    >
      {/* Actor avatars */}
      <div className="flex -space-x-2 shrink-0">
        {content.actors.slice(0, 2).map((actor) => (
          <Avatar key={actor.id} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={actor.avatarUrl || undefined} />
            <AvatarFallback className="text-[10px] bg-muted">
              {actor.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Activity icon */}
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

      {/* Activity text */}
      <p className="text-sm text-muted-foreground flex-1 min-w-0 line-clamp-1">
        {content.activityText}
      </p>
    </div>
  );
};
