import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
  sender?: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface TypingUser {
  user_id: string;
  display_name: string;
}

export const useRealtimeMessaging = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch conversations with user profiles
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      // First get conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Then get profile data for other users
      const otherUserIds = conversationsData?.map(conv => 
        conv.user_1_id === userId ? conv.user_2_id : conv.user_1_id
      ) || [];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, full_name')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const conversationsWithOtherUser = conversationsData?.map(conv => {
        const otherUserId = conv.user_1_id === userId ? conv.user_2_id : conv.user_1_id;
        const otherUserProfile = profilesData?.find(profile => profile.id === otherUserId);
        
        return {
          ...conv,
          other_user: otherUserProfile ? {
            id: otherUserProfile.id,
            display_name: otherUserProfile.display_name || otherUserProfile.full_name || 'Unknown User',
            avatar_url: otherUserProfile.avatar_url || ''
          } : {
            id: otherUserId,
            display_name: 'Unknown User',
            avatar_url: ''
          },
          unread_count: 0 // Will be calculated separately
        };
      }) || [];

      setConversations(conversationsWithOtherUser as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get sender profiles
      const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, full_name')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const messagesWithSenders = messagesData?.map(msg => ({
        ...msg,
        read_by: msg.read_by || [],
        sender: profilesData?.find(profile => profile.id === msg.sender_id) ? {
          id: msg.sender_id,
          display_name: profilesData.find(p => p.id === msg.sender_id)?.display_name || 
                       profilesData.find(p => p.id === msg.sender_id)?.full_name || 'Unknown User',
          avatar_url: profilesData.find(p => p.id === msg.sender_id)?.avatar_url || ''
        } : {
          id: msg.sender_id,
          display_name: 'Unknown User',
          avatar_url: ''
        }
      })) || [];

      setMessages(messagesWithSenders as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!userId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content.trim(),
          read_by: [userId]
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Refresh messages to show the new one
      fetchMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [userId, toast, fetchMessages]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return;

    try {
      // Get unread messages
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('conversation_id', conversationId)
        .not('read_by', 'cs', `{${userId}}`);

      if (fetchError) throw fetchError;

      // Update each unread message
      for (const message of unreadMessages || []) {
        const newReadBy = [...(message.read_by || []), userId];
        await supabase
          .from('messages')
          .update({ read_by: newReadBy })
          .eq('id', message.id);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userId]);

  // Typing indicator functions
  const startTyping = useCallback(async (conversationId: string) => {
    if (!userId || !selectedConversation) return;

    const channel = supabase.channel(`conversation-${conversationId}`);
    await channel.track({
      user_id: userId,
      typing: true,
      timestamp: new Date().toISOString()
    });
  }, [userId, selectedConversation]);

  const stopTyping = useCallback(async (conversationId: string) => {
    if (!userId || !selectedConversation) return;

    const channel = supabase.channel(`conversation-${conversationId}`);
    await channel.track({
      user_id: userId,
      typing: false,
      timestamp: new Date().toISOString()
    });
  }, [userId, selectedConversation]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as any;
        
        // Add to messages if it's for the current conversation
        if (newMessage.conversation_id === selectedConversation) {
          fetchMessages(selectedConversation);
        }

        // Show notification if user is not the sender and not on the conversation
        if (newMessage.sender_id !== userId && 
            (newMessage.conversation_id !== selectedConversation || document.hidden)) {
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: `You have a new message`,
              icon: '/favicon.ico'
            });
          }
          
          toast({
            title: "New Message",
            description: "You have a new message"
          });
        }

        // Update conversations list
        fetchConversations();
      })
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [userId, selectedConversation, fetchConversations, fetchMessages, toast]);

  // Set up typing indicators
  useEffect(() => {
    if (!selectedConversation) return;

    const presenceChannel = supabase
      .channel(`conversation-${selectedConversation}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.typing && presence.user_id !== userId) {
              typing.push({
                user_id: presence.user_id,
                display_name: presence.display_name || 'Someone'
              });
            }
          });
        });
        
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [selectedConversation, userId]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation, fetchMessages, markAsRead]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    typingUsers,
    loading,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchConversations
  };
};