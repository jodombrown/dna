import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeQuery } from './useRealtimeQuery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  
  const {
    data: notifications,
    loading,
    error,
    refetch
  } = useRealtimeQuery<Notification>('user-notifications', {
    table: 'notifications',
    select: '*',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    orderBy: { column: 'created_at', ascending: false },
    limit: 50,
    enabled: !!user
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  };
};