/**
 * DNA | NotificationSystemCenter
 *
 * The main notification center panel. Desktop: dropdown from bell icon.
 * Mobile: full-screen view.
 *
 * Features:
 * - Five C's filter bar
 * - Time-grouped notification list (Today, Yesterday, This Week, Earlier)
 * - Infinite scroll pagination
 * - Mark all as read
 * - Empty state with DNA branding
 * - Real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, Settings, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { NotificationSystemCard } from './NotificationSystemCard';
import { NotificationFilterBar } from './NotificationFilterBar';
import type { NotificationFilter, NotificationRecord } from '@/types/notificationSystem';
import { CModule } from '@/types/composer';

interface NotificationSystemCenterProps {
  onClose: () => void;
  variant?: 'dropdown' | 'fullscreen';
}

export function NotificationSystemCenter({
  onClose,
  variant = 'dropdown',
}: NotificationSystemCenterProps) {
  const navigate = useNavigate();
  const [moduleFilter, setModuleFilter] = useState<CModule | 'all'>('all');

  const filter: NotificationFilter = {
    category: 'all',
    cModule: moduleFilter,
    readStatus: 'all',
  };

  const {
    notifications,
    groupedNotifications,
    unreadCount,
    badgeCounts,
    isLoading,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    markAsOpened,
    dismiss,
    markAllAsRead,
    markVisibleAsSeen,
  } = useNotificationSystem(filter);

  // Mark visible as seen when panel opens
  useEffect(() => {
    markVisibleAsSeen();
  }, [markVisibleAsSeen]);

  const handleNotificationOpen = useCallback((id: string) => {
    markAsOpened(id);
    onClose();
  }, [markAsOpened, onClose]);

  const handleDismiss = useCallback((id: string) => {
    dismiss(id);
  }, [dismiss]);

  const handleSettings = () => {
    navigate('/dna/settings/notifications');
    onClose();
  };

  const handleViewAll = () => {
    navigate('/dna/notifications');
    onClose();
  };

  const isDropdown = variant === 'dropdown';
  const maxHeight = isDropdown ? 'max-h-[80vh]' : 'h-full';

  return (
    <div className={cn('flex flex-col bg-background', maxHeight, isDropdown && 'w-[420px]')}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {unreadCount > 0 && (
                <DropdownMenuItem onClick={() => markAllAsRead()}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Notification settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Five C's filter bar */}
      <NotificationFilterBar
        activeFilter={moduleFilter}
        onFilterChange={setModuleFilter}
        badgeCounts={badgeCounts}
      />

      {/* Notification list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-sm mb-1">You're all caught up</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              When something happens in your diaspora network, you'll see it here.
            </p>
          </div>
        ) : (
          <div>
            {groupedNotifications.map((group) => (
              <div key={group.label}>
                {/* Time group header */}
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 sticky top-0 z-10">
                  {group.label}
                </div>

                {/* Notifications in this group */}
                <div className="divide-y divide-border/50">
                  {group.notifications.map((notif) => {
                    if ('headline' in notif && 'recipientId' in notif) {
                      return (
                        <NotificationSystemCard
                          key={notif.id}
                          notification={notif as NotificationRecord}
                          onOpen={handleNotificationOpen}
                          onDismiss={handleDismiss}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && isDropdown && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full text-sm text-primary hover:text-primary/90"
            onClick={handleViewAll}
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
}
