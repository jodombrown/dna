import { supabase } from '@/integrations/supabase/client';
import {
  ConversationListItem,
  MessageWithSender,
  Message,
  MessageRequest,
  UserPresence,
  CanMessageResult,
  ParticipantStatus,
  ConversationOriginType,
  OriginMetadata,
  MessageContentType,
  MessageMetadata,
} from '@/types/messaging';

/**
 * messageService - Centralized messaging service for the DNA Platform
 *
 * Implements the DNA Messaging System PRD requirements:
 * - Conversation management with origin context
 * - Message operations with content types
 * - Message request system (accept/decline)
 * - User restrictions (block/mute)
 * - Read receipts and delivery status
 * - Global user presence
 * - Real-time subscriptions
 */
export const messageService = {
  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  /**
   * Get or create a conversation between the current user and another user
   * with optional origin context (where the conversation started)
   *
   * @param otherUserId - ID of the user to start conversation with
   * @param originType - Where conversation started: 'event', 'project', 'profile', 'post'
   * @param originId - ID of the origin entity
   * @param originMetadata - Additional context (title, date, etc.)
   * @returns Object with conversation ID
   */
  async getOrCreateConversation(
    otherUserId: string,
    originType?: ConversationOriginType,
    originId?: string,
    originMetadata?: OriginMetadata
  ): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_or_create_conversation_contextual', {
      p_user1_id: user.id,
      p_user2_id: otherUserId,
      p_origin_type: originType || null,
      p_origin_id: originId || null,
      p_origin_metadata: originMetadata || {},
    });

    if (error) {
      if (error.message?.includes('Cannot message')) {
        throw new Error('Cannot message this user');
      }
      throw error;
    }

    return { id: data };
  },

  /**
   * Get all conversations for the current user
   *
   * @param limit - Maximum number of conversations (default: 50)
   * @param offset - Offset for pagination (default: 0)
   * @param status - Filter by participant status: 'active', 'pending', 'declined'
   * @param includeMuted - Include muted conversations (default: true)
   * @returns Array of conversation list items
   */
  async getConversations(
    limit: number = 50,
    offset: number = 0,
    status: ParticipantStatus = 'active',
    includeMuted: boolean = true
  ): Promise<ConversationListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_status: status,
      p_include_muted: includeMuted,
    });

    if (error) throw error;
    return (data || []) as ConversationListItem[];
  },

  /**
   * Get messages for a specific conversation
   *
   * @param conversationId - ID of the conversation
   * @param limit - Maximum number of messages (default: 100)
   * @param beforeTimestamp - Load messages before this timestamp (for pagination)
   * @returns Array of messages with sender details, oldest first
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
   *
   * @param conversationId - ID of the conversation
   * @param content - Message content (text)
   * @param contentType - Type of content (default: 'text')
   * @param metadata - Additional metadata for non-text content
   * @returns The created message object
   */
  async sendMessage(
    conversationId: string,
    content: string,
    contentType: MessageContentType = 'text',
    metadata?: MessageMetadata
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (contentType === 'text' && (!content || content.trim().length === 0)) {
      throw new Error('Message content cannot be empty');
    }

    const { data, error } = await supabase
      .from('messages_new')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content?.trim() || null,
        content_type: contentType,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  },

  /**
   * Mark a conversation as read
   * Updates last_read_at, resets unread count, and creates read receipts
   *
   * @param conversationId - ID of the conversation to mark as read
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
   *
   * @returns Number of unread messages
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
   *
   * @param messageId - ID of the message to delete
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

  // =====================================================
  // MESSAGE REQUESTS
  // =====================================================

  /**
   * Get pending message requests for the current user
   *
   * @param limit - Maximum number of requests (default: 50)
   * @param offset - Offset for pagination (default: 0)
   * @returns Array of message requests
   */
  async getMessageRequests(
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_message_requests', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    return (data || []) as MessageRequest[];
  },

  /**
   * Accept a message request
   * Changes participant status from 'pending' to 'active'
   *
   * @param conversationId - ID of the conversation
   * @returns true if successful
   */
  async acceptMessageRequest(conversationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('respond_to_message_request', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_accept: true,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Decline a message request
   * Changes participant status from 'pending' to 'declined'
   *
   * @param conversationId - ID of the conversation
   * @returns true if successful
   */
  async declineMessageRequest(conversationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('respond_to_message_request', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_accept: false,
    });

    if (error) throw error;
    return data;
  },

  // =====================================================
  // USER RESTRICTIONS (BLOCK/MUTE)
  // =====================================================

  /**
   * Block a user - prevents messaging in either direction
   *
   * @param targetUserId - ID of the user to block
   */
  async blockUser(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('block_user', {
      p_user_id: user.id,
      p_target_user_id: targetUserId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Unblock a user
   *
   * @param targetUserId - ID of the user to unblock
   */
  async unblockUser(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('unblock_user', {
      p_user_id: user.id,
      p_target_user_id: targetUserId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get list of blocked users
   *
   * @returns Array of blocked user IDs
   */
  async getBlockedUsers(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_restrictions')
      .select('target_user_id')
      .eq('user_id', user.id)
      .eq('restriction_type', 'block');

    if (error) throw error;
    return (data || []).map((r) => r.target_user_id);
  },

  // =====================================================
  // CONVERSATION ACTIONS (MUTE/PIN)
  // =====================================================

  /**
   * Toggle mute status for a conversation
   *
   * @param conversationId - ID of the conversation
   * @param mute - true to mute, false to unmute
   */
  async toggleConversationMute(
    conversationId: string,
    mute: boolean
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('toggle_conversation_mute', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_mute: mute,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Toggle pin status for a conversation
   *
   * @param conversationId - ID of the conversation
   * @param pin - true to pin, false to unpin
   */
  async toggleConversationPin(
    conversationId: string,
    pin: boolean
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('toggle_conversation_pin', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_pin: pin,
    });

    if (error) throw error;
    return data;
  },

  // =====================================================
  // PRESENCE MANAGEMENT
  // =====================================================

  /**
   * Update current user's presence status
   *
   * @param status - 'online', 'away', or 'offline'
   */
  async updatePresence(status: 'online' | 'away' | 'offline' = 'online'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('update_user_presence', {
      p_user_id: user.id,
      p_status: status,
    });

    if (error) {
      console.error('Error updating presence:', error);
      return false;
    }

    return data;
  },

  /**
   * Get presence status for multiple users
   *
   * @param userIds - Array of user IDs
   * @returns Array of presence records
   */
  async getUsersPresence(userIds: string[]): Promise<UserPresence[]> {
    if (userIds.length === 0) return [];

    const { data, error } = await supabase.rpc('get_users_presence', {
      p_user_ids: userIds,
    });

    if (error) {
      console.error('Error fetching presence:', error);
      return [];
    }

    return (data || []) as UserPresence[];
  },

  // =====================================================
  // PERMISSION CHECKS
  // =====================================================

  /**
   * Check if current user can message another user
   *
   * @param otherUserId - ID of the user to check
   * @returns CanMessageResult with details
   */
  async canMessage(otherUserId: string): Promise<CanMessageResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        can_message: false,
        is_connected: false,
        is_blocked: false,
        reason: 'Not authenticated',
      };
    }

    const { data, error } = await supabase.rpc('can_message_user', {
      p_user_id: user.id,
      p_target_user_id: otherUserId,
    });

    if (error) {
      console.error('Error checking message permission:', error);
      return {
        can_message: false,
        is_connected: false,
        is_blocked: false,
        reason: 'Error checking permissions',
      };
    }

    return (data?.[0] || {
      can_message: false,
      is_connected: false,
      is_blocked: false,
      reason: 'Unknown error',
    }) as CanMessageResult;
  },

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to real-time message updates in a conversation
   *
   * @param conversationId - ID of the conversation
   * @param callback - Function called when new message arrives
   * @returns Supabase channel (call .unsubscribe() to cleanup)
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
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
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },

  /**
   * Broadcast typing status to conversation participants
   *
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user typing
   * @param displayName - Display name of the user
   * @param isTyping - Whether user is currently typing
   * @returns Supabase channel
   */
  broadcastTyping(
    conversationId: string,
    userId: string,
    displayName: string,
    isTyping: boolean
  ) {
    const channel = supabase.channel(`typing:${conversationId}`);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, displayName, isTyping },
        });
      }
    });

    return channel;
  },

  /**
   * Subscribe to typing indicators in a conversation
   *
   * @param conversationId - ID of the conversation
   * @param onTypingChange - Callback with current typing users
   * @returns Supabase channel
   */
  subscribeToTyping(
    conversationId: string,
    onTypingChange: (users: Array<{ user_id: string; display_name: string }>) => void
  ) {
    const typingUsers = new Map<string, { user_id: string; display_name: string; timeout?: NodeJS.Timeout }>();

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, displayName, isTyping } = payload;

        if (isTyping) {
          const existing = typingUsers.get(userId);
          if (existing?.timeout) {
            clearTimeout(existing.timeout);
          }

          const timeout = setTimeout(() => {
            typingUsers.delete(userId);
            onTypingChange(Array.from(typingUsers.values()));
          }, 3000);

          typingUsers.set(userId, { user_id: userId, display_name: displayName, timeout });
        } else {
          const existing = typingUsers.get(userId);
          if (existing?.timeout) {
            clearTimeout(existing.timeout);
          }
          typingUsers.delete(userId);
        }

        onTypingChange(Array.from(typingUsers.values()));
      })
      .subscribe();

    return channel;
  },

  /**
   * Track user presence in a conversation
   *
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user
   * @param userData - Additional user data (name, avatar)
   * @returns Supabase channel
   */
  trackPresence(
    conversationId: string,
    userId: string,
    userData: { display_name: string; avatar_url?: string }
  ) {
    const channel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: userId } },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...userData,
        });
      }
    });

    return channel;
  },

  /**
   * Subscribe to presence updates in a conversation
   *
   * @param conversationId - ID of the conversation
   * @param onPresenceChange - Callback with online users
   * @returns Supabase channel
   */
  subscribeToPresence(
    conversationId: string,
    onPresenceChange: (presences: Array<{ user_id: string; online_at: string }>) => void
  ) {
    const channel = supabase.channel(`presence:${conversationId}`);

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const presences = Object.values(state).flat().map((p: any) => ({
        user_id: p.user_id,
        online_at: p.online_at,
      }));
      onPresenceChange(presences);
    });

    channel.subscribe();
    return channel;
  },

  /**
   * Subscribe to conversation list updates
   *
   * @param userId - Current user ID
   * @param callback - Function called when conversation list should refresh
   * @returns Supabase channel
   */
  subscribeToConversations(userId: string, callback: () => void) {
    return supabase
      .channel('user_conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to global presence updates
   * Tracks online/offline status for the inbox user list
   *
   * @param onPresenceChange - Callback with presence updates
   * @returns Supabase channel
   */
  subscribeToGlobalPresence(
    onPresenceChange: (presences: UserPresence[]) => void
  ) {
    const channel = supabase.channel('global_presence');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          // Re-fetch presence data when changes occur
          // The component should call getUsersPresence with relevant user IDs
          onPresenceChange([]);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Subscribe to message requests updates
   *
   * @param userId - Current user ID
   * @param callback - Function called when new request arrives
   * @returns Supabase channel
   */
  subscribeToMessageRequests(userId: string, callback: () => void) {
    return supabase
      .channel('message_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Only trigger for pending status
          if ((payload.new as any)?.status === 'pending') {
            callback();
          }
        }
      )
      .subscribe();
  },
};
