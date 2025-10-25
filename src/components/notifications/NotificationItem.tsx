import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import {
  UserPlus,
  Heart,
  MessageCircle,
  Mail,
  Calendar,
  Users,
  Bell,
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="h-4 w-4" />;
      case 'post_like':
        return <Heart className="h-4 w-4" />;
      case 'post_comment':
      case 'comment_reply':
        return <MessageCircle className="h-4 w-4" />;
      case 'new_message':
        return <Mail className="h-4 w-4" />;
      case 'event_invite':
      case 'event_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'group_invite':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    onClose();
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors',
        !notification.is_read && 'bg-primary/5'
      )}
    >
      {notification.actor_avatar_url ? (
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={notification.actor_avatar_url}
            alt={notification.actor_full_name || 'User'}
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {notification.actor_full_name
              ? getInitials(notification.actor_full_name)
              : <Bell className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
          {getIcon()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.is_read && 'font-semibold')}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>

      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
