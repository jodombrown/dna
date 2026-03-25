/**
 * useRealtimeMessaging - Real-time messaging hook with reliability features
 * 
 * Features:
 * - Optimistic updates (pending/sent/failed states)
 * - Client-side deduplication via client_id
 * - Connection state tracking (connected/reconnecting/offline)
 * - Reconnect backoff (1s, 3s, 10s, 30s)
 * - Backfill on reconnect (fetch missed messages)
 * - Typing indicator broadcast via Supabase Realtime Broadcast
 * - Cursor-based pagination
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupMessageService } from '@/services/groupMessageService';
import { logger } from '@/lib/logger';
import type {
  GroupMessage,
  ConnectionStatus,
  TypingUser,
  MediaItem,
} from '@/types/groupMessaging';
import type { RealtimeChannel } from '@supabase/supabase-js';

const BACKOFF_DELAYS = [1000, 3000, 10000, 30000];
const TYPING_THROTTLE_MS = 500;
const TYPING_EXPIRY_MS = 5000;

interface UseRealtimeMessagingOptions {
  conversationId: string;
  type: 'dm' | 'group';
  enabled?: boolean;
}

interface UseRealtimeMessagingReturn {
  messages: GroupMessage[];
  isLoading: boolean;
  isError: boolean;
  sendMessage: (content: string, options?: {
    mediaUrls?: MediaItem[];
    replyToId?: string;
    payload?: Record<string, unknown>;
  }) => Promise<void>;
  connectionStatus: ConnectionStatus;
  retryConnection: () => void;
  typingUsers: TypingUser[];
  broadcastTyping: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useRealtimeMessaging({
  conversationId,
  type,
  enabled = true,
}: UseRealtimeMessagingOptions): UseRealtimeMessagingReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticMessages, setOptimisticMessages] = useState<GroupMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcast = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial messages
  const queryKey = ['group-messages', conversationId];
  const { data: serverMessages = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => groupMessageService.getMessages(conversationId),
    enabled: enabled && !!conversationId,
    staleTime: 30_000,
  });

  // Merge server messages with optimistic messages, deduplicating by client_id
  const messages: GroupMessage[] = (() => {
    const merged = [...serverMessages];

    for (const opt of optimisticMessages) {
      const existsInServer = serverMessages.some(
        m => m.client_id && m.client_id === opt._clientId
      );
      if (!existsInServer) {
        merged.push(opt);
      }
    }

    // Remove confirmed optimistic messages
    const confirmedClientIds = new Set(
      serverMessages.filter(m => m.client_id).map(m => m.client_id)
    );

    if (confirmedClientIds.size > 0) {
      setOptimisticMessages(prev =>
        prev.filter(m => !confirmedClientIds.has(m._clientId ?? null))
      );
    }

    return merged.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  })();

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId || !enabled) return;

    const channelName = `messaging:${conversationId}:${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      // Typing indicators via Broadcast
      .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
        if (payload?.profile_id === user?.id) return;
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.profile_id !== payload.profile_id);
          return [
            ...filtered,
            {
              profile_id: payload.profile_id,
              display_name: payload.display_name,
              started_at: Date.now(),
            },
          ];
        });
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        setTypingUsers(prev => prev.filter(u => u.profile_id !== payload?.profile_id));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          retryCountRef.current = 0;

          // Backfill on reconnect
          queryClient.invalidateQueries({ queryKey });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          handleConnectionError();
        } else if (status === 'CLOSED') {
          setConnectionStatus('offline');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, enabled]);

  // Auto-clear stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev =>
        prev.filter(u => Date.now() - u.started_at < TYPING_EXPIRY_MS)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectionError = useCallback(() => {
    const delay = BACKOFF_DELAYS[Math.min(retryCountRef.current, BACKOFF_DELAYS.length - 1)];
    setConnectionStatus(retryCountRef.current >= BACKOFF_DELAYS.length - 1 ? 'offline' : 'reconnecting');

    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

    retryTimeoutRef.current = setTimeout(() => {
      retryCountRef.current += 1;
      // Resubscribe by invalidating effect
      queryClient.invalidateQueries({ queryKey });
    }, delay);
  }, [queryClient, queryKey]);

  const retryConnection = useCallback(() => {
    retryCountRef.current = 0;
    setConnectionStatus('reconnecting');
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

    // Remove old channel and let effect recreate
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        mediaUrls?: MediaItem[];
        replyToId?: string;
        payload?: Record<string, unknown>;
      }
    ) => {
      if (!user) return;

      const clientId = crypto.randomUUID();
      const optimistic: GroupMessage = {
        message_id: `optimistic-${clientId}`,
        sender_id: user.id,
        sender_username: '',
        sender_full_name: '',
        sender_avatar_url: '',
        content,
        message_type: options?.mediaUrls?.length ? 'media' : 'text',
        media_urls: options?.mediaUrls || [],
        reply_to_id: options?.replyToId || null,
        payload: options?.payload || null,
        client_id: clientId,
        created_at: new Date().toISOString(),
        is_deleted: false,
        edited_at: null,
        _status: 'pending',
        _clientId: clientId,
      };

      setOptimisticMessages(prev => [...prev, optimistic]);

      // Broadcast typing stop
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { profile_id: user.id },
      });

      try {
        await groupMessageService.sendMessage(conversationId, content, {
          messageType: optimistic.message_type,
          mediaUrls: options?.mediaUrls,
          replyToId: options?.replyToId,
          clientId,
          payload: options?.payload,
        });

        // Mark as sent
        setOptimisticMessages(prev =>
          prev.map(m =>
            m._clientId === clientId ? { ...m, _status: 'sent' as const } : m
          )
        );
      } catch (error) {
        logger.error('useRealtimeMessaging', 'Failed to send message', error);
        setOptimisticMessages(prev =>
          prev.map(m =>
            m._clientId === clientId ? { ...m, _status: 'failed' as const } : m
          )
        );
      }
    },
    [conversationId, user]
  );

  const broadcastTyping = useCallback(() => {
    if (!user || !channelRef.current) return;

    const now = Date.now();
    if (now - lastTypingBroadcast.current < TYPING_THROTTLE_MS) return;

    lastTypingBroadcast.current = now;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        profile_id: user.id,
        display_name: user.user_metadata?.full_name || 'Someone',
      },
    });

    // Auto-stop after 3s of no typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { profile_id: user.id },
      });
    }, 3000);
  }, [user]);

  const loadMore = useCallback(() => {
    if (serverMessages.length === 0 || !hasMore) return;

    const oldestId = serverMessages[0]?.message_id;
    if (!oldestId) return;

    groupMessageService
      .getMessages(conversationId, 30, oldestId)
      .then(olderMessages => {
        if (olderMessages.length < 30) setHasMore(false);
        // Prepend older messages to cache
        queryClient.setQueryData<GroupMessage[]>(queryKey, prev => {
          if (!prev) return olderMessages;
          const existingIds = new Set(prev.map(m => m.message_id));
          const newMessages = olderMessages.filter(m => !existingIds.has(m.message_id));
          return [...newMessages, ...prev];
        });
      })
      .catch(err => {
        logger.error('useRealtimeMessaging', 'Failed to load more messages', err);
      });
  }, [conversationId, serverMessages, hasMore, queryClient, queryKey]);

  return {
    messages,
    isLoading,
    isError,
    sendMessage,
    connectionStatus,
    retryConnection,
    typingUsers,
    broadcastTyping,
    loadMore,
    hasMore,
  };
}
