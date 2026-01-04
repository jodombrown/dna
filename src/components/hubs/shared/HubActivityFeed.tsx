// src/components/hubs/shared/HubActivityFeed.tsx
// Recent activity feed for Five C hub pages

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  avatar?: string;
  avatarFallback?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
}

interface HubActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  onViewAll?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

export function HubActivityFeed({
  title = 'Recent Activity',
  items,
  onViewAll,
  loading = false,
  emptyMessage = 'No recent activity',
  maxItems = 5,
  className,
}: HubActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {onViewAll && items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
            View All
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={!item.onClick}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg text-left',
                  'transition-colors duration-150',
                  item.onClick && 'hover:bg-muted cursor-pointer'
                )}
              >
                {/* Avatar or Icon */}
                {item.avatar || item.avatarFallback ? (
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={item.avatar} alt="" />
                    <AvatarFallback className="text-xs">
                      {item.avatarFallback || item.title.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : item.icon ? (
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-muted">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : null}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>

                {/* Quick Action */}
                {item.quickAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.quickAction!.onClick();
                    }}
                    className="flex-shrink-0 text-xs"
                  >
                    {item.quickAction.label}
                  </Button>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HubActivityFeed;
