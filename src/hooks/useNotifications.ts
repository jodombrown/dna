import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { useEffect } from 'react';

/**
 * useNotifications - Hook for fetching and managing user notifications
 * 
 * Uses the new get_user_notifications RPC function with enhanced notification data
 * including actor information and proper typing. Includes real-time subscriptions.
 * 
 * @param unreadOnly - If true, only fetch unread notifications
 * @param limit - Maximum number of notifications to fetch
 * @param offset - Offset for pagination
 */
export function useNotifications(
  unreadOnly: boolean = false,
  limit: number = 20,
  offset: number = 0
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.id, unreadOnly, limit, offset],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_user_notifications' as any, {
        p_user_id: user.id,
        p_unread_only: unreadOnly,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return (data as unknown as Notification[]) || [];
    },
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase.rpc('get_unread_notification_count' as any, {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching unread notification count:', error);
        return 0;
      }

      return (data as number) || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Mark single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;

      const { error } = await supabase.rpc('mark_notifications_read' as any, {
        p_user_id: user.id,
        p_notification_ids: [notificationId],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase.rpc('mark_all_notifications_read' as any, {
        p_user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications: query.data,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    refetch: query.refetch,
  };
}
