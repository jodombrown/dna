
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  subject?: string;
}

export const useMessages = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user || !conversationId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
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

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user || !conversationId) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

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
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, user]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    fetchMessages
  };
};
