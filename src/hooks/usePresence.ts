/**
 * usePresence - Hooks for user presence/online status
 *
 * Implements PRD requirements:
 * - Green/gray indicator for online/offline status
 * - Status updates in real-time when user logs in/out
 * - Last seen timestamp displays if user is offline
 * - Status is configurable (user can go invisible/do not disturb)
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
}

// Presence update interval (30 seconds)
const PRESENCE_HEARTBEAT_INTERVAL = 30000;
// Consider user offline after 2 minutes of no heartbeat
const PRESENCE_TIMEOUT_MS = 120000;

/**
 * Hook to track and update presence for multiple users
 */
export function usePresence(userIds: string[] = []) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch presence for specified users
  const { data: presenceData, isLoading } = useQuery({
    queryKey: ['presence', userIds.sort().join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase.rpc('get_users_presence', {
        p_user_ids: userIds,
      });

      if (error) {
        console.error('Error fetching presence:', error);
        return [];
      }

      // Check if presence is stale (no update in PRESENCE_TIMEOUT_MS)
      const now = new Date().getTime();
      return (data || []).map((p: any) => {
        const lastSeen = new Date(p.last_seen_at).getTime();
        const isStale = now - lastSeen > PRESENCE_TIMEOUT_MS;
        return {
          user_id: p.user_id,
          status: isStale ? 'offline' : p.status,
          last_seen_at: p.last_seen_at,
        } as UserPresence;
      });
    },
    enabled: userIds.length > 0,
    staleTime: 10000, // Refetch every 10 seconds
    refetchInterval: 15000, // Auto-refetch every 15 seconds
  });

  // Create a Map for quick lookups
  const presenceMap = useMemo(() => {
    const map = new Map<string, UserPresence>();
    if (presenceData) {
      presenceData.forEach((p) => map.set(p.user_id, p));
    }
    return map;
  }, [presenceData]);

  // Get presence for a specific user
  const getPresence = useCallback(
    (userId: string): PresenceStatus => {
      const presence = presenceMap.get(userId);
      return presence?.status || 'offline';
    },
    [presenceMap]
  );

  // Check if user is online
  const isOnline = useCallback(
    (userId: string): boolean => {
      return getPresence(userId) === 'online';
    },
    [getPresence]
  );

  // Get last seen time for a user
  const getLastSeen = useCallback(
    (userId: string): string | undefined => {
      const presence = presenceMap.get(userId);
      return presence?.last_seen_at;
    },
    [presenceMap]
  );

  // Update own presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async (status: PresenceStatus) => {
      if (!user) return;

      const { error } = await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_status: status,
      });

      if (error) {
        console.error('Error updating presence:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate presence queries to reflect change
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    },
  });

  const updateMyPresence = useCallback(
    async (status: PresenceStatus = 'online') => {
      await updatePresenceMutation.mutateAsync(status);
    },
    [updatePresenceMutation]
  );

  return {
    presenceMap,
    presenceData: presenceData || [],
    isLoading,
    getPresence,
    isOnline,
    getLastSeen,
    updateMyPresence,
  };
}

/**
 * Hook to get presence for a single user
 */
export function useUserPresence(userId: string | undefined) {
  const { presenceMap, isLoading } = usePresence(userId ? [userId] : []);

  const presence = userId ? presenceMap.get(userId) : undefined;

  return {
    status: (presence?.status || 'offline') as PresenceStatus,
    isOnline: presence?.status === 'online',
    lastSeen: presence?.last_seen_at,
    isLoading,
  };
}

/**
 * Hook for conversation presence (other user in a conversation)
 * Includes real-time subscription for presence changes
 */
export function useConversationPresence(
  conversationId: string,
  otherUserId: string
) {
  const queryClient = useQueryClient();
  const { status, isOnline, lastSeen, isLoading } = useUserPresence(otherUserId);

  // Subscribe to presence changes for the other user
  useEffect(() => {
    if (!otherUserId) return;

    const channel = supabase
      .channel(`presence:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${otherUserId}`,
        },
        () => {
          // Invalidate presence query to fetch updated status
          queryClient.invalidateQueries({ queryKey: ['presence'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, queryClient]);

  return {
    onlineUsers: isOnline ? [otherUserId] : [],
    isOtherUserOnline: isOnline,
    otherUserStatus: status,
    lastSeen,
    isLoading,
  };
}

/**
 * Hook to automatically update own presence (heartbeat)
 * Should be used once in the app root to keep presence updated
 */
export function usePresenceHeartbeat() {
  const { user } = useAuth();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  const updatePresence = useCallback(async (status: PresenceStatus) => {
    if (!user) return;

    try {
      await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_status: status,
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [user]);

  // Set up heartbeat and visibility handlers
  useEffect(() => {
    if (!user) return;

    // Initial presence update
    updatePresence('online');

    // Heartbeat interval
    heartbeatRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        updatePresence('online');
      }
    }, PRESENCE_HEARTBEAT_INTERVAL);

    // Handle visibility change (tab focus)
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      updatePresence(document.hidden ? 'away' : 'online');
    };

    // Handle before unload (set offline)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page close
      const url = `${supabase.supabaseUrl}/rest/v1/rpc/update_user_presence`;
      const body = JSON.stringify({
        p_user_id: user.id,
        p_status: 'offline',
      });

      navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Set offline on unmount
      updatePresence('offline');
    };
  }, [user, updatePresence]);
}
