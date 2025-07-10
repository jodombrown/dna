import React, { useState, useCallback, useMemo } from 'react';
import { useRealtimeQuery } from './useRealtimeQuery';
import { useRealtimePresence } from './useRealtimePresence';
import { 
  conversationsService, 
  messagesService, 
  reactionsService,
  type ConversationWithProfile,
  type Message,
  type MessageReaction
} from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use real-time query for conversations
  const {
    data: rawConversations,
    loading: queryLoading,
    error: queryError,
    refetch
  } = useRealtimeQuery<any>('user-conversations', {
    table: 'conversations',
    select: '*',
    filter: user ? `or(user_1_id=eq.${user.id},user_2_id=eq.${user.id})` : undefined,
    orderBy: { column: 'last_message_at', ascending: false },
    enabled: !!user
  });

  // Transform conversations to include profile data
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);

  const loadConversationProfiles = useCallback(async () => {
    if (!user || rawConversations.length === 0) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      const conversationsWithProfiles: ConversationWithProfile[] = [];
      
      // Get full conversation data with profiles
      const fullConversations = await conversationsService.getUserConversations(user.id);
      setConversations(fullConversations);

      
      setError(null);
    } catch (err) {
      console.error('Error loading conversation profiles:', err);
      setError('Failed to load conversation profiles');
    } finally {
      setLoading(false);
    }
  }, [user, rawConversations]);

  // Load profiles when conversations change
  React.useEffect(() => {
    loadConversationProfiles();
  }, [loadConversationProfiles]);

  const createConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    const conversationId = await conversationsService.getOrCreateConversation(user.id, otherUserId);
    if (conversationId) {
      await refetch();
    }
    return conversationId;
  }, [user, refetch]);

  return {
    conversations,
    loading: queryLoading || loading,
    error: queryError || error,
    createConversation,
    refetch
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();

  const {
    data: messages,
    loading,
    error,
    refetch
  } = useRealtimeQuery<Message>('conversation-messages', {
    table: 'messages',
    select: '*',
    filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    orderBy: { column: 'created_at', ascending: true },
    enabled: !!conversationId
  });

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!conversationId || !user) return false;

    const message = await messagesService.sendMessage(conversationId, user.id, content, attachments);
    return !!message;
  }, [conversationId, user]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch
  };
};

export const useMessageReactions = (messageIds: string[]) => {
  const { user } = useAuth();

  const {
    data: reactions,
    loading
  } = useRealtimeQuery<MessageReaction>('message-reactions', {
    table: 'message_reactions',
    select: '*',
    enabled: messageIds.length > 0
  });

  // Filter reactions for the specific messages
  const filteredReactions = useMemo(() => {
    return reactions.filter(r => messageIds.includes(r.message_id));
  }, [reactions, messageIds]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user) return false;
    return await reactionsService.addReaction(messageId, user.id, reaction);
  }, [user]);

  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user) return false;
    return await reactionsService.removeReaction(messageId, user.id, reaction);
  }, [user]);

  const hasUserReacted = useCallback((messageId: string, reaction: string) => {
    return filteredReactions.some(r => 
      r.message_id === messageId && 
      r.user_id === user?.id && 
      r.reaction === reaction
    );
  }, [filteredReactions, user]);

  const getMessageReactions = useCallback((messageId: string) => {
    return filteredReactions.filter(r => r.message_id === messageId);
  }, [filteredReactions]);

  return {
    reactions: filteredReactions,
    loading,
    addReaction,
    removeReaction,
    hasUserReacted,
    getMessageReactions
  };
};

export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();

  const {
    presenceUsers,
    updatePresence
  } = useRealtimePresence({
    channelName: conversationId ? `typing-${conversationId}` : '',
    enabled: !!conversationId && !!user
  });

  const otherUserTyping = useMemo(() => {
    return presenceUsers.some((u: any) => u.user_id !== user?.id && u.typing);
  }, [presenceUsers, user]);

  const setTyping = useCallback(async (typing: boolean) => {
    if (!conversationId || !user) return;

    await updatePresence({
      typing,
      timestamp: new Date().toISOString()
    });
  }, [conversationId, user, updatePresence]);

  return {
    otherUserTyping,
    setTyping
  };
};