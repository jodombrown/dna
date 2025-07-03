
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface EnhancedMessage {
  id: string;
  conversation_id?: string;
  group_conversation_id?: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachments: FileAttachment[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
  read_receipts?: ReadReceipt[];
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface ReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useEnhancedMessages = (conversationId?: string, groupConversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
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

      // Fetch read receipts for messages
      if (data && data.length > 0) {
        const messageIds = data.map(msg => msg.id);
        const { data: receipts } = await supabase
          .from('message_read_receipts')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .in('message_id', messageIds);

        // Group receipts by message
        const receiptsByMessage = receipts?.reduce((acc, receipt) => {
          if (!acc[receipt.message_id]) {
            acc[receipt.message_id] = [];
          }
          acc[receipt.message_id].push(receipt);
          return acc;
        }, {} as Record<string, any[]>) || {};

        const enhancedMessages = data.map(msg => ({
          ...msg,
          attachments: msg.attachments || [],
          read_receipts: receiptsByMessage[msg.id] || []
        }));

        setMessages(enhancedMessages);
      } else {
        setMessages([]);
      }

      setError(null);
      await markAllAsRead();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    content: string, 
    attachments: FileAttachment[] = [],
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<boolean> => {
    if (!user || (!conversationId && !groupConversationId)) return false;

    try {
      const messageData: any = {
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
        attachments: attachments
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

      await fetchMessages();
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
      // Check if read receipt already exists
      const { data: existing } = await supabase
        .from('message_read_receipts')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        await supabase
          .from('message_read_receipts')
          .insert({
            message_id: messageId,
            user_id: user.id
          });
      }
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || (!conversationId && !groupConversationId)) return;

    try {
      // Get all unread messages in this conversation
      let query = supabase
        .from('messages')
        .select('id')
        .neq('sender_id', user.id);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      } else if (groupConversationId) {
        query = query.eq('group_conversation_id', groupConversationId);
      }

      const { data: messages } = await query;

      if (messages && messages.length > 0) {
        const messageIds = messages.map(msg => msg.id);
        
        // Get existing read receipts
        const { data: existingReceipts } = await supabase
          .from('message_read_receipts')
          .select('message_id')
          .in('message_id', messageIds)
          .eq('user_id', user.id);

        const existingMessageIds = existingReceipts?.map(r => r.message_id) || [];
        const newReceiptsToCreate = messageIds
          .filter(id => !existingMessageIds.includes(id))
          .map(messageId => ({
            message_id: messageId,
            user_id: user.id
          }));

        if (newReceiptsToCreate.length > 0) {
          await supabase
            .from('message_read_receipts')
            .insert(newReceiptsToCreate);
        }
      }
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
