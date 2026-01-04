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
  // Messages table uses conversation_id + sender_id, not recipient_id
  // We need to find messages where user is a participant but not the sender
  const messagesQuery = useQuery({
    queryKey: [UNREAD_QUERY_KEY, 'messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get conversations where user is a participant
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (!participations || participations.length === 0) return 0;

      const conversationIds = participations.map(p => p.conversation_id);
      const lastReadMap = participations.reduce((acc, p) => {
        acc[p.conversation_id] = p.last_read_at;
        return acc;
      }, {} as Record<string, string>);

      // Count unread messages (not sent by user, created after last_read_at)
      let unreadCount = 0;
      for (const convId of conversationIds) {
        const lastRead = lastReadMap[convId];
        let query = supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .neq('sender_id', user.id);
        
        if (lastRead) {
          query = query.gt('created_at', lastRead);
        }

        const { count } = await query;
        unreadCount += count || 0;
      }

      return unreadCount;
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

    // Messages subscription - listen to all message changes (filter by sender later)
    const messagesChannel = supabase
      .channel(`unread-messages-${user.id}-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
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
