/**
 * usePresence - Simplified presence hooks
 * 
 * Note: Full presence tracking requires additional database setup.
 * This provides a simplified interface that defaults to offline.
 */

import { useCallback, useMemo } from 'react';

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
}

/**
 * Hook to track presence for multiple users (simplified - returns offline)
 */
export function usePresence(userIds: string[] = []) {
  // Simplified presence - returns empty/offline for now
  const presenceMap = useMemo(() => new Map<string, UserPresence>(), []);

  const getPresence = useCallback(
    (_userId: string): PresenceStatus => 'offline',
    []
  );

  const isOnline = useCallback(
    (_userId: string): boolean => false,
    []
  );

  const getLastSeen = useCallback(
    (_userId: string): string | undefined => undefined,
    []
  );

  const updateMyPresence = useCallback(
    async (_status: PresenceStatus = 'online') => {
      // No-op for now
    },
    []
  );

  return {
    presenceMap,
    presenceData: [],
    isLoading: false,
    getPresence,
    isOnline,
    getLastSeen,
    updateMyPresence,
  };
}

/**
 * Hook to get presence for a single user (simplified)
 */
export function useUserPresence(_userId: string | undefined) {
  return {
    status: 'offline' as PresenceStatus,
    isOnline: false,
    lastSeen: undefined,
    isLoading: false,
  };
}

/**
 * Hook for conversation presence (simplified)
 */
export function useConversationPresence(
  _conversationId: string,
  _otherUserId: string
) {
  return {
    onlineUsers: [] as string[],
    isOtherUserOnline: false,
    otherUserStatus: 'offline' as PresenceStatus,
    lastSeen: undefined,
    isLoading: false,
  };
}

/**
 * Hook to automatically update own presence (heartbeat) - simplified no-op
 */
export function usePresenceHeartbeat() {
  // No-op - presence heartbeat requires database functions
}
