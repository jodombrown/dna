/**
 * usePresence - Stub hooks for presence feature
 * 
 * NOTE: Presence feature requires additional database functions
 * that are not yet implemented. These stubs prevent build errors.
 */

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
}

export function usePresence(_userIds: string[] = []) {
  return {
    presenceMap: new Map<string, UserPresence>(),
    getPresence: (_userId: string): PresenceStatus => 'offline',
    isOnline: (_userId: string) => false,
    updateMyPresence: async (_status: PresenceStatus = 'online') => {},
  };
}

export function useUserPresence(_userId: string | undefined) {
  return {
    status: 'offline' as PresenceStatus,
    isOnline: false,
  };
}

export function useConversationPresence(_conversationId: string, _otherUserId: string) {
  return {
    onlineUsers: [] as string[],
    isOtherUserOnline: false,
  };
}
