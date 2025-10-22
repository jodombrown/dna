import { supabase } from '@/integrations/supabase/client';
import { ConversationListItem, MessageWithSender } from '@/types/messaging';

export const messagingService = {
  // Get or create a conversation between two users using the new RPC
  async getOrCreateConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: user.id,
      user2_id: otherUserId,
    });

    if (error) throw error;
    return { id: data };
  },

  // Get all conversations for current user using the new RPC
  async getConversations(): Promise<ConversationListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: user.id,
      p_limit: 50,
      p_offset: 0,
    });

    if (error) throw error;
    return data || [];
  },

  // Get messages for a conversation using the new RPC
  async getMessages(conversationId: string): Promise<MessageWithSender[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_conversation_messages', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_limit: 100,
    });

    if (error) throw error;
    
    // Reverse to show oldest first
    return (data || []).reverse();
  },

  // Send a message to the new messages_new table
  async sendMessage(conversationId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages_new')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark conversation as read using the new RPC
  async markAsRead(conversationId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
    });

    if (error) throw error;
  },

  // Get total unread count using the new RPC
  async getTotalUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase.rpc('get_total_unread_count', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return data || 0;
  },

  // Subscribe to new messages in a conversation (updated for messages_new table)
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },
};
