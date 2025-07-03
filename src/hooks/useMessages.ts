
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id?: string;
  group_conversation_id?: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachments: any[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
  subject?: string;
}

export const useMessages = (conversationId?: string, groupConversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user || (!conversationId && !groupConversationId)) return;

    try {
      setLoading(true);

      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      } else if (groupConversationId) {
        query = query.eq('group_conversation_id', groupConversationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type as 'text' | 'image' | 'file' | 'system') || 'text',
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      }));

      setMessages(typedMessages);
      setError(null);

      // Mark messages as read
      await markAllAsRead();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, attachments: any[] = []): Promise<boolean> => {
    if (!user || (!conversationId && !groupConversationId)) return false;

    try {
      const messageData: any = {
        sender_id: user.id,
        content: content.trim(),
        attachments: attachments || []
      };

      if (conversationId) {
        messageData.conversation_id = conversationId;
      } else if (groupConversationId) {
        messageData.group_conversation_id = groupConversationId;
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      await fetchMessages(); // Refresh messages
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .neq('sender_id', user.id); // Don't mark own messages as read

      if (error) throw error;
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || (!conversationId && !groupConversationId)) return;

    try {
      let query = supabase
        .from('messages')
        .update({ is_read: true })
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      } else if (groupConversationId) {
        query = query.eq('group_conversation_id', groupConversationId);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, groupConversationId, user]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    fetchMessages
  };
};
