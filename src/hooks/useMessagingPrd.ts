/**
 * DNA Messaging Hooks (PRD)
 *
 * React hooks for the messaging system. Provides:
 * - useMessagingConversations: Conversation list with filters
 * - useMessagingThread: Messages for a conversation with real-time updates
 * - useMessagingActions: Send, react, pin, edit, delete
 * - useConversationSubscription: Real-time subscription to a conversation
 * - useSmartReplies: DIA smart reply suggestions
 * - useOfflineQueue: Offline queue state and management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { messagingPrdService } from '@/services/messagingPrdService';
import { diaMessagingService } from '@/services/diaMessagingService';
import { offlineQueueService } from '@/services/offlineQueueService';
import { logger } from '@/lib/logger';
import { MESSAGING_PAGINATION, MESSAGING_RATE_LIMITS } from '@/lib/messagingConstants';
import type {
  Conversation,
  ConversationPreview,
  ConversationFilter,
  ConversationSubscriptionCallbacks,
  Message,
  SendMessageParams,
  TypingIndicator,
  DIASmartReply,
  DIAConversationSuggestion,
  OfflineQueueState,
  ParticipantRole,
  MuteStatus,
} from '@/types/messagingPRD';
import { ConversationType, MessageContentType } from '@/types/messagingPRD';

const LOG_TAG = 'useMessagingPrd';

// ============================================================
// CONVERSATION LIST HOOK
// ============================================================

/**
 * Hook for fetching and filtering the conversation list (inbox).
 */
export function useMessagingConversations(initialFilter?: Partial<ConversationFilter>) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ConversationFilter>({
    type: 'all',
    readStatus: 'all',
    searchQuery: '',
    ...initialFilter,
  });

  const queryResult = useQuery({
    queryKey: ['messaging-conversations', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return { conversations: [], hasMore: false };
      return messagingPrdService.getConversations(
        user.id,
        filter,
        null,
        MESSAGING_PAGINATION.conversationListPageSize
      );
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30s
  });

  const totalUnreadQuery = useQuery({
    queryKey: ['messaging-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      return messagingPrdService.getTotalUnreadCount(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Refresh every 15s
  });

  return {
    conversations: queryResult.data?.conversations || [],
    hasMore: queryResult.data?.hasMore || false,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    totalUnread: totalUnreadQuery.data || 0,
    filter,
    setFilter,
    refetch: queryResult.refetch,
  };
}

// ============================================================
// MESSAGE THREAD HOOK
// ============================================================

/**
 * Hook for fetching messages in a conversation thread with pagination.
 */
export function useMessagingThread(conversationId: string | null) {
  const { user } = useAuth();
  const [cursor, setCursor] = useState<string | null>(null);

  const queryResult = useQuery({
    queryKey: ['messaging-thread', conversationId],
    queryFn: async () => {
      if (!conversationId) return { messages: [], hasMore: false };
      return messagingPrdService.getMessages(
        conversationId,
        null,
        MESSAGING_PAGINATION.messageThreadPageSize
      );
    },
    enabled: !!conversationId,
  });

  const loadMore = useCallback(async () => {
    if (!conversationId || !queryResult.data?.hasMore) return;

    const messages = queryResult.data.messages;
    if (messages.length > 0) {
      const oldestMessage = messages[0];
      setCursor(oldestMessage.createdAt.toISOString());
    }
  }, [conversationId, queryResult.data]);

  // Mark as read when messages load
  useEffect(() => {
    if (!conversationId || !user?.id || !queryResult.data?.messages.length) return;

    const messages = queryResult.data.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId !== user.id) {
      messagingPrdService.markAsRead(conversationId, user.id, lastMessage.id).catch((err) => {
        logger.warn(LOG_TAG, 'Failed to mark as read', err);
      });
    }
  }, [conversationId, user?.id, queryResult.data?.messages]);

  return {
    messages: queryResult.data?.messages || [],
    hasMore: queryResult.data?.hasMore || false,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    loadMore,
    refetch: queryResult.refetch,
  };
}

// ============================================================
// MESSAGING ACTIONS HOOK
// ============================================================

/**
 * Hook providing messaging actions: send, react, pin, edit, delete.
 */
export function useMessagingActions(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateThread = useCallback(() => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ['messaging-thread', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    }
  }, [conversationId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!conversationId || !user?.id) throw new Error('Not ready');

      // Check if online
      if (!navigator.onLine) {
        return offlineQueueService.enqueue('send_message', {
          conversationId,
          senderId: user.id,
          ...params,
        });
      }

      return messagingPrdService.sendMessage(conversationId, user.id, params);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.addReaction(messageId, user.id, emoji);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.removeReaction(messageId, user.id, emoji);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  const pinMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!conversationId || !user?.id) throw new Error('Not ready');
      return messagingPrdService.pinMessage(conversationId, messageId, user.id);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, newContent }: { messageId: string; newContent: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.editMessage(messageId, user.id, newContent);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.deleteMessage(messageId, user.id);
    },
    onSuccess: () => {
      invalidateThread();
    },
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    addReaction: addReactionMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    pinMessage: pinMessageMutation.mutateAsync,
    editMessage: editMessageMutation.mutateAsync,
    deleteMessage: deleteMessageMutation.mutateAsync,
  };
}

// ============================================================
// REAL-TIME SUBSCRIPTION HOOK
// ============================================================

/**
 * Hook for subscribing to real-time events on a conversation.
 * Handles new messages, typing indicators, read receipts, and reactions.
 */
export function useConversationSubscription(
  conversationId: string | null,
  callbacks?: Partial<ConversationSubscriptionCallbacks>
) {
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!conversationId) return;

    const cleanup = messagingPrdService.subscribeToConversation(conversationId, {
      onMessage: (message) => {
        // Update the thread query cache with the new message
        queryClient.invalidateQueries({ queryKey: ['messaging-thread', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messaging-unread-count'] });
        callbacks?.onMessage?.(message);
      },
      onTyping: (indicator) => {
        if (indicator.isTyping) {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.set(indicator.userId, indicator);
            return next;
          });

          // Auto-clear typing after 5 seconds
          const existingTimeout = typingTimeoutsRef.current.get(indicator.userId);
          if (existingTimeout) clearTimeout(existingTimeout);

          const timeout = setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.delete(indicator.userId);
              return next;
            });
          }, 5000);
          typingTimeoutsRef.current.set(indicator.userId, timeout);
        } else {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(indicator.userId);
            return next;
          });
        }

        callbacks?.onTyping?.(indicator);
      },
      onReadReceipt: (data) => {
        queryClient.invalidateQueries({ queryKey: ['messaging-thread', conversationId] });
        callbacks?.onReadReceipt?.(data);
      },
      onReaction: (data) => {
        queryClient.invalidateQueries({ queryKey: ['messaging-thread', conversationId] });
        callbacks?.onReaction?.(data);
      },
    });

    return () => {
      cleanup();
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      setTypingUsers(new Map());
    };
  }, [conversationId, queryClient, callbacks]);

  return {
    typingUsers: Array.from(typingUsers.values()),
  };
}

// ============================================================
// TYPING INDICATOR HOOK
// ============================================================

/**
 * Hook for sending typing indicators with throttling.
 */
export function useTypingIndicatorSender(conversationId: string | null) {
  const { user } = useAuth();
  const lastSentRef = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId || !user?.id) return;

      const now = Date.now();
      if (isTyping && now - lastSentRef.current < MESSAGING_RATE_LIMITS.typingIndicatorThrottleMs) {
        return; // Throttle
      }
      lastSentRef.current = now;

      messagingPrdService.sendTypingIndicator(
        conversationId,
        user.id,
        user.user_metadata?.full_name || 'Someone',
        isTyping
      );

      // Auto-stop typing after 5 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          messagingPrdService.sendTypingIndicator(
            conversationId,
            user.id,
            user.user_metadata?.full_name || 'Someone',
            false
          );
        }, 5000);
      }
    },
    [conversationId, user]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { sendTyping };
}

// ============================================================
// DIA SMART REPLIES HOOK
// ============================================================

/**
 * Hook for DIA smart reply suggestions.
 * Returns up to 3 contextual reply suggestions.
 */
export function useSmartReplies(conversationId: string | null, messages: Message[]) {
  const { user } = useAuth();

  const queryResult = useQuery({
    queryKey: ['smart-replies', conversationId, messages.length],
    queryFn: async () => {
      if (!conversationId || !user?.id || messages.length === 0) return [];
      return diaMessagingService.generateSmartReplies(conversationId, messages, user.id);
    },
    enabled: !!conversationId && !!user?.id && messages.length > 0,
    staleTime: 10000, // Cache for 10s
  });

  return {
    smartReplies: queryResult.data || [],
    isLoading: queryResult.isLoading,
  };
}

// ============================================================
// DIA CROSS-C SUGGESTION HOOK
// ============================================================

/**
 * Hook for DIA cross-C module suggestions.
 * Detects when a conversation should bridge to Events, Spaces, etc.
 */
export function useCrossCDetection(conversationId: string | null, messages: Message[]) {
  const queryResult = useQuery({
    queryKey: ['cross-c-detection', conversationId, messages.length],
    queryFn: async () => {
      if (!conversationId || messages.length < 3) return null;
      return diaMessagingService.detectCrossCOpportunity(conversationId, messages);
    },
    enabled: !!conversationId && messages.length >= 3,
    staleTime: 60000, // Check once per minute
  });

  return {
    suggestion: queryResult.data || null,
    isLoading: queryResult.isLoading,
  };
}

// ============================================================
// OFFLINE QUEUE HOOK
// ============================================================

/**
 * Hook for offline queue state monitoring and management.
 */
export function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>(offlineQueueService.getState());

  useEffect(() => {
    offlineQueueService.setStateChangeCallback(setState);
    return () => {
      offlineQueueService.setStateChangeCallback((() => {}) as (state: OfflineQueueState) => void);
    };
  }, []);

  return {
    ...state,
    pendingCount: offlineQueueService.getPendingCount(),
    failedCount: offlineQueueService.getFailedCount(),
    retryFailed: () => offlineQueueService.retryFailed(),
    clear: () => offlineQueueService.clear(),
  };
}

// ============================================================
// CONVERSATION CREATION HOOKS
// ============================================================

/**
 * Hook for creating conversations of any type.
 */
export function useCreateConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createDirect = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.createDirectConversation(user.id, recipientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    },
  });

  const createGroup = useMutation({
    mutationFn: async (params: { title: string; participantIds: string[]; imageUrl?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.createGroupConversation(user.id, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    },
  });

  const createEventThread = useMutation({
    mutationFn: async (params: { eventId: string; eventTitle: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.createEventThread(params.eventId, user.id, params.eventTitle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    },
  });

  const createSpaceChannel = useMutation({
    mutationFn: async (params: { spaceId: string; channelName?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.createSpaceChannel(params.spaceId, user.id, params.channelName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    },
  });

  const createOpportunityThread = useMutation({
    mutationFn: async (params: {
      opportunityId: string;
      posterId: string;
      opportunityTitle: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagingPrdService.createOpportunityThread(
        params.opportunityId,
        params.posterId,
        user.id,
        params.opportunityTitle
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-conversations'] });
    },
  });

  return {
    createDirect: createDirect.mutateAsync,
    createGroup: createGroup.mutateAsync,
    createEventThread: createEventThread.mutateAsync,
    createSpaceChannel: createSpaceChannel.mutateAsync,
    createOpportunityThread: createOpportunityThread.mutateAsync,
    isCreating:
      createDirect.isPending ||
      createGroup.isPending ||
      createEventThread.isPending ||
      createSpaceChannel.isPending ||
      createOpportunityThread.isPending,
  };
}

// ============================================================
// MESSAGE SEARCH HOOK
// ============================================================

/**
 * Hook for full-text search across conversations.
 */
export function useMessageSearch(query: string, conversationId?: string) {
  const { user } = useAuth();

  const queryResult = useQuery({
    queryKey: ['messaging-search', query, conversationId],
    queryFn: async () => {
      if (!user?.id || !query.trim()) return [];
      return messagingPrdService.searchMessages(
        user.id,
        query,
        conversationId,
        MESSAGING_PAGINATION.searchResultsPageSize
      );
    },
    enabled: !!user?.id && query.trim().length >= 2,
    staleTime: 5000,
  });

  return {
    results: queryResult.data || [],
    isSearching: queryResult.isLoading,
    error: queryResult.error,
  };
}
