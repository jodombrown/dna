/**
 * usePresence - Hooks for user presence/online status
 *
 * Uses the database RPCs:
 * - get_users_presence(p_user_ids[]) - Get presence for multiple users
 * - update_user_presence(p_user_id, p_status) - Update own presence
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
}

/**
 * Hook to track and update presence for multiple users
 */
export function usePresence(userIds: string[] = []) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch presence for specified users
  const { data: presenceData } = useQuery({
    queryKey: ['presence', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase.rpc('get_users_presence', {
        p_user_ids: userIds,
      });

      if (error) {
        console.error('Error fetching presence:', error);
        return [];
      }

      return (data || []) as UserPresence[];
    },
    enabled: userIds.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
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

  // Update own presence mutation
  const updatePresenceMutation = useMutation({
    mutationFn: async (status: PresenceStatus = 'online') => {
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
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    },
  });

  // Update own presence
  const updateMyPresence = useCallback(
    async (status: PresenceStatus = 'online') => {
      await updatePresenceMutation.mutateAsync(status);
    },
    [updatePresenceMutation]
  );

  // Set online on mount, offline on unmount
  useEffect(() => {
    if (!user) return;

    // Set online when component mounts
    updateMyPresence('online');

    // Set offline when tab is hidden or window is closed
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateMyPresence('away');
      } else {
        updateMyPresence('online');
      }
    };

    const handleBeforeUnload = () => {
      // Use synchronous approach for beforeunload
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/update_user_presence`,
        JSON.stringify({
          p_user_id: user.id,
          p_status: 'offline',
        })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateMyPresence('offline');
    };
  }, [user, updateMyPresence]);

  return {
    presenceMap,
    getPresence,
    isOnline,
    updateMyPresence,
  };
}

/**
 * Hook to get presence for a single user
 */
export function useUserPresence(userId: string | undefined) {
  const { data } = useQuery({
    queryKey: ['presence', userId ? [userId] : []],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.rpc('get_users_presence', {
        p_user_ids: [userId],
      });

      if (error) {
        console.error('Error fetching user presence:', error);
        return null;
      }

      return data?.[0] as UserPresence | undefined;
    },
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    status: (data?.status || 'offline') as PresenceStatus,
    isOnline: data?.status === 'online',
    lastSeen: data?.last_seen_at,
  };
}

/**
 * Hook for conversation presence (other user in a conversation)
 */
export function useConversationPresence(
  conversationId: string,
  otherUserId: string
) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { data } = useQuery({
    queryKey: ['presence', otherUserId ? [otherUserId] : []],
    queryFn: async () => {
      if (!otherUserId) return null;

      const { data, error } = await supabase.rpc('get_users_presence', {
        p_user_ids: [otherUserId],
      });

      if (error) {
        console.error('Error fetching conversation presence:', error);
        return null;
      }

      return data?.[0] as UserPresence | undefined;
    },
    enabled: !!otherUserId,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Update online users list
  useEffect(() => {
    if (data?.status === 'online' && otherUserId) {
      setOnlineUsers([otherUserId]);
    } else {
      setOnlineUsers([]);
    }
  }, [data, otherUserId]);

  return {
    onlineUsers,
    isOtherUserOnline: data?.status === 'online',
  };
}
