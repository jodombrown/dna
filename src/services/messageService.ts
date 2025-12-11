import { supabase } from '@/integrations/supabase/client';

/**
 * Attachment data for messages
 */
export interface MessageAttachmentData {
  type: 'image' | 'file';
  url: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
}

/**
 * Link preview data for messages
 */
export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

/**
 * Message payload structure
 */
export interface MessagePayload {
  attachment?: MessageAttachmentData;
  linkPreview?: LinkPreviewData;
}

/**
 * Message type for the simpler conversations/messages tables
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  payload?: MessagePayload;
}

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
  is_read?: boolean;
  payload?: MessagePayload;
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
 * messageService - SIMPLIFIED messaging using conversations/messages tables
 * 
 * Uses the SIMPLER tables with user_a/user_b structure which have working RLS
 */
export const messageService = {
  /**
   * Get or create a conversation between the current user and another user
   * Uses direct Supabase client calls - NO RPCs
   */
  async getOrCreateConversation(
    otherUserId: string,
    _originType?: string,
    _originId?: string,
    _originMetadata?: Record<string, unknown>
  ): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('[messageService] Getting or creating conversation with:', otherUserId);

    // First, check if conversation already exists (current user could be user_a OR user_b)
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`)
      .maybeSingle();

    if (findError) {
      console.error('[messageService] Error finding conversation:', findError);
      throw findError;
    }

    if (existingConversation) {
      console.log('[messageService] Found existing conversation:', existingConversation.id);
      return { id: existingConversation.id };
    }

    // Create new conversation - current user is user_a, other user is user_b
    console.log('[messageService] Creating new conversation');
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_a: user.id,
        user_b: otherUserId,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('[messageService] Error creating conversation:', createError);
      throw createError;
    }

    console.log('[messageService] Created new conversation:', newConversation.id);
    return { id: newConversation.id };
  },

  /**
   * Get conversation details by ID
   */
  async getConversationDetails(conversationId: string): Promise<ConversationListItem | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get conversation with both users
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('id, user_a, user_b, last_message_at')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      console.error('[messageService] Error getting conversation:', error);
      return null;
    }

    // Determine other user
    const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

    // Get other user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    // Get last message
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('read', false)
      .neq('sender_id', user.id);

    return {
      conversation_id: conversation.id,
      other_user_id: otherUserId,
      other_user_username: profile?.username || '',
      other_user_full_name: profile?.full_name || 'Unknown User',
      other_user_avatar_url: profile?.avatar_url || '',
      last_message_content: lastMessage?.content || null,
      last_message_at: conversation.last_message_at,
      unread_count: unreadCount || 0,
    };
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(
    limit: number = 50,
    _offset: number = 0
  ): Promise<ConversationListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all conversations where user is participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, user_a, user_b, last_message_at')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('[messageService] Error getting conversations:', error);
      throw error;
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Get other user IDs
    const otherUserIds = conversations.map(c => 
      c.user_a === user.id ? c.user_b : c.user_a
    );

    // Get all profiles in one query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', otherUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Build conversation list
    const result: ConversationListItem[] = [];
    for (const conv of conversations) {
      const otherUserId = conv.user_a === user.id ? conv.user_b : conv.user_a;
      const profile = profileMap.get(otherUserId);

      // Get last message for this conversation
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('read', false)
        .neq('sender_id', user.id);

      result.push({
        conversation_id: conv.id,
        other_user_id: otherUserId,
        other_user_username: profile?.username || '',
        other_user_full_name: profile?.full_name || 'Unknown User',
        other_user_avatar_url: profile?.avatar_url || '',
        last_message_content: lastMessage?.content || null,
        last_message_at: conv.last_message_at,
        unread_count: unreadCount || 0,
      });
    }

    return result;
  },

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 100,
    _beforeTimestamp?: string
  ): Promise<MessageWithSender[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get messages - cast to bypass type checking for payload column
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, read, created_at, payload')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit) as unknown as { 
        data: Array<{
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
          payload: MessagePayload | null;
        }> | null;
        error: Error | null;
      };

    if (error) {
      console.error('[messageService] Error getting messages:', error);
      throw error;
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    // Get sender profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return messages.map(m => ({
      message_id: m.id,
      content: m.content,
      created_at: m.created_at,
      is_deleted: false,
      sender_id: m.sender_id,
      sender_username: profileMap.get(m.sender_id)?.username || '',
      sender_full_name: profileMap.get(m.sender_id)?.full_name || 'Unknown',
      sender_avatar_url: profileMap.get(m.sender_id)?.avatar_url || '',
      is_read: m.read,
      payload: m.payload || undefined,
    }));
  },

  /**
   * Send a message in a conversation with optional attachment
   */
  async sendMessage(
    conversationId: string,
    content: string,
    attachment?: MessageAttachmentData
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!content && !attachment) {
      throw new Error('Message must have content or attachment');
    }

    console.log('[messageService] Sending message to conversation:', conversationId);

    // Build payload if there's an attachment
    const payload: MessagePayload | null = attachment ? { attachment } : null;

    // Cast insert to bypass type checking for payload column
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content?.trim() || '',
        read: false,
        payload: payload,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('[messageService] Error sending message:', error);
      throw error;
    }

    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('[messageService] Message sent successfully');
    return data as Message;
  },

  /**
   * Mark a conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Mark all messages in this conversation as read (except own messages)
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);
  },

  /**
   * Get total count of unread messages across all conversations
   */
  async getTotalUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get all user's conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (!conversations || conversations.length === 0) return 0;

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages in these conversations (not sent by user)
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('read', false)
      .neq('sender_id', user.id);

    return count || 0;
  },

  /**
   * Delete a message (mark as deleted)
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // For the simple messages table, we just delete the message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
  },

  /**
   * Check if current user can message another user
   */
  async canMessage(otherUserId: string): Promise<{
    can_message: boolean;
    reason?: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { can_message: false, reason: 'Not authenticated' };
    }

    if (user.id === otherUserId) {
      return { can_message: false, reason: 'Cannot message yourself' };
    }

    // Check if blocked
    const { data: blocked } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
      .maybeSingle();

    if (blocked) {
      return { can_message: false, reason: 'User is blocked' };
    }

    return { can_message: true };
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
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          onNewMessage({
            message_id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            is_deleted: false,
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
   * Search messages - placeholder
   */
  async searchMessages(
    _query: string,
    _conversationId?: string,
    _limit: number = 50,
    _offset: number = 0
  ): Promise<MessageSearchResult[]> {
    return [];
  },

  /**
   * Report a message - placeholder
   */
  async reportMessage(
    _messageId: string,
    _reason: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other',
    _description?: string
  ): Promise<string> {
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
