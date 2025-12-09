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
  SmilePlus,
  AtSign,
  Repeat2,
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
      case 'reaction':
        return <SmilePlus className="h-4 w-4" />;
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      case 'reshare':
        return <Repeat2 className="h-4 w-4" />;
      case 'profile_view':
        return <UserPlus className="h-4 w-4 text-primary" />;
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
    
    // Navigate to appropriate destination based on notification data
    if (notification.action_url) {
      // Validate action_url starts with valid routes
      const validPrefixes = ['/dna/', '/messages', '/profile'];
      const isValidUrl = validPrefixes.some(prefix => notification.action_url?.startsWith(prefix));
      
      if (isValidUrl) {
        navigate(notification.action_url);
      } else if (notification.entity_type && notification.entity_id) {
        // Fallback: construct URL from entity type and ID
        const entityRoutes: Record<string, string> = {
          'post': `/dna/feed`,
          'story': `/dna/story/${notification.entity_id}`,
          'event': `/dna/convene/events/${notification.entity_id}`,
          'profile': `/dna/${notification.actor_username || notification.entity_id}`,
          'space': `/dna/collaborate/spaces/${notification.entity_id}`,
          'connection': `/dna/connect/network`,
          'message': `/dna/messages`,
        };
        const route = entityRoutes[notification.entity_type] || '/dna/feed';
        navigate(route);
      } else if (notification.actor_username) {
        // Navigate to actor's profile if no other destination
        navigate(`/dna/${notification.actor_username}`);
      } else {
        // Final fallback: go to feed
        navigate('/dna/feed');
      }
    } else if (notification.actor_username) {
      // If no action_url, navigate to actor's profile
      navigate(`/dna/${notification.actor_username}`);
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
