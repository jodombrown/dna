
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  User, 
  MessageSquare, 
  AlertTriangle,
  Calendar,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'user_registration' | 'content_flag' | 'event_created' | 'admin_action' | 'community_created';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch recent activities that would generate notifications
    const fetchRecentActivities = async () => {
      try {
        const notifications: Notification[] = [];

        // Get recent user registrations
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        recentProfiles?.forEach(profile => {
          notifications.push({
            id: `user-${profile.id}`,
            type: 'user_registration',
            title: 'New User Registration',
            message: `${profile.full_name || profile.email} has joined the platform`,
            data: { userId: profile.id },
            read: false,
            created_at: profile.created_at
          });
        });

        // Get recent content flags
        const { data: recentFlags } = await supabase
          .from('content_flags')
          .select('id, content_type, reason, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        recentFlags?.forEach(flag => {
          notifications.push({
            id: `flag-${flag.id}`,
            type: 'content_flag',
            title: 'Content Flagged',
            message: `A ${flag.content_type} has been flagged: ${flag.reason}`,
            data: { flagId: flag.id },
            read: false,
            created_at: flag.created_at
          });
        });

        // Get recent communities pending approval
        const { data: pendingCommunities } = await supabase
          .from('communities')
          .select('id, name, created_at')
          .eq('moderation_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        pendingCommunities?.forEach(community => {
          notifications.push({
            id: `community-${community.id}`,
            type: 'community_created',
            title: 'Community Awaiting Approval',
            message: `"${community.name}" community needs review`,
            data: { communityId: community.id },
            read: false,
            created_at: community.created_at
          });
        });

        // Get recent events
        const { data: recentEvents } = await supabase
          .from('events')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentEvents?.forEach(event => {
          notifications.push({
            id: `event-${event.id}`,
            type: 'event_created',
            title: 'New Event Created',
            message: `"${event.title}" event has been created`,
            data: { eventId: event.id },
            read: true, // Mark events as read by default
            created_at: event.created_at
          });
        });

        // Sort by creation date and limit
        notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const limitedNotifications = notifications.slice(0, 10);

        setNotifications(limitedNotifications);
        setUnreadCount(limitedNotifications.filter(n => !n.read).length);

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchRecentActivities();

    // Set up real-time subscriptions for new content
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        const newNotification: Notification = {
          id: `user-${payload.new.id}-${Date.now()}`,
          type: 'user_registration',
          title: 'New User Registration',
          message: `${payload.new.full_name || payload.new.email} has joined the platform`,
          data: { userId: payload.new.id },
          read: false,
          created_at: payload.new.created_at
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'content_flags'
      }, (payload) => {
        const newNotification: Notification = {
          id: `flag-${payload.new.id}-${Date.now()}`,
          type: 'content_flag',
          title: 'Content Flagged',
          message: `A ${payload.new.content_type} has been flagged`,
          data: { flagId: payload.new.id },
          read: false,
          created_at: payload.new.created_at
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'content_flag':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'community_created':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeNotifications;
