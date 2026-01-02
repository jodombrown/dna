/**
 * useUnreadCounts - Real-time unread counts for messages and notifications
 *
 * Provides unified access to unread message and notification counts
 * with real-time updates via Supabase subscriptions.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  messages: {
    unreadCount: number;
  };
  notifications: {
    unreadCount: number;
  };
  isLoading: boolean;
}

const UNREAD_QUERY_KEY = 'unread-counts';

export function useUnreadCounts(): UnreadCounts {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch unread messages count
  const messagesQuery = useQuery({
    queryKey: [UNREAD_QUERY_KEY, 'messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await (supabase as any)
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Fetch unread notifications count using RPC
  const notificationsQuery = useQuery({
    queryKey: [UNREAD_QUERY_KEY, 'notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase.rpc('get_unread_notification_count' as any, {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching unread notifications:', error);
        return 0;
      }

      return (data as number) || 0;
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const instanceId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Messages subscription
    const messagesChannel = supabase
      .channel(`unread-messages-${user.id}-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [UNREAD_QUERY_KEY, 'messages'] });
        }
      )
      .subscribe();

    // Notifications subscription
    const notificationsChannel = supabase
      .channel(`unread-notifications-${user.id}-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [UNREAD_QUERY_KEY, 'notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id, queryClient]);

  return {
    messages: { unreadCount: messagesQuery.data || 0 },
    notifications: { unreadCount: notificationsQuery.data || 0 },
    isLoading: messagesQuery.isLoading || notificationsQuery.isLoading,
  };
}
