import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.notification_id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 hover:bg-accent cursor-pointer transition-colors',
        !notification.is_read && 'bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        {notification.actor_id && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor_avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground line-clamp-1">
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true
            })}
          </p>
        </div>

        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMarkAsRead}
            className="h-8 w-8 text-primary hover:text-primary/80 flex-shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
