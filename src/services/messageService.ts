import { supabase } from '@/integrations/supabase/client';

/**
 * MessageWithSender - Type for messages with sender information
 */
export interface MessageWithSender {
  message_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar_url: string;
}

/**
 * ConversationListItem - Type for conversation list display
 */
export interface ConversationListItem {
  conversation_id: string;
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_avatar_url: string;
  last_message_content: string | null;
  last_message_at: string | null;
  unread_count: number;
}

/**
 * Message - Basic message type
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

/**
 * messageService - Centralized messaging service for the DNA Platform
 *
 * Uses existing database functions:
 * - get_user_conversations
 * - get_conversation_messages
 * - mark_conversation_read
 * - get_total_unread_count
 */
export const messageService = {
  /**
   * Get or create a conversation between the current user and another user
   * Uses the existing conversations table directly
   */
  async getOrCreateConversation(
    otherUserId: string,
    _originType?: string,
    _originId?: string,
    _originMetadata?: Record<string, unknown>
  ): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Use the SECURITY DEFINER function to create/find conversation
    // This bypasses RLS to allow adding the other user as participant
    const { data: conversationId, error } = await supabase.rpc(
      'create_conversation_with_participant',
      { p_other_user_id: otherUserId }
    );

    if (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }

    return { id: conversationId };
  },

  /**
   * Get conversation details by ID (for direct lookup when not in cache)
   */
  async getConversationDetails(conversationId: string): Promise<ConversationListItem | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_conversation_details', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Failed to get conversation details:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
      conversation_id: row.conversation_id,
      other_user_id: row.other_user_id,
      other_user_username: row.other_user_username,
      other_user_full_name: row.other_user_full_name,
      other_user_avatar_url: row.other_user_avatar_url,
      last_message_content: row.last_message_content,
      last_message_at: row.last_message_at,
      unread_count: 0,
    } as ConversationListItem;
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    return (data || []) as ConversationListItem[];
  },

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 100,
    beforeTimestamp?: string
  ): Promise<MessageWithSender[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_conversation_messages', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_limit: limit,
      p_before_timestamp: beforeTimestamp || null,
    });

    if (error) {
      if (error.message?.includes('not a participant')) {
        throw new Error('You are not a participant in this conversation');
      }
      throw error;
    }

    // Reverse to show oldest first (chronological order)
    return ((data || []) as MessageWithSender[]).reverse();
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    const { data, error } = await supabase
      .from('messages_new')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last_message_at
    await supabase
      .from('conversations_new')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as Message;
  },

  /**
   * Mark a conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
    });

    if (error) throw error;
  },

  /**
   * Get total count of unread messages across all conversations
   */
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

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('messages_new')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
  },

  /**
   * Check if current user can message another user
   * Uses the can_message_user RPC which properly checks:
   * - Block status (both directions)
   * - Connection status
   */
  async canMessage(otherUserId: string): Promise<{
    can_message: boolean;
    is_connected?: boolean;
    is_blocked?: boolean;
    reason?: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { can_message: false, reason: 'Not authenticated' };
    }

    if (user.id === otherUserId) {
      return { can_message: false, reason: 'Cannot message yourself' };
    }

    // Use the proper RPC that handles block checks
    const { data, error } = await supabase.rpc('can_message_user', {
      p_sender_id: user.id,
      p_recipient_id: otherUserId,
    });

    if (error) {
      console.error('Error checking message permission:', error);
      // Default to allowing messaging if check fails
      return { can_message: true };
    }

    // RPC returns a boolean directly
    return { can_message: data === true };
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: MessageWithSender) => void
  ) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Basic message data from realtime
          const newMessage = payload.new as Message;
          // Fetch full message with sender info would be done by the consumer
          onNewMessage({
            message_id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            is_deleted: newMessage.is_deleted,
            sender_id: newMessage.sender_id,
            sender_username: '',
            sender_full_name: '',
            sender_avatar_url: '',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Search messages - simplified (searches client-side for now)
   */
  async searchMessages(
    _query: string,
    _conversationId?: string,
    _limit: number = 50,
    _offset: number = 0
  ): Promise<MessageSearchResult[]> {
    // Search functionality requires RPC setup
    return [];
  },

  /**
   * Report a message - simplified placeholder
   */
  async reportMessage(
    _messageId: string,
    _reason: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other',
    _description?: string
  ): Promise<string> {
    // Report functionality requires RPC setup
    console.log('Report message - feature pending');
    return 'pending';
  },
};

/**
 * MessageSearchResult - Type for search results
 */
export interface MessageSearchResult {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar_url: string;
  content: string;
  content_type: string;
  created_at: string;
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_avatar_url: string;
  rank: number;
}

// Also export types for backward compatibility
export type {
  MessageWithSender as MessageWithSenderType,
  ConversationListItem as ConversationListItemType,
  Message as MessageType,
  MessageSearchResult as MessageSearchResultType,
};
