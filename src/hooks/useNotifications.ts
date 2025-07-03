
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  action_type: 'like' | 'comment' | 'follow' | 'tag';
  target_type: 'post' | 'user';
  target_id: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    full_name: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) throw notificationsError;

      // Then fetch actor profiles separately
      const actorIds = [...new Set(notificationsData?.map(n => n.actor_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, display_name')
        .in('id', actorIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const enrichedNotifications = (notificationsData || []).map(notification => ({
        ...notification,
        // Type cast the action_type to ensure it matches our interface
        action_type: notification.action_type as 'like' | 'comment' | 'follow' | 'tag',
        target_type: notification.target_type as 'post' | 'user',
        actor: profilesData?.find(p => p.id === notification.actor_id)
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (
    recipientId: string,
    actorId: string,
    actionType: 'like' | 'comment' | 'follow' | 'tag',
    targetType: 'post' | 'user',
    targetId: string
  ) => {
    // Don't create notification if user is notifying themselves
    if (recipientId === actorId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          actor_id: actorId,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId
        });

      if (error && error.code !== '23505') { // Ignore duplicate constraint errors
        throw error;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};
