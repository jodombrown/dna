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
   * Search messages in conversations
   */
  async searchMessages(
    query: string,
    conversationId?: string,
    limit: number = 50
  ): Promise<MessageSearchResult[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!query.trim()) return [];

    // Build the query
    let queryBuilder = supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (conversationId) {
      queryBuilder = queryBuilder.eq('conversation_id', conversationId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get sender profiles
    const senderIds = [...new Set(data.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get conversation details for each message
    const convIds = [...new Set(data.map(m => m.conversation_id))];
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, user_a, user_b')
      .in('id', convIds);

    const convMap = new Map(conversations?.map(c => [c.id, c]) || []);

    // Get other user profiles
    const otherUserIds = new Set<string>();
    conversations?.forEach(c => {
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      otherUserIds.add(otherId);
    });

    const { data: otherProfiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', Array.from(otherUserIds));

    const otherProfileMap = new Map(otherProfiles?.map(p => [p.id, p]) || []);

    return data.map((m, index) => {
      const sender = profileMap.get(m.sender_id);
      const conv = convMap.get(m.conversation_id);
      const otherId = conv ? (conv.user_a === user.id ? conv.user_b : conv.user_a) : '';
      const otherUser = otherProfileMap.get(otherId);

      return {
        message_id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        sender_username: sender?.username || '',
        sender_full_name: sender?.full_name || 'Unknown',
        sender_avatar_url: sender?.avatar_url || '',
        content: m.content,
        content_type: 'text',
        created_at: m.created_at,
        other_user_id: otherId,
        other_user_username: otherUser?.username || '',
        other_user_full_name: otherUser?.full_name || 'Unknown',
        other_user_avatar_url: otherUser?.avatar_url || '',
        rank: limit - index,
      };
    });
  },

  /**
   * Report a message
   */
  async reportMessage(
    _messageId: string,
    _reason: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other',
    _description?: string
  ): Promise<string> {
    console.log('Report message - feature pending');
    return 'pending';
  },

  // =====================================================
  // TIER 3: Reactions, Archive/Mute, Voice Messages
  // =====================================================

  /**
   * Get reactions for a message
   */
  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Use 'reaction' column (actual DB column name)
    const { data, error } = await supabase
      .from('message_reactions')
      .select('id, reaction, user_id, created_at')
      .eq('message_id', messageId);

    if (error) {
      console.error('[messageService] Error getting reactions:', error);
      return [];
    }

    // Group by emoji and count
    const emojiMap = new Map<string, { count: number; hasReacted: boolean; users: string[] }>();
    
    (data || []).forEach((r) => {
      const emoji = r.reaction;
      const existing = emojiMap.get(emoji) || { count: 0, hasReacted: false, users: [] };
      existing.count++;
      if (r.user_id === user.id) existing.hasReacted = true;
      existing.users.push(r.user_id);
      emojiMap.set(emoji, existing);
    });

    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted,
    }));
  },

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        reaction: emoji,
      });

    if (error && !error.message?.includes('duplicate')) {
      console.error('[messageService] Error adding reaction:', error);
      throw error;
    }
  },

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('reaction', emoji);

    if (error) {
      console.error('[messageService] Error removing reaction:', error);
      throw error;
    }
  },

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get conversation to determine if user is user_a or user_b
    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single();

    if (!conv) throw new Error('Conversation not found');

    const isUserA = conv.user_a === user.id;
    const updateField = isUserA ? 'is_archived_by_a' : 'is_archived_by_b';

    const { error } = await supabase
      .from('conversations')
      .update({ [updateField]: true })
      .eq('id', conversationId);

    if (error) throw error;
  },

  /**
   * Unarchive a conversation
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single();

    if (!conv) throw new Error('Conversation not found');

    const isUserA = conv.user_a === user.id;
    const updateField = isUserA ? 'is_archived_by_a' : 'is_archived_by_b';

    const { error } = await supabase
      .from('conversations')
      .update({ [updateField]: false })
      .eq('id', conversationId);

    if (error) throw error;
  },

  /**
   * Mute a conversation
   */
  async muteConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single();

    if (!conv) throw new Error('Conversation not found');

    const isUserA = conv.user_a === user.id;
    const updateField = isUserA ? 'is_muted_by_a' : 'is_muted_by_b';

    const { error } = await supabase
      .from('conversations')
      .update({ [updateField]: true })
      .eq('id', conversationId);

    if (error) throw error;
  },

  /**
   * Unmute a conversation
   */
  async unmuteConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single();

    if (!conv) throw new Error('Conversation not found');

    const isUserA = conv.user_a === user.id;
    const updateField = isUserA ? 'is_muted_by_a' : 'is_muted_by_b';

    const { error } = await supabase
      .from('conversations')
      .update({ [updateField]: false })
      .eq('id', conversationId);

    if (error) throw error;
  },

  /**
   * Get conversation status (archived/muted)
   */
  async getConversationStatus(conversationId: string): Promise<{ isArchived: boolean; isMuted: boolean }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isArchived: false, isMuted: false };

    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b, is_archived_by_a, is_archived_by_b, is_muted_by_a, is_muted_by_b')
      .eq('id', conversationId)
      .single();

    if (!conv) return { isArchived: false, isMuted: false };

    const isUserA = conv.user_a === user.id;
    
    return {
      isArchived: isUserA ? (conv.is_archived_by_a || false) : (conv.is_archived_by_b || false),
      isMuted: isUserA ? (conv.is_muted_by_a || false) : (conv.is_muted_by_b || false),
    };
  },

  /**
   * Send a voice message
   */
  async sendVoiceMessage(
    conversationId: string,
    audioBlob: Blob,
    duration: number
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload audio to storage
    const fileName = `voice-${user.id}-${Date.now()}.webm`;
    const filePath = `voice-messages/${conversationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('messages')
      .upload(filePath, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[messageService] Error uploading voice message:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('messages')
      .getPublicUrl(filePath);

    // Send message with voice attachment
    return this.sendMessage(conversationId, '🎤 Voice message', {
      type: 'file',
      url: urlData.publicUrl,
      filename: fileName,
      mimetype: 'audio/webm',
      filesize: audioBlob.size,
    });
  },
};

/**
 * MessageReaction type
 */
export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

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
  MessageReaction as MessageReactionType,
};
