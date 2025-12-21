import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  display_name: string;
}

interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  startTyping: () => void;
  stopTyping: () => void;
}

/**
 * useTypingIndicator - Hook for managing typing indicators in conversations
 *
 * Uses Supabase Realtime presence to broadcast and receive typing status.
 * Automatically clears typing status after 3 seconds of inactivity.
 *
 * @param conversationId - The conversation ID to track typing for
 * @returns Object with typingUsers array and startTyping/stopTyping functions
 */
export function useTypingIndicator(conversationId: string | null): UseTypingIndicatorReturn {
  const { user, profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to typing presence
  useEffect(() => {
    if (!conversationId || !user?.id) {
      setTypingUsers([]);
      return;
    }

    const channelName = `typing:${conversationId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];

        Object.entries(state).forEach(([userId, presences]) => {
          if (userId !== user.id) {
            const presence = presences[0] as any;
            if (presence?.isTyping) {
              typing.push({
                user_id: userId,
                display_name: presence.displayName || 'Someone',
              });
            }
          }
        });

        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Initial track with not typing
          await channel.track({
            isTyping: false,
            displayName: profile?.full_name || 'User',
            timestamp: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, user?.id, profile?.full_name]);

  const startTyping = useCallback(() => {
    if (!channelRef.current || !profile) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing status
    channelRef.current.track({
      isTyping: true,
      displayName: profile.full_name || 'User',
      timestamp: Date.now(),
    });

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.track({
          isTyping: false,
          displayName: profile.full_name || 'User',
          timestamp: Date.now(),
        });
      }
    }, 3000);
  }, [profile]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (channelRef.current && profile) {
      channelRef.current.track({
        isTyping: false,
        displayName: profile.full_name || 'User',
        timestamp: Date.now(),
      });
    }
  }, [profile]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}
