import { useState } from 'react';
import BaseLayout from '@/layouts/BaseLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCheck, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { 
    notifications, 
    markAllAsRead, 
    isLoading,
    dismissNotification,
    clearAllNotifications,
    clearReadNotifications
  } = useNotifications(
    filter === 'unread'
  );

  const unreadNotifications = notifications?.filter((n) => !n.is_read) || [];

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            {/* Clear dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => clearReadNotifications()}>
                  Clear read notifications
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => clearAllNotifications()}
                  className="text-destructive"
                >
                  Clear all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/dna/settings/notifications')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
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
    </BaseLayout>
  );
}
