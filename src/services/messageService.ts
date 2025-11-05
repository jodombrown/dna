import { supabase } from '@/integrations/supabase/client';
import { ConversationListItem, MessageWithSender, Message } from '@/types/messaging';

/**
 * messageService - Centralized messaging service for the DNA Platform
 * 
 * Provides a clean, unified API for all messaging operations including:
 * - Conversation management (create, fetch, list)
 * - Message operations (send, fetch, mark as read)
 * - Real-time subscriptions
 * - Unread count tracking
 * 
 * Key Features:
 * - Connection-gated messaging (enforced at DB level)
 * - Automatic error handling with descriptive messages
 * - Real-time updates via Supabase subscriptions
 * - Type-safe operations
 */
export const messageService = {
  /**
   * Get or create a conversation between the current user and another user
   * 
   * IMPORTANT: Requires an accepted connection between users.
   * Will throw error if users are not connected.
   * 
   * @param otherUserId - ID of the user to start conversation with
   * @returns Object with conversation ID
   * @throws Error if not authenticated or users not connected
   */
  async getOrCreateConversation(otherUserId: string): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: user.id,
      user2_id: otherUserId,
    });

    if (error) {
      // Check if it's a connection requirement error
      if (error.message?.includes('must be connected')) {
        throw new Error('Users must be connected to message each other');
      }
      throw error;
    }

    return { id: data };
  },

  /**
   * Get all conversations for the current user
   * 
   * Returns conversations ordered by last message time with:
   * - Other user profile details
   * - Last message preview
   * - Unread count per conversation
   * 
   * @param limit - Maximum number of conversations to fetch (default: 50)
   * @param offset - Offset for pagination (default: 0)
   * @returns Array of conversation list items
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
    return data || [];
  },

  /**
   * Get messages for a specific conversation
   * 
   * Returns messages with sender profile details.
   * Verifies user is a participant before returning messages.
   * 
   * @param conversationId - ID of the conversation
   * @param limit - Maximum number of messages (default: 100)
   * @returns Array of messages with sender details, oldest first
   */
  async getMessages(
    conversationId: string,
    limit: number = 100
  ): Promise<MessageWithSender[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_conversation_messages', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_limit: limit,
    });

    if (error) {
      if (error.message?.includes('not a participant')) {
        throw new Error('You are not a participant in this conversation');
      }
      throw error;
    }
    
    // Reverse to show oldest first (chronological order)
    return (data || []).reverse();
  },

  /**
   * Send a message in a conversation
   * 
   * @param conversationId - ID of the conversation
   * @param content - Message content (text)
   * @returns The created message object
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
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
    return data;
  },

  /**
   * Mark a conversation as read
   * 
   * Updates the last_read_at timestamp for the current user
   * in this conversation, which affects unread count.
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
   * Subscribe to real-time message updates in a conversation
   * 
   * Sets up a Supabase real-time channel to listen for new messages.
   * Remember to unsubscribe when component unmounts!
   * 
   * @param conversationId - ID of the conversation to subscribe to
   * @param callback - Function called when new message arrives
   * @returns Supabase channel (call .unsubscribe() to cleanup)
   * 
   * @example
   * ```typescript
   * useEffect(() => {
   *   const channel = messageService.subscribeToMessages(conversationId, (message) => {
   *     // Handle new message
   *   });
   *   return () => channel.unsubscribe();
   * }, [conversationId]);
   * ```
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
   * Uses Supabase broadcast for low-latency typing indicator updates.
   * No persistence - ephemeral state only.
   * 
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user typing
   * @param displayName - Display name of the user
   * @param isTyping - Whether user is currently typing
   * @returns Supabase channel
   */
  broadcastTyping(conversationId: string, userId: string, displayName: string, isTyping: boolean) {
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
   * Manages typing state with automatic timeout after 3 seconds.
   * Filters typing users and notifies via callback.
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
          // Clear existing timeout
          const existing = typingUsers.get(userId);
          if (existing?.timeout) {
            clearTimeout(existing.timeout);
          }

          // Add user to typing list with auto-remove timeout
          const timeout = setTimeout(() => {
            typingUsers.delete(userId);
            onTypingChange(Array.from(typingUsers.values()));
          }, 3000);

          typingUsers.set(userId, { user_id: userId, display_name: displayName, timeout });
        } else {
          // Remove user from typing list
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
   * Broadcasts user's online status using Supabase Presence API.
   * Auto-expires when user disconnects.
   * 
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user
   * @param userData - Additional user data (name, avatar)
   * @returns Supabase channel
   */
  trackPresence(conversationId: string, userId: string, userData: { display_name: string; avatar_url?: string }) {
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
   * Listens for users joining/leaving the conversation.
   * Returns array of currently online users.
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
   * Listens for new messages across all conversations to update the list.
   * Useful for the conversation list view to show new messages in real-time.
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
   * Delete a message (soft delete)
   * 
   * Marks message as deleted rather than removing from database.
   * Deleted messages show as "[Message deleted]" in UI.
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
      .eq('sender_id', user.id); // Only sender can delete their own messages

    if (error) throw error;
  },

  /**
   * Check if current user can message another user
   * 
   * Validates that:
   * 1. User is authenticated
   * 2. Users have an accepted connection
   * 
   * @param otherUserId - ID of the user to check
   * @returns True if messaging is allowed, false otherwise
   */
  async canMessage(otherUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check connection status
    const { data, error } = await supabase.rpc('get_connection_status', {
      user1_id: user.id,
      user2_id: otherUserId,
    });

    if (error) {
      console.error('Error checking connection status:', error);
      return false;
    }

    return data === 'accepted';
  },
};
