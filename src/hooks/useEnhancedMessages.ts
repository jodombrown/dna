
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './useMessages';

export interface ConversationSummary {
  otherUserId: string;
  lastMessage: Message;
  unreadCount: number;
  otherUserName?: string;
}

export const useEnhancedMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (recipientId: string, content: string, subject?: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          subject: subject || undefined
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state for immediate UI update
      setMessages(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, is_read: true } : msg)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
    }
  };

  const markConversationAsRead = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      setMessages(prev =>
        prev.map(msg => 
          msg.sender_id === otherUserId && msg.recipient_id === user.id && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark conversation as read');
    }
  };

  const getMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (otherUserId: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversation');
      return [];
    }
  };

  // Generate conversation summaries
  useEffect(() => {
    if (!user || !messages.length) {
      setConversations([]);
      return;
    }

    const conversationMap = new Map<string, ConversationSummary>();
    
    messages.forEach(message => {
      const otherUserId = message.sender_id === user.id 
        ? message.recipient_id 
        : message.sender_id;
      
      const existing = conversationMap.get(otherUserId);
      const isUnread = message.recipient_id === user.id && !message.is_read;
      
      if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: message,
          unreadCount: existing ? (isUnread ? existing.unreadCount + 1 : existing.unreadCount) : (isUnread ? 1 : 0)
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    });
    
    const conversationList = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
    
    setConversations(conversationList);
  }, [messages, user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up enhanced message subscription for user:', user.id);

    const channel = supabase
      .channel('enhanced-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [newMessage, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as Message;
          setMessages(prev =>
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up enhanced message subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      getMessages();
    }
  }, [user]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    getMessages,
    getConversation
  };
};
