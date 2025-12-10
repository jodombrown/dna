/**
 * usePresence - Hooks for user presence/online status
 * 
 * Note: Presence RPCs may not exist in the database yet.
 * For now, return mock data until they're implemented.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Return empty map - presence system not fully implemented
  const presenceData: UserPresence[] = [];

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

  // Update own presence - no-op for now
  const updateMyPresence = useCallback(
    async (status: PresenceStatus = 'online') => {
      // No-op - RPC not implemented
    },
    []
  );

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
  return {
    status: 'offline' as PresenceStatus,
    isOnline: false,
    lastSeen: undefined,
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

  return {
    onlineUsers,
    isOtherUserOnline: false,
  };
}
