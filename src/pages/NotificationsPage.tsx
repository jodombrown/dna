import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageCircle, Heart, Users, Calendar, Mail, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/app/AppHeader';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  related_entity_id: string;
  related_entity_type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = data as Notification[];
      setNotifications(typedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <Users className="h-5 w-5 text-dna-emerald" />;
      case 'post_comment':
        return <MessageCircle className="h-5 w-5 text-dna-copper" />;
      case 'post_reaction':
        return <Heart className="h-5 w-5 text-dna-gold" />;
      case 'event_update':
        return <Calendar className="h-5 w-5 text-dna-forest" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const filterNotifications = (notifications: Notification[], filter: string) => {
    switch (filter) {
      case 'connections':
        return notifications.filter(n => 
          n.type === 'connection_request' || n.type === 'connection_accepted'
        );
      case 'posts':
        return notifications.filter(n => 
          n.type === 'post_comment' || n.type === 'post_reaction' || n.type === 'mention'
        );
      case 'system':
        return notifications.filter(n => 
          n.type === 'system_announcement' || n.type === 'newsletter_post'
        );
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredNotifications = filterNotifications(notifications, activeTab);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-dna-forest" />
            <h1 className="text-2xl font-bold text-dna-forest">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-dna-gold text-dna-forest">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="connections">People</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">
                    {activeTab === 'all' 
                      ? "You're all caught up! We'll notify you when there's something new."
                      : `No ${activeTab} notifications yet.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                      notification.is_read 
                        ? 'border-transparent bg-white' 
                        : 'border-dna-emerald bg-dna-emerald/5'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-sm font-medium ${
                                notification.is_read ? 'text-gray-700' : 'text-dna-forest'
                              }`}>
                                {notification.title}
                              </h3>
                              
                              {notification.body && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.body}
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-dna-emerald rounded-full mt-2 ml-4"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;