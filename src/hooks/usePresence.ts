import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { UserPresence, PresenceStatus } from '@/types/messaging';

/**
 * usePresence - Global user presence management hook
 *
 * Implements PRD requirements:
 * - Green dot for online users
 * - Presence updates < 5 seconds
 * - Auto-update status on visibility change
 *
 * Automatically sets current user to online and tracks multiple users' presence.
 */
export function usePresence(userIds: string[] = []) {
  const { user } = useAuth();
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [isTracking, setIsTracking] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Update current user's presence
  const updateMyPresence = useCallback(
    async (status: PresenceStatus = 'online') => {
      if (!user) return;
      await messageService.updatePresence(status);
    },
    [user]
  );

  // Fetch presence for specified users
  const fetchPresence = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    const presences = await messageService.getUsersPresence(ids);
    const newMap = new Map<string, UserPresence>();

    presences.forEach((p) => {
      newMap.set(p.user_id, p);
    });

    setPresenceMap(newMap);
  }, []);

  // Get presence for a specific user
  const getPresence = useCallback(
    (userId: string): PresenceStatus => {
      const presence = presenceMap.get(userId);
      if (!presence) return 'offline';

      // Check if last seen was within 5 minutes to consider "online"
      const lastSeen = new Date(presence.last_seen_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      if (presence.status === 'online' && lastSeen > fiveMinutesAgo) {
        return 'online';
      } else if (presence.status === 'away') {
        return 'away';
      }
      return 'offline';
    },
    [presenceMap]
  );

  // Check if a user is online
  const isOnline = useCallback(
    (userId: string): boolean => {
      return getPresence(userId) === 'online';
    },
    [getPresence]
  );

  // Start tracking presence
  useEffect(() => {
    if (!user || isTracking) return;

    setIsTracking(true);

    // Set online status immediately
    updateMyPresence('online');

    // Heartbeat every 30 seconds to maintain presence
    heartbeatRef.current = setInterval(() => {
      updateMyPresence('online');
    }, 30000);

    // Handle visibility change (tab/window focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateMyPresence('online');
      } else {
        updateMyPresence('away');
      }
    };

    // Handle before unload (closing tab/window)
    const handleBeforeUnload = () => {
      updateMyPresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateMyPresence('offline');
      setIsTracking(false);
    };
  }, [user, isTracking, updateMyPresence]);

  // Fetch presence for specified users
  useEffect(() => {
    if (userIds.length === 0) return;

    // Initial fetch
    fetchPresence(userIds);

    // Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchPresence(userIds);
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [userIds.join(','), fetchPresence]);

  // Subscribe to real-time presence changes
  useEffect(() => {
    subscriptionRef.current = messageService.subscribeToGlobalPresence(() => {
      // Re-fetch presence when changes occur
      if (userIds.length > 0) {
        fetchPresence(userIds);
      }
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [userIds.join(','), fetchPresence]);

  return {
    presenceMap,
    getPresence,
    isOnline,
    updateMyPresence,
  };
}

/**
 * useUserPresence - Simple hook to get a single user's presence
 */
export function useUserPresence(userId: string | undefined) {
  const { getPresence, isOnline } = usePresence(userId ? [userId] : []);

  if (!userId) {
    return { status: 'offline' as PresenceStatus, isOnline: false };
  }

  return {
    status: getPresence(userId),
    isOnline: isOnline(userId),
  };
}

/**
 * useConversationPresence - Hook for presence in conversation context
 */
export function useConversationPresence(conversationId: string, otherUserId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    channelRef.current = messageService.subscribeToPresence(
      conversationId,
      (presences) => {
        setOnlineUsers(presences.map((p) => p.user_id));
      }
    );

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [conversationId]);

  const isOtherUserOnline = onlineUsers.includes(otherUserId);

  return {
    onlineUsers,
    isOtherUserOnline,
  };
}
