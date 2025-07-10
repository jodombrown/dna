import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await conversationsService.getUserConversations(user.id);
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(user_1_id.eq.${user.id},user_2_id.eq.${user.id})`
        },
        () => {
          // Reload conversations when any change occurs
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

  const createConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    const conversationId = await conversationsService.getOrCreateConversation(user.id, otherUserId);
    if (conversationId) {
      await loadConversations(); // Refresh the list
    }
    return conversationId;
  }, [user, loadConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    refetch: loadConversations
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await messagesService.getMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new as Message : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

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
    refetch: loadMessages
  };
};

export const useMessageReactions = (messageIds: string[]) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReactions = useCallback(async () => {
    if (messageIds.length === 0) {
      setReactions([]);
      return;
    }

    try {
      setLoading(true);
      const data = await reactionsService.getMessageReactions(messageIds);
      setReactions(data);
    } catch (err) {
      console.error('Error loading reactions:', err);
    } finally {
      setLoading(false);
    }
  }, [messageIds]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  // Set up real-time subscription for reactions
  useEffect(() => {
    if (messageIds.length === 0) return;

    const channel = supabase
      .channel('message-reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        () => {
          // Reload reactions when any change occurs
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds, loadReactions]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user) return false;
    return await reactionsService.addReaction(messageId, user.id, reaction);
  }, [user]);

  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user) return false;
    return await reactionsService.removeReaction(messageId, user.id, reaction);
  }, [user]);

  const hasUserReacted = useCallback((messageId: string, reaction: string) => {
    return reactions.some(r => 
      r.message_id === messageId && 
      r.user_id === user?.id && 
      r.reaction === reaction
    );
  }, [reactions, user]);

  const getMessageReactions = useCallback((messageId: string) => {
    return reactions.filter(r => r.message_id === messageId);
  }, [reactions]);

  return {
    reactions,
    loading,
    addReaction,
    removeReaction,
    hasUserReacted,
    getMessageReactions
  };
};

export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId || !user) {
      setOtherUserTyping(false);
      return;
    }

    const channelName = `typing-${conversationId}`;
    const channel = supabase.channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const typingUsers = Object.values(presenceState).flat();
        setOtherUserTyping(typingUsers.some((u: any) => u.user_id !== user.id && u.typing));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user]);

  const setTyping = useCallback(async (typing: boolean) => {
    if (!conversationId || !user || !channelRef.current) return;

    await channelRef.current.track({
      user_id: user.id,
      typing,
      timestamp: new Date().toISOString()
    });
  }, [conversationId, user]);

  return {
    otherUserTyping,
    setTyping
  };
};