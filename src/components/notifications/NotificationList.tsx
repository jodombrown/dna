import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { CheckCheck, Settings, Bell, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAllAsRead, 
    isLoading, 
    unreadCount,
    dismissNotification,
    clearAllNotifications,
    clearReadNotifications
  } = useNotifications(false);

  const handleViewAll = () => {
    navigate('/dna/notifications');
    onClose();
  };

  const handleSettings = () => {
    navigate('/dna/settings/notifications');
    onClose();
  };

  return (
    <div className="flex flex-col h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount && unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {/* Clear options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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

          {unreadCount && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onClose={onClose}
                showDismiss={true}
                onDismiss={dismissNotification}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm mb-1">No notifications</p>
            <p className="text-xs text-muted-foreground">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
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
