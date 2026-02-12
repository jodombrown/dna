/**
 * DNA | useNotificationSystem Hook
 *
 * Primary hook for the notification system. Provides:
 * - Fetching notifications with Five C's filtering
 * - Real-time subscription for new notifications
 * - Badge counts per module
 * - Status mutations (seen, opened, acted_on, dismissed)
 * - Preference management
 * - Infinite scroll pagination
 */

import { useEffect, useCallback, useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notificationSystemService } from '@/services/notificationSystemService';
import type {
  NotificationRecord,
  NotificationFilter,
  NotificationDisplayItem,
  NotificationGroup,
  NotificationPreferences,
} from '@/types/notificationSystem';
import { CModule } from '@/types/composer';

const QUERY_KEY_NOTIFICATIONS = 'notification-system';
const QUERY_KEY_UNREAD_COUNT = 'notification-system-unread';
const QUERY_KEY_BADGE_COUNTS = 'notification-system-badges';
const QUERY_KEY_PREFERENCES = 'notification-system-prefs';

// ============================================================
// TIME GROUPING UTILITY
// ============================================================

function getTimeGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  if (diffMinutes < 5) return 'Just now';
  if (diffHours < 24 && date.getDate() === now.getDate()) return 'Today';
  if (diffDays < 2) return 'Yesterday';
  if (diffDays < 7) return 'This week';
  return 'Earlier';
}

export function groupNotificationsByTime(
  notifications: NotificationDisplayItem[]
): NotificationGroup[] {
  const groups: Map<string, NotificationDisplayItem[]> = new Map();
  const order = ['Just now', 'Today', 'Yesterday', 'This week', 'Earlier'];

  for (const notif of notifications) {
    const createdAt = 'createdAt' in notif ? notif.createdAt : (notif as NotificationRecord).createdAt;
    const label = getTimeGroupLabel(createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(notif);
  }

  return order
    .filter(label => groups.has(label))
    .map(label => ({ label, notifications: groups.get(label)! }));
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useNotificationSystem(
  filter: NotificationFilter = { category: 'all', cModule: 'all', readStatus: 'all' }
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ----------------------------------------------------------
  // Fetch notifications with pagination
  // ----------------------------------------------------------
  const notificationsQuery = useInfiniteQuery({
    queryKey: [QUERY_KEY_NOTIFICATIONS, user?.id, filter],
    queryFn: async ({ pageParam }) => {
      if (!user) return { notifications: [], hasMore: false };
      return notificationSystemService.getNotifications(
        user.id,
        filter,
        pageParam as string | null,
        30
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.notifications.length === 0) return undefined;
      const last = lastPage.notifications[lastPage.notifications.length - 1];
      return 'createdAt' in last ? last.createdAt : undefined;
    },
    initialPageParam: null as string | null,
    enabled: !!user,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Flatten pages
  const allNotifications = useMemo(() => {
    return notificationsQuery.data?.pages.flatMap(p => p.notifications) || [];
  }, [notificationsQuery.data]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(allNotifications);
  }, [allNotifications]);

  // ----------------------------------------------------------
  // Unread count
  // ----------------------------------------------------------
  const unreadQuery = useQuery({
    queryKey: [QUERY_KEY_UNREAD_COUNT, user?.id],
    queryFn: async () => {
      if (!user) return 0;
      return notificationSystemService.getUnreadCount(user.id);
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ----------------------------------------------------------
  // Badge counts by module
  // ----------------------------------------------------------
  const badgeQuery = useQuery({
    queryKey: [QUERY_KEY_BADGE_COUNTS, user?.id],
    queryFn: async () => {
      if (!user) return {} as Record<string, number>;
      return notificationSystemService.getUnreadByModule(user.id);
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ----------------------------------------------------------
  // Real-time subscription
  // ----------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    const instanceId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const channelName = `notif_system_rt_${user.id}_${instanceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_records',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notification_records',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'badge_counts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // ----------------------------------------------------------
  // Mutations
  // ----------------------------------------------------------
  const markAsSeenMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!user) return;
      await notificationSystemService.markAsSeen(user.id, notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
    },
  });

  const markAsOpenedMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      await notificationSystemService.markAsOpened(user.id, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
    },
  });

  const markAsActedOnMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      await notificationSystemService.markAsActedOn(user.id, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      await notificationSystemService.dismiss(user.id, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await notificationSystemService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_UNREAD_COUNT] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BADGE_COUNTS] });
    },
  });

  // ----------------------------------------------------------
  // Mark visible notifications as seen when the list opens
  // ----------------------------------------------------------
  const markVisibleAsSeen = useCallback(() => {
    const unreadIds = allNotifications
      .filter(n => 'status' in n && n.status === 'delivered')
      .map(n => n.id);

    if (unreadIds.length > 0) {
      markAsSeenMutation.mutate(unreadIds);
    }
  }, [allNotifications, markAsSeenMutation]);

  return {
    // Data
    notifications: allNotifications,
    groupedNotifications,
    unreadCount: unreadQuery.data || 0,
    badgeCounts: badgeQuery.data || {},
    isLoading: notificationsQuery.isLoading,
    hasMore: notificationsQuery.hasNextPage || false,

    // Pagination
    fetchNextPage: notificationsQuery.fetchNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,

    // Mutations
    markAsSeen: markAsSeenMutation.mutate,
    markAsOpened: markAsOpenedMutation.mutate,
    markAsActedOn: markAsActedOnMutation.mutate,
    dismiss: dismissMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    markVisibleAsSeen,

    // Refresh
    refetch: notificationsQuery.refetch,
  };
}

// ============================================================
// PREFERENCES HOOK
// ============================================================

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: [QUERY_KEY_PREFERENCES, user?.id],
    queryFn: async () => {
      if (!user) return null;
      return notificationSystemService.getPreferences(user.id);
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user) return;
      await notificationSystemService.updatePreferences(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFERENCES] });
    },
  });

  return {
    preferences: prefsQuery.data,
    isLoading: prefsQuery.isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

// ============================================================
// BADGE COUNT HOOK (lightweight, for nav bar)
// ============================================================

export function useNotificationBadgeCounts() {
  const { user } = useAuth();

  const badgeQuery = useQuery({
    queryKey: [QUERY_KEY_BADGE_COUNTS, user?.id],
    queryFn: async () => {
      if (!user) return {} as Record<string, number>;
      return notificationSystemService.getUnreadByModule(user.id);
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const totalUnread = useMemo(() => {
    return Object.values(badgeQuery.data || {}).reduce((sum, count) => sum + count, 0);
  }, [badgeQuery.data]);

  return {
    badgeCounts: badgeQuery.data || {},
    totalUnread,
    isLoading: badgeQuery.isLoading,
  };
}
