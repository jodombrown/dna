import { supabase } from '@/integrations/supabase/client';
import type {
  FeedbackChannel,
  FeedbackMembership,
  FeedbackMessage,
  FeedbackMessageWithSender,
  FeedbackAttachment,
  ReactionSummary,
  PaginatedMessages,
  SendMessageParams,
  FeedbackFilter,
  FeedbackStatus,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackEmoji,
} from '@/types/feedback';
import type { RealtimeChannel } from '@supabase/supabase-js';

const MESSAGES_PER_PAGE = 50;

/**
 * feedbackService - Core service for DNA Feedback Hub
 */
export const feedbackService = {
  // ============================================
  // CHANNEL OPERATIONS
  // ============================================

  /**
   * Get the default feedback channel
   */
  async getDefaultChannel(): Promise<FeedbackChannel | null> {
    const { data, error } = await supabase
      .from('feedback_channels')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[feedbackService] Error fetching default channel:', error);
      return null;
    }

    return data as FeedbackChannel;
  },

  /**
   * Get user's membership status for a channel
   */
  async getMembership(userId: string, channelId: string): Promise<FeedbackMembership | null> {
    const { data, error } = await supabase
      .from('feedback_channel_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[feedbackService] Error fetching membership:', error);
      return null;
    }

    return data as FeedbackMembership | null;
  },

  /**
   * Ensure user is a member of the channel (auto-join if not)
   */
  async ensureMembership(channelId: string): Promise<FeedbackMembership | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check existing membership
    let membership = await this.getMembership(user.id, channelId);

    if (!membership) {
      // Auto-join the user
      const { data, error } = await supabase
        .from('feedback_channel_memberships')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('[feedbackService] Error creating membership:', error);
        return null;
      }

      membership = data as FeedbackMembership;
    }

    return membership;
  },

  /**
   * Opt out of a channel
   */
  async optOut(channelId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('feedback_channel_memberships')
      .update({ status: 'opted_out' })
      .eq('user_id', user.id)
      .eq('channel_id', channelId);

    if (error) {
      console.error('[feedbackService] Error opting out:', error);
      return false;
    }

    return true;
  },

  /**
   * Opt back into a channel
   */
  async optIn(channelId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('feedback_channel_memberships')
      .update({ status: 'active' })
      .eq('user_id', user.id)
      .eq('channel_id', channelId);

    if (error) {
      console.error('[feedbackService] Error opting in:', error);
      return false;
    }

    return true;
  },

  /**
   * Update last read timestamp
   */
  async updateLastRead(channelId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('feedback_channel_memberships')
      .update({ last_read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('channel_id', channelId);
  },

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  /**
   * Fetch messages with pagination
   */
  async getMessages(
    channelId: string,
    options: {
      limit?: number;
      cursor?: string;
      filter?: FeedbackFilter;
    } = {}
  ): Promise<PaginatedMessages> {
    const { data: { user } } = await supabase.auth.getUser();
    const limit = options.limit || MESSAGES_PER_PAGE;

    let query = supabase
      .from('feedback_messages')
      .select(`
        *,
        attachments:feedback_attachments (*)
      `)
      .eq('channel_id', channelId)
      .eq('is_deleted', false) // Exclude deleted messages
      .is('parent_id', null) // Only top-level messages
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    // Apply filters
    if (options.filter === 'pinned') {
      query = query.eq('is_pinned', true);
    } else if (options.filter === 'my_feedback' && user) {
      query = query.eq('sender_id', user.id);
    }

    // Apply cursor for pagination
    if (options.cursor) {
      query = query.lt('created_at', options.cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[feedbackService] Error fetching messages:', error);
      return { messages: [], nextCursor: null, hasMore: false };
    }

    const hasMore = data.length > limit;
    const messages = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? messages[messages.length - 1]?.created_at : null;

    // Fetch sender profiles separately (no FK constraint exists)
    const senderIds = [...new Set(messages.map((m: any) => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);
    
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Fetch reactions for each message and attach sender
    const messagesWithReactions = await Promise.all(
      messages.map(async (msg: any) => {
        const reactions = await this.getReactions(msg.id);
        return {
          ...msg,
          sender: profileMap.get(msg.sender_id) || null,
          reactions,
        } as FeedbackMessageWithSender;
      })
    );

    return {
      messages: messagesWithReactions,
      nextCursor,
      hasMore,
    };
  },

  /**
   * Send a new message
   */
  async sendMessage(params: SendMessageParams): Promise<FeedbackMessage | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[feedbackService] No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('feedback_messages')
      .insert({
        channel_id: params.channelId,
        sender_id: user.id,
        content: params.content,
        message_type: params.contentType || 'text',
        user_tag: params.userTag || null,
        parent_id: params.parentMessageId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] Error sending message:', error);
      return null;
    }

    return data as FeedbackMessage;
  },

  /**
   * Get thread replies for a message
   */
  async getThread(parentMessageId: string): Promise<FeedbackMessageWithSender[]> {
    const { data, error } = await supabase
      .from('feedback_messages')
      .select(`
        *,
        attachments:feedback_attachments (*)
      `)
      .eq('parent_id', parentMessageId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[feedbackService] Error fetching thread:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Fetch sender profiles separately
    const senderIds = [...new Set(data.map((m: any) => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);
    
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return data.map((msg: any) => ({
      ...msg,
      sender: profileMap.get(msg.sender_id) || null,
    })) as unknown as FeedbackMessageWithSender[];
  },

  /**
   * Get a single message by ID
   */
  async getMessage(messageId: string): Promise<FeedbackMessageWithSender | null> {
    const { data, error } = await supabase
      .from('feedback_messages')
      .select(`
        *,
        attachments:feedback_attachments (*)
      `)
      .eq('id', messageId)
      .single();

    if (error) {
      console.error('[feedbackService] Error fetching message:', error);
      return null;
    }

    // Fetch sender profile separately
    const { data: sender } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', data.sender_id)
      .single();

    const reactions = await this.getReactions(messageId);
    return { ...data, sender, reactions } as unknown as FeedbackMessageWithSender;
  },

  // ============================================
  // ATTACHMENT OPERATIONS
  // ============================================

  /**
   * Upload an attachment
   */
  async uploadAttachment(
    messageId: string,
    file: File,
    type: 'image' | 'voice' | 'video'
  ): Promise<FeedbackAttachment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${messageId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('feedback-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('[feedbackService] Error uploading file:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('feedback-media')
      .getPublicUrl(fileName);

    // Create attachment record
    const { data, error } = await supabase
      .from('feedback_attachments')
      .insert({
        message_id: messageId,
        file_url: urlData.publicUrl,
        file_type: type,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] Error creating attachment record:', error);
      return null;
    }

    return data as FeedbackAttachment;
  },

  // ============================================
  // REACTION OPERATIONS
  // ============================================

  /**
   * Get reactions for a message
   */
  async getReactions(messageId: string): Promise<ReactionSummary> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('feedback_reactions')
      .select('emoji, user_id')
      .eq('message_id', messageId);

    if (error) {
      console.error('[feedbackService] Error fetching reactions:', error);
      return {};
    }

    // Aggregate reactions
    const summary: ReactionSummary = {};
    data.forEach((reaction) => {
      if (!summary[reaction.emoji]) {
        summary[reaction.emoji] = {
          count: 0,
          users: [],
          reacted_by_me: false,
        };
      }
      summary[reaction.emoji].count++;
      summary[reaction.emoji].users.push(reaction.user_id);
      if (user && reaction.user_id === user.id) {
        summary[reaction.emoji].reacted_by_me = true;
      }
    });

    return summary;
  },

  /**
   * Add a reaction
   */
  async addReaction(messageId: string, emoji: FeedbackEmoji): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('feedback_reactions')
      .upsert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      }, {
        onConflict: 'message_id,user_id,emoji',
      });

    if (error) {
      console.error('[feedbackService] Error adding reaction:', error);
      return false;
    }

    return true;
  },

  /**
   * Remove a reaction
   */
  async removeReaction(messageId: string, emoji: FeedbackEmoji): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('feedback_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      console.error('[feedbackService] Error removing reaction:', error);
      return false;
    }

    return true;
  },

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Check if current user is admin via RPC
   */
  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_feedback_admin');
    if (error) {
      console.error('[feedbackService] Error checking admin status:', error);
      return false;
    }
    return !!data;
  },

  /**
   * Update message status (admin only) and notify the user
   */
  async updateStatus(messageId: string, status: FeedbackStatus): Promise<boolean> {
    // First get the message to find the sender
    const { data: message, error: fetchError } = await supabase
      .from('feedback_messages')
      .select('sender_id, content')
      .eq('id', messageId)
      .single();

    if (fetchError) {
      console.error('[feedbackService] Error fetching message for status update:', fetchError);
      return false;
    }

    // Update the status
    const { error } = await supabase
      .from('feedback_messages')
      .update({ status })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error updating status:', error);
      return false;
    }

    // Send notification to the feedback author
    if (message?.sender_id) {
      const statusLabels: Record<string, string> = {
        new: 'New',
        in_review: 'In Review',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed',
      };
      const statusLabel = statusLabels[status] || status;
      const preview = message.content?.slice(0, 50) || 'your feedback';
      
      // Import and call notification service
      const { createDNANotification } = await import('@/services/notificationService');
      await createDNANotification({
        user_id: message.sender_id,
        title: 'DNA Feedback Hub',
        message: `Your feedback "${preview}${message.content?.length > 50 ? '...' : ''}" has been marked as ${statusLabel}`,
        link_url: '/dna/feedback',
        feedback_status: status,
      });
    }

    return true;
  },

  /**
   * Update message category (admin only)
   */
  async updateCategory(messageId: string, category: FeedbackCategory): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ category })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error updating category:', error);
      return false;
    }

    return true;
  },

  /**
   * Update message priority (admin only)
   */
  async updatePriority(messageId: string, priority: FeedbackPriority): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ priority })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error updating priority:', error);
      return false;
    }

    return true;
  },

  /**
   * Pin/unpin a message (admin only)
   */
  async togglePin(messageId: string, isPinned: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error toggling pin:', error);
      return false;
    }

    return true;
  },

  /**
   * Highlight/unhighlight a message (admin only)
   */
  async toggleHighlight(messageId: string, isHighlighted: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ is_highlighted: isHighlighted })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error toggling highlight:', error);
      return false;
    }

    return true;
  },

  /**
   * Add admin notes to a message
   */
  async updateAdminNotes(messageId: string, notes: string): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ admin_notes: notes })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error updating admin notes:', error);
      return false;
    }

    return true;
  },

  /**
   * Soft delete a message by setting is_deleted=true
   * Admins can delete any message, users can only delete their own
   */
  async softDelete(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('[feedbackService] Error soft-deleting message:', error);
      return false;
    }

    return true;
  },

  /**
   * Get a signed URL for an attachment
   */
  async getAttachmentUrl(storagePath: string): Promise<string | null> {
    // If it's already a full URL, return it
    if (storagePath.startsWith('http')) {
      return storagePath;
    }

    const { data, error } = await supabase.storage
      .from('feedback-media')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('[feedbackService] Error getting attachment URL:', error);
      return null;
    }

    return data.signedUrl;
  },

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to new messages in a channel
   */
  subscribeToMessages(channelId: string, onMessage: () => void): RealtimeChannel {
    return supabase
      .channel(`feedback-messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        onMessage
      )
      .subscribe();
  },

  /**
   * Subscribe to message updates
   */
  subscribeToMessageUpdates(channelId: string, onUpdate: () => void): RealtimeChannel {
    return supabase
      .channel(`feedback-updates-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  },
};
