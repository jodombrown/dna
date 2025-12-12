import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCheck, Settings, Trash2, MoreVertical, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const DashboardNotificationsColumn = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { 
    notifications, 
    markAllAsRead,
    markAllAsUnread,
    isLoading,
    dismissNotification,
    deleteAllNotifications,
    deleteReadNotifications
  } = useNotifications(
    filter === 'unread'
  );

  const unreadNotifications = notifications?.filter((n) => !n.is_read) || [];
  const readNotifications = notifications?.filter((n) => n.is_read) || [];
  const hasUnread = unreadNotifications.length > 0;
  const hasRead = readNotifications.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          {/* More options menu (mark read/unread) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasUnread && (
                <DropdownMenuItem onClick={() => markAllAsRead()}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
              )}
              {hasRead && (
                <DropdownMenuItem onClick={() => markAllAsUnread()}>
                  <Circle className="h-4 w-4 mr-2" />
                  Mark all as unread
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete menu (trash icon) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" title="Delete notifications">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasRead && (
                <DropdownMenuItem onClick={() => deleteReadNotifications()}>
                  Delete read notifications
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => deleteAllNotifications()}
                className="text-destructive"
              >
                Delete all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dna/settings/notifications')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {notifications && notifications.length > 0 && (
              <span className="ml-2 text-xs">({notifications.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 text-xs">({unreadNotifications.length})</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onClose={() => {}}
                showDismiss={true}
                onDismiss={dismissNotification}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              {filter === 'unread'
                ? 'All caught up! Check back later for new updates.'
                : 'When you get notifications, they will show up here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
