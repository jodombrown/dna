import { supabase } from '@/integrations/supabase/client';
import { sendNotificationEmail, NOTIFICATION_TYPES } from './notificationService';
import { getConversationUrl } from '@/lib/config';
import type { Database, Json } from '@/integrations/supabase/types';

/**
 * Type for messages table insert, extending with the payload field
 */
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Extended message update type for soft delete functionality
 * Note: deleted_at column exists in the database but may not be in generated types
 */
interface MessageSoftDelete {
  deleted_at: string;
}
/**
 * Attachment data for messages
 */
export interface MessageAttachmentData {
  type: 'image' | 'file' | 'voice';
  url: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  duration?: number; // For voice messages, duration in seconds
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
  is_muted: boolean;
  is_pinned: boolean;
  is_archived: boolean;
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

    // First, check if conversation already exists (current user could be user_a OR user_b)
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existingConversation) {
      return { id: existingConversation.id };
    }

    // Create new conversation - current user is user_a, other user is user_b
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_a: user.id,
        user_b: otherUserId,
      })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return { id: newConversation.id };
  },

  /**
   * Get conversation details by ID
   */
async getConversationDetails(conversationId: string): Promise<ConversationListItem | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get conversation with both users and all state fields
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('id, user_a, user_b, last_message_at, is_archived_by_a, is_archived_by_b, is_muted_by_a, is_muted_by_b, is_pinned_by_a, is_pinned_by_b, deleted_by_a, deleted_by_b')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return null;
    }

    // Determine other user and current user's state
    const isUserA = conversation.user_a === user.id;
    const otherUserId = isUserA ? conversation.user_b : conversation.user_a;

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

    // Get unread count using conversation_participants.last_read_at
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    let unreadCount = 0;
    if (participant) {
      let query = supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);
      
      if (participant.last_read_at) {
        query = query.gt('created_at', participant.last_read_at);
      }
      
      const { count } = await query;
      unreadCount = count || 0;
    }

    return {
      conversation_id: conversation.id,
      other_user_id: otherUserId,
      other_user_username: profile?.username || '',
      other_user_full_name: profile?.full_name || 'Unknown User',
      other_user_avatar_url: profile?.avatar_url || '',
      last_message_content: lastMessage?.content || null,
      last_message_at: conversation.last_message_at,
      unread_count: unreadCount || 0,
      is_muted: isUserA ? (conversation.is_muted_by_a ?? false) : (conversation.is_muted_by_b ?? false),
      is_pinned: isUserA ? (conversation.is_pinned_by_a ?? false) : (conversation.is_pinned_by_b ?? false),
      is_archived: isUserA ? (conversation.is_archived_by_a ?? false) : (conversation.is_archived_by_b ?? false),
    };
  },

  /**
   * Get all conversations for the current user
   */
async getConversations(
    limit: number = 50,
    _offset: number = 0,
    includeArchived: boolean = false
  ): Promise<ConversationListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all conversations where user is participant with all state fields
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, user_a, user_b, last_message_at, is_archived_by_a, is_archived_by_b, is_muted_by_a, is_muted_by_b, is_pinned_by_a, is_pinned_by_b, deleted_by_a, deleted_by_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Filter out deleted conversations and optionally archived ones
    const filteredConversations = conversations.filter(conv => {
      const isUserA = conv.user_a === user.id;
      const isDeleted = isUserA ? conv.deleted_by_a : conv.deleted_by_b;
      const isArchived = isUserA ? conv.is_archived_by_a : conv.is_archived_by_b;
      
      if (isDeleted) return false;
      if (!includeArchived && isArchived) return false;
      return true;
    });

    // Get other user IDs
    const otherUserIds = filteredConversations.map(c => 
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
    for (const conv of filteredConversations) {
      const isUserA = conv.user_a === user.id;
      const otherUserId = isUserA ? conv.user_b : conv.user_a;
      const profile = profileMap.get(otherUserId);

      // Get last message for this conversation
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count using conversation_participants.last_read_at
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', conv.id)
        .eq('user_id', user.id)
        .maybeSingle();

      let unreadCount = 0;
      if (participant) {
        let query = supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id);
        
        if (participant.last_read_at) {
          query = query.gt('created_at', participant.last_read_at);
        }
        
        const { count } = await query;
        unreadCount = count || 0;
      }

      result.push({
        conversation_id: conv.id,
        other_user_id: otherUserId,
        other_user_username: profile?.username || '',
        other_user_full_name: profile?.full_name || 'Unknown User',
        other_user_avatar_url: profile?.avatar_url || '',
        last_message_content: lastMessage?.content || null,
        last_message_at: conv.last_message_at,
        unread_count: unreadCount || 0,
        is_muted: isUserA ? (conv.is_muted_by_a ?? false) : (conv.is_muted_by_b ?? false),
        is_pinned: isUserA ? (conv.is_pinned_by_a ?? false) : (conv.is_pinned_by_b ?? false),
        is_archived: isUserA ? (conv.is_archived_by_a ?? false) : (conv.is_archived_by_b ?? false),
      });
    }

    // Sort: pinned first, then by last_message_at
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

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

    // Get messages - query only columns that definitely exist
    // Note: deleted_at may not exist if migration hasn't been applied yet
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, read, created_at, payload')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
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

    // Cast payload to proper type - it's stored as JSONB
    return messages.map(m => ({
      message_id: m.id,
      content: m.content,
      created_at: m.created_at,
      is_deleted: false, // Default to false - soft delete handled separately if column exists
      sender_id: m.sender_id,
      sender_username: profileMap.get(m.sender_id)?.username || '',
      sender_full_name: profileMap.get(m.sender_id)?.full_name || 'Unknown',
      sender_avatar_url: profileMap.get(m.sender_id)?.avatar_url || '',
      is_read: m.read,
      payload: (m.payload as MessagePayload) || undefined,
    }));
  },

  /**
   * Send a message in a conversation with optional attachment
   */
  async sendMessage(
    conversationId: string,
    content: string,
    attachment?: MessageAttachmentData,
    linkPreview?: LinkPreviewData
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!content && !attachment && !linkPreview) {
      throw new Error('Message must have content, attachment, or link preview');
    }

    // Build payload if there's an attachment or link preview
    const payload: MessagePayload | null = (attachment || linkPreview) ? { 
      attachment, 
      linkPreview 
    } : null;

    // Insert message with properly typed payload
    const insertData: MessageInsert = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: content?.trim() || '',
      read: false,
      payload: payload as Json | null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send email notification to recipient (async, don't block)
    try {
      // Get conversation to find recipient
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_a, user_b')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const recipientId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
        
        // Get sender profile
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        // Send email notification (async)
        sendNotificationEmail({
          user_id: recipientId,
          notification_type: NOTIFICATION_TYPES.MESSAGE,
          title: 'New Message',
          message: content?.trim() ? `${senderProfile?.full_name || 'Someone'}: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"` : `${senderProfile?.full_name || 'Someone'} sent you a message.`,
          action_url: getConversationUrl(conversationId),
          actor_name: senderProfile?.full_name,
          actor_avatar_url: senderProfile?.avatar_url,
        }).catch(() => {});
      }
    } catch {
      // Ignore email notification errors
    }

    return data as Message;
  },

  /**
   * Mark a conversation as read by updating last_read_at in conversation_participants
   */
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Update last_read_at in conversation_participants
    const { error } = await supabase
      .from('conversation_participants')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: 'conversation_id,user_id'
      });

    if (error) {
      throw error;
    }
  },

  /**
   * Get total count of unread messages across all conversations
   */
  async getTotalUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get all user's conversation participations with last_read_at
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) return 0;

    let totalUnread = 0;
    
    for (const p of participations) {
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id)
        .neq('sender_id', user.id);
      
      if (p.last_read_at) {
        query = query.gt('created_at', p.last_read_at);
      }
      
      const { count } = await query;
      totalUnread += count || 0;
    }

    return totalUnread;
  },

  /**
   * Delete a message (soft delete - marks as deleted)
   * Message will show "This message was deleted" placeholder
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Soft delete by updating deleted_at timestamp
    // Note: deleted_at column exists in database but may not be in generated types
    const softDeleteData: MessageSoftDelete = { deleted_at: new Date().toISOString() };
    const { error } = await supabase
      .from('messages')
      .update(softDeleteData as Database['public']['Tables']['messages']['Update'])
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
    messageId: string,
    reason: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other',
    description?: string
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Map UI reason values to database flag_type enum
    const flagTypeMap: Record<string, string> = {
      'spam': 'spam',
      'harassment': 'harassment',
      'inappropriate': 'inappropriate_content',
      'scam': 'spam', // Scam maps to spam
      'other': 'other',
    };

    const flagType = flagTypeMap[reason] || 'other';

    const { data, error } = await supabase
      .from('content_flags')
      .insert({
        content_type: 'message',
        content_id: messageId,
        flagged_by: user.id,
        flag_type: flagType,
        reason: description || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      throw new Error('Failed to report message');
    }

    return data.id;
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
      throw new Error(`Failed to upload voice message: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('messages')
      .getPublicUrl(filePath);

    // Send message with voice attachment
    return await this.sendMessage(conversationId, '🎤 Voice message', {
      type: 'voice',
      url: urlData.publicUrl,
      filename: fileName,
      mimetype: 'audio/webm',
      filesize: audioBlob.size,
      duration: duration,
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

/**
 * Conversation management functions
 */

/**
 * Delete a conversation (soft delete - hides for current user only)
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get conversation to determine which user column to update
  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'deleted_by_a' : 'deleted_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: true })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Archive/unarchive a conversation
 */
export async function archiveConversation(conversationId: string, archive: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_archived_by_a' : 'is_archived_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: archive })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Pin/unpin a conversation
 */
export async function pinConversation(conversationId: string, pin: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_pinned_by_a' : 'is_pinned_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: pin })
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Mute/unmute a conversation
 */
export async function muteConversation(conversationId: string, mute: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('user_a, user_b')
    .eq('id', conversationId)
    .single();

  if (fetchError || !conv) throw new Error('Conversation not found');

  const isUserA = conv.user_a === user.id;
  const updateField = isUserA ? 'is_muted_by_a' : 'is_muted_by_b';

  const { error } = await supabase
    .from('conversations')
    .update({ [updateField]: mute })
    .eq('id', conversationId);

  if (error) throw error;
}

// Also export types for backward compatibility
export type {
  MessageWithSender as MessageWithSenderType,
  ConversationListItem as ConversationListItemType,
  Message as MessageType,
  MessageSearchResult as MessageSearchResultType,
  MessageReaction as MessageReactionType,
};
