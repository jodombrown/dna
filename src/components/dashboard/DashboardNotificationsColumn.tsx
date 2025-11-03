import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardNotificationsColumn = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { notifications, markAllAsRead, isLoading } = useNotifications(
    filter === 'unread'
  );

  const unreadNotifications = notifications?.filter((n) => !n.is_read) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          {unreadNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
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
