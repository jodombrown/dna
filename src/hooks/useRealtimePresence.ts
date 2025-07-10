import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceUser {
  user_id: string;
  [key: string]: any;
}

export interface PresenceOptions {
  channelName: string;
  enabled?: boolean;
}

export const useRealtimePresence = (options: PresenceOptions) => {
  const { channelName, enabled = true } = options;
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [myPresence, setMyPresence] = useState<any>(null);
  const { getOrCreateChannel, removeChannel } = useRealtimeContext();
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  const updatePresence = useCallback(async (presenceData: any) => {
    if (!enabled || !user || !channelRef.current) return;

    const presence = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      ...presenceData
    };

    setMyPresence(presence);
    await channelRef.current.track(presence);
  }, [enabled, user]);

  const removePresence = useCallback(async () => {
    if (!channelRef.current) return;
    await channelRef.current.untrack();
    setMyPresence(null);
  }, []);

  useEffect(() => {
    if (!enabled || !user) {
      setPresenceUsers([]);
      return;
    }

    const channel = getOrCreateChannel(channelName);
    channelRef.current = channel;

    channel
      .on('presence' as any, { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = (Object.values(presenceState).flat() as unknown as PresenceUser[]).filter(u => u && typeof u === 'object' && 'user_id' in u);
        setPresenceUsers(users);
      })
      .on('presence' as any, { event: 'join' }, ({ newPresences }: any) => {
        console.log('User joined:', newPresences);
      })
      .on('presence' as any, { event: 'leave' }, ({ leftPresences }: any) => {
        console.log('User left:', leftPresences);
      })
      .subscribe();

    return () => {
      removeChannel(channelName);
      channelRef.current = null;
    };
  }, [enabled, user, channelName, getOrCreateChannel, removeChannel]);

  const getOtherUsers = useCallback(() => {
    return presenceUsers.filter(u => u.user_id !== user?.id);
  }, [presenceUsers, user?.id]);

  const getUserPresence = useCallback((userId: string) => {
    return presenceUsers.find(u => u.user_id === userId);
  }, [presenceUsers]);

  const isUserPresent = useCallback((userId: string) => {
    return presenceUsers.some(u => u.user_id === userId);
  }, [presenceUsers]);

  return {
    presenceUsers,
    myPresence,
    updatePresence,
    removePresence,
    getOtherUsers,
    getUserPresence,
    isUserPresent
  };
};