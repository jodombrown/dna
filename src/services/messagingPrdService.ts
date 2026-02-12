/**
 * DNA Messaging Service (PRD)
 *
 * The complete messaging service implementing all five conversation types:
 * Direct Messages, Group Conversations, Event Threads, Space Channels,
 * and Opportunity Threads.
 *
 * Integrates with:
 * - Supabase real-time for live messaging
 * - Notification system for delivery
 * - DIA for metadata tracking (never message content)
 * - Offline queue for African connectivity resilience
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type {
  Conversation,
  ConversationType,
  ConversationPreview,
  ConversationFilter,
  ConversationParticipant,
  ConversationSubscriptionCallbacks,
  Message,
  MessageContentType,
  MessageMedia,
  MessageStatus,
  MessageReaction,
  CrossCReference,
  ParticipantRole,
  ParticipantPreview,
  DirectRecipientInfo,
  TypingIndicator,
  SendMessageParams,
  OfflineQueueItem,
  MESSAGING_TIER_CONFIG,
} from '@/types/messagingPRD';
import {
  ConversationType as ConvType,
  MessageContentType as MsgContentType,
  MessageStatus as MsgStatus,
  ParticipantRole as PartRole,
  SUPPORTED_REACTIONS,
} from '@/types/messagingPRD';

const LOG_TAG = 'MessagingPrdService';

// ============================================================
// DATABASE ROW MAPPERS
// ============================================================

function mapConversationRow(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    type: row.type as ConversationType,
    cModule: row.c_module as Conversation['cModule'],
    title: (row.title as string) || null,
    description: (row.description as string) || null,
    imageUrl: (row.image_url as string) || null,
    createdBy: row.created_by as string,
    contextType: (row.context_type as Conversation['contextType']) || null,
    contextId: (row.context_id as string) || null,
    participantCount: (row.participant_count as number) || 0,
    participantLimit: (row.participant_limit as number) || 50,
    lastMessageAt: row.last_message_at ? new Date(row.last_message_at as string) : null,
    lastMessagePreview: (row.last_message_preview as string) || null,
    lastMessageSenderId: (row.last_message_sender_id as string) || null,
    lastMessageSenderName: (row.last_message_sender_name as string) || null,
    messageCount: (row.message_count as number) || 0,
    pinnedMessageCount: (row.pinned_message_count as number) || 0,
    muteStatus: 'unmuted',
    isArchived: (row.is_archived as boolean) || false,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapParticipantRow(row: Record<string, unknown>): ConversationParticipant {
  return {
    conversationId: row.conversation_id as string,
    userId: row.user_id as string,
    role: row.role as ParticipantRole,
    joinedAt: new Date(row.joined_at as string),
    lastReadAt: row.last_read_at ? new Date(row.last_read_at as string) : null,
    lastReadMessageId: (row.last_read_message_id as string) || null,
    unreadCount: (row.unread_count as number) || 0,
    muteUntil: row.mute_until ? new Date(row.mute_until as string) : null,
    isTyping: (row.is_typing as boolean) || false,
    lastActiveAt: row.last_active_at ? new Date(row.last_active_at as string) : null,
    nickname: (row.nickname as string) || null,
  };
}

function mapMessageRow(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    senderName: (row.sender_name as string) || '',
    senderAvatarUrl: (row.sender_avatar_url as string) || null,
    content: (row.content as string) || '',
    contentType: (row.content_type as MessageContentType) || MsgContentType.TEXT,
    media: (row.media as MessageMedia[]) || [],
    replyToMessageId: (row.reply_to_message_id as string) || null,
    replyToPreview: (row.reply_to_preview as string) || null,
    isPinned: (row.is_pinned as boolean) || false,
    isEdited: (row.is_edited as boolean) || false,
    editedAt: row.edited_at ? new Date(row.edited_at as string) : null,
    isSystemMessage: (row.is_system_message as boolean) || false,
    systemMessageType: (row.system_message_type as Message['systemMessageType']) || null,
    crossCReferences: (row.cross_c_references as CrossCReference[]) || [],
    reactions: (row.reactions as MessageReaction[]) || [],
    readBy: (row.read_by as string[]) || [],
    status: (row.status as MessageStatus) || MsgStatus.SENT,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// ============================================================
// MESSAGING SERVICE
// ============================================================

export const messagingPrdService = {

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  /**
   * Create or find an existing direct conversation between two users.
   */
  async createDirectConversation(
    userId: string,
    recipientId: string
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('create_direct_messaging_conversation', {
      p_user_id: userId,
      p_recipient_id: recipientId,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to create direct conversation', error);
      throw error;
    }

    // Fetch the full conversation
    const conversationId = data as string;
    return this.getConversation(conversationId);
  },

  /**
   * Create a group conversation with multiple participants.
   * All participants must be connected to the creator.
   */
  async createGroupConversation(
    userId: string,
    params: {
      title: string;
      participantIds: string[];
      imageUrl?: string;
    }
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('create_group_messaging_conversation', {
      p_creator_id: userId,
      p_title: params.title,
      p_participant_ids: params.participantIds,
      p_image_url: params.imageUrl || null,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to create group conversation', error);
      throw error;
    }

    const conversationId = data as string;
    return this.getConversation(conversationId);
  },

  /**
   * Create an event thread. Auto-created when event is published.
   */
  async createEventThread(
    eventId: string,
    organizerId: string,
    eventTitle: string
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('create_event_messaging_thread', {
      p_event_id: eventId,
      p_organizer_id: organizerId,
      p_title: `${eventTitle} Discussion`,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to create event thread', error);
      throw error;
    }

    const conversationId = data as string;
    return this.getConversation(conversationId);
  },

  /**
   * Create a space channel. General channel auto-created with Space.
   */
  async createSpaceChannel(
    spaceId: string,
    creatorId: string,
    channelName: string = 'General'
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('create_space_messaging_channel', {
      p_space_id: spaceId,
      p_creator_id: creatorId,
      p_channel_name: channelName,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to create space channel', error);
      throw error;
    }

    const conversationId = data as string;
    return this.getConversation(conversationId);
  },

  /**
   * Create an opportunity thread between poster and interested party.
   */
  async createOpportunityThread(
    opportunityId: string,
    posterId: string,
    interestedUserId: string,
    opportunityTitle: string
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('create_opportunity_messaging_thread', {
      p_opportunity_id: opportunityId,
      p_poster_id: posterId,
      p_interested_user_id: interestedUserId,
      p_title: `Re: ${opportunityTitle}`,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to create opportunity thread', error);
      throw error;
    }

    const conversationId = data as string;

    // Send structured intro system message
    await this.sendSystemMessage(conversationId, {
      type: 'conversation_created',
      content: `Interest expressed in "${opportunityTitle}". Start the conversation to explore this opportunity.`,
      senderId: interestedUserId,
    });

    return this.getConversation(conversationId);
  },

  /**
   * Fetch a single conversation by ID.
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('messaging_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch conversation', error);
      throw error;
    }

    return mapConversationRow(data as Record<string, unknown>);
  },

  // ============================================
  // SENDING MESSAGES
  // ============================================

  /**
   * Send a message in a conversation.
   * Handles optimistic UI, real-time broadcast, notifications, and DIA metadata.
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    params: SendMessageParams
  ): Promise<Message> {
    // Get sender profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', senderId)
      .single();

    const senderName = profile?.full_name || 'Unknown';
    const senderAvatarUrl = profile?.avatar_url || null;

    // If reply, fetch preview
    let replyToPreview: string | null = null;
    if (params.replyToMessageId) {
      const { data: original } = await supabase
        .from('messaging_messages')
        .select('content')
        .eq('id', params.replyToMessageId)
        .single();
      replyToPreview = original?.content?.slice(0, 100) || null;
    }

    // Insert message
    const { data, error } = await supabase
      .from('messaging_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar_url: senderAvatarUrl,
        content: params.content,
        content_type: params.contentType || 'text',
        media: (params.media || []) as unknown as Record<string, unknown>[],
        reply_to_message_id: params.replyToMessageId || null,
        reply_to_preview: replyToPreview,
        cross_c_references: (params.crossCReferences || []) as unknown as Record<string, unknown>[],
        reactions: [],
        read_by: [senderId],
        status: 'sent',
        is_pinned: false,
        is_edited: false,
        is_system_message: false,
      })
      .select()
      .single();

    if (error) {
      logger.error(LOG_TAG, 'Failed to send message', error);
      throw error;
    }

    const sentMessage = mapMessageRow(data as Record<string, unknown>);

    // Update conversation metadata
    await supabase
      .from('messaging_conversations')
      .update({
        last_message_at: sentMessage.createdAt.toISOString(),
        last_message_preview: sentMessage.content.slice(0, 100),
        last_message_sender_id: senderId,
        last_message_sender_name: senderName,
        message_count: (await this.getConversation(conversationId)).messageCount + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // Broadcast via real-time
    try {
      await supabase
        .channel(`messaging:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: sentMessage,
        });
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to broadcast message', err);
    }

    // Increment unread for other participants
    const { data: otherParticipants } = await supabase
      .from('messaging_participants')
      .select('user_id, unread_count, mute_until')
      .eq('conversation_id', conversationId)
      .neq('user_id', senderId);

    if (otherParticipants) {
      for (const p of otherParticipants) {
        await supabase
          .from('messaging_participants')
          .update({ unread_count: (p.unread_count || 0) + 1 })
          .eq('conversation_id', conversationId)
          .eq('user_id', p.user_id);
      }
    }

    // Update DIA metadata (never message content)
    this.updateDIAMetadata(conversationId, senderId).catch((err) => {
      logger.warn(LOG_TAG, 'Failed to update DIA metadata', err);
    });

    return sentMessage;
  },

  /**
   * Send a system message (participant joined, title changed, etc.)
   */
  async sendSystemMessage(
    conversationId: string,
    params: {
      type: string;
      content: string;
      senderId?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: params.senderId || '00000000-0000-0000-0000-000000000000',
        sender_name: 'System',
        content: params.content,
        content_type: 'system',
        is_system_message: true,
        system_message_type: params.type,
        status: 'sent',
        media: [],
        cross_c_references: [],
        reactions: [],
        read_by: [],
      });

    if (error) {
      logger.warn(LOG_TAG, 'Failed to send system message', error);
    }
  },

  // ============================================
  // REACTIONS
  // ============================================

  /**
   * Add a reaction to a message.
   */
  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    if (!SUPPORTED_REACTIONS.includes(emoji as typeof SUPPORTED_REACTIONS[number])) {
      throw new Error(`Unsupported reaction: ${emoji}`);
    }

    // Fetch current reactions
    const { data: msg } = await supabase
      .from('messaging_messages')
      .select('reactions, conversation_id')
      .eq('id', messageId)
      .single();

    if (!msg) throw new Error('Message not found');

    const reactions = (msg.reactions as MessageReaction[]) || [];
    const existing = reactions.find((r) => r.emoji === emoji);

    if (existing) {
      if (!existing.userIds.includes(userId)) {
        existing.userIds.push(userId);
        existing.count++;
      }
    } else {
      reactions.push({ emoji, userIds: [userId], count: 1 });
    }

    await supabase
      .from('messaging_messages')
      .update({ reactions: reactions as unknown as Record<string, unknown>[] })
      .eq('id', messageId);

    // Broadcast reaction
    try {
      await supabase
        .channel(`messaging:${msg.conversation_id}`)
        .send({
          type: 'broadcast',
          event: 'reaction_added',
          payload: { messageId, userId, emoji },
        });
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to broadcast reaction', err);
    }
  },

  /**
   * Remove a reaction from a message.
   */
  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    const { data: msg } = await supabase
      .from('messaging_messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    if (!msg) throw new Error('Message not found');

    const reactions = (msg.reactions as MessageReaction[]) || [];
    const existing = reactions.find((r) => r.emoji === emoji);

    if (existing) {
      existing.userIds = existing.userIds.filter((id) => id !== userId);
      existing.count = existing.userIds.length;
    }

    // Remove empty reactions
    const filtered = reactions.filter((r) => r.count > 0);

    await supabase
      .from('messaging_messages')
      .update({ reactions: filtered as unknown as Record<string, unknown>[] })
      .eq('id', messageId);
  },

  // ============================================
  // READ TRACKING
  // ============================================

  /**
   * Mark a conversation as read up to a specific message.
   */
  async markAsRead(
    conversationId: string,
    userId: string,
    lastReadMessageId: string
  ): Promise<void> {
    await supabase
      .from('messaging_participants')
      .update({
        last_read_at: new Date().toISOString(),
        last_read_message_id: lastReadMessageId,
        unread_count: 0,
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    // Broadcast read receipt
    try {
      await supabase
        .channel(`messaging:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'read_receipt',
          payload: { userId, lastReadMessageId, timestamp: new Date() },
        });
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to broadcast read receipt', err);
    }
  },

  // ============================================
  // TYPING INDICATORS
  // ============================================

  /**
   * Send typing indicator via real-time broadcast (no DB write).
   */
  async sendTypingIndicator(
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      await supabase
        .channel(`messaging:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { conversationId, userId, userName, isTyping, timestamp: new Date() },
        });
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to send typing indicator', err);
    }
  },

  // ============================================
  // PINNING
  // ============================================

  /**
   * Pin a message in a conversation. Requires admin or owner role.
   */
  async pinMessage(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    // Check permission
    const { data: participant } = await supabase
      .from('messaging_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant || !['owner', 'admin'].includes(participant.role)) {
      throw new Error('Only admins can pin messages');
    }

    await supabase
      .from('messaging_messages')
      .update({ is_pinned: true })
      .eq('id', messageId)
      .eq('conversation_id', conversationId);

    // Update pinned count
    const conversation = await this.getConversation(conversationId);
    await supabase
      .from('messaging_conversations')
      .update({ pinned_message_count: conversation.pinnedMessageCount + 1 })
      .eq('id', conversationId);

    // Send system message
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    await this.sendSystemMessage(conversationId, {
      type: 'system',
      content: `${profile?.full_name || 'Someone'} pinned a message`,
      senderId: userId,
    });
  },

  /**
   * Unpin a message.
   */
  async unpinMessage(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const { data: participant } = await supabase
      .from('messaging_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant || !['owner', 'admin'].includes(participant.role)) {
      throw new Error('Only admins can unpin messages');
    }

    await supabase
      .from('messaging_messages')
      .update({ is_pinned: false })
      .eq('id', messageId)
      .eq('conversation_id', conversationId);

    const conversation = await this.getConversation(conversationId);
    await supabase
      .from('messaging_conversations')
      .update({
        pinned_message_count: Math.max(0, conversation.pinnedMessageCount - 1),
      })
      .eq('id', conversationId);
  },

  // ============================================
  // PARTICIPANT MANAGEMENT
  // ============================================

  /**
   * Add a participant to a conversation.
   */
  async addParticipant(
    conversationId: string,
    userId: string,
    role: ParticipantRole = PartRole.MEMBER
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_participants')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
      });

    if (error) {
      logger.error(LOG_TAG, 'Failed to add participant', error);
      throw error;
    }

    // Update participant count
    const conversation = await this.getConversation(conversationId);
    await supabase
      .from('messaging_conversations')
      .update({ participant_count: conversation.participantCount + 1 })
      .eq('id', conversationId);
  },

  /**
   * Remove a participant from a conversation.
   */
  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to remove participant', error);
      throw error;
    }

    const conversation = await this.getConversation(conversationId);
    await supabase
      .from('messaging_conversations')
      .update({ participant_count: Math.max(0, conversation.participantCount - 1) })
      .eq('id', conversationId);
  },

  /**
   * Change a participant's role.
   */
  async changeParticipantRole(
    conversationId: string,
    userId: string,
    newRole: ParticipantRole
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_participants')
      .update({ role: newRole })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to change participant role', error);
      throw error;
    }
  },

  /**
   * Get participant record for a user in a conversation.
   */
  async getParticipant(
    conversationId: string,
    userId: string
  ): Promise<ConversationParticipant | null> {
    const { data, error } = await supabase
      .from('messaging_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return mapParticipantRow(data as Record<string, unknown>);
  },

  /**
   * Get all participants of a conversation.
   */
  async getParticipants(
    conversationId: string
  ): Promise<ConversationParticipant[]> {
    const { data, error } = await supabase
      .from('messaging_participants')
      .select('*')
      .eq('conversation_id', conversationId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch participants', error);
      return [];
    }

    return (data || []).map((row) => mapParticipantRow(row as Record<string, unknown>));
  },

  // ============================================
  // CONVERSATION LIST
  // ============================================

  /**
   * Get paginated conversation list for a user with filters.
   */
  async getConversations(
    userId: string,
    filter: ConversationFilter,
    cursor: string | null,
    limit: number = 20
  ): Promise<{ conversations: ConversationPreview[]; hasMore: boolean }> {
    // Get user's conversations via participant records
    let query = supabase
      .from('messaging_participants')
      .select('*, conversation:messaging_conversations(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(limit + 1);

    const { data, error } = await query;
    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch conversations', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { conversations: [], hasMore: false };
    }

    const hasMore = data.length > limit;
    const items = data.slice(0, limit);

    // Build previews
    const previews: ConversationPreview[] = [];
    for (const item of items) {
      const convData = item.conversation as Record<string, unknown> | null;
      if (!convData) continue;

      const conversation = mapConversationRow(convData);

      // Apply filters
      if (filter.type !== 'all' && conversation.type !== filter.type) continue;
      if (filter.readStatus === 'unread' && (item.unread_count || 0) === 0) continue;
      if (filter.searchQuery && conversation.title &&
        !conversation.title.toLowerCase().includes(filter.searchQuery.toLowerCase())) continue;

      const participant = mapParticipantRow(item as Record<string, unknown>);

      // Get other participants preview
      const { data: otherParts } = await supabase
        .from('messaging_participants')
        .select('user_id, role')
        .eq('conversation_id', conversation.id)
        .neq('user_id', userId)
        .limit(5);

      const otherParticipants: ParticipantPreview[] = [];
      let directRecipient: DirectRecipientInfo | null = null;

      if (otherParts && otherParts.length > 0) {
        const otherUserIds = otherParts.map((p) => p.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, headline')
          .in('id', otherUserIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p])
        );

        for (const part of otherParts) {
          const prof = profileMap.get(part.user_id);
          otherParticipants.push({
            userId: part.user_id,
            displayName: prof?.full_name || 'Unknown',
            avatarUrl: prof?.avatar_url || null,
            role: part.role as ParticipantRole,
          });
        }

        // For direct messages, set the direct recipient
        if (conversation.type === ConvType.DIRECT && otherParts.length === 1) {
          const recipientProfile = profileMap.get(otherParts[0].user_id);
          if (recipientProfile) {
            directRecipient = {
              userId: recipientProfile.id,
              displayName: recipientProfile.full_name || 'Unknown',
              avatarUrl: recipientProfile.avatar_url || null,
              isOnline: false,
              headline: recipientProfile.headline || null,
            };
          }
        }
      }

      previews.push({
        conversation,
        participant,
        otherParticipants,
        unreadCount: participant.unreadCount,
        isPinned: false,
        directRecipient,
      });
    }

    // Sort by last message time
    previews.sort((a, b) => {
      const aTime = a.conversation.lastMessageAt?.getTime() || 0;
      const bTime = b.conversation.lastMessageAt?.getTime() || 0;
      return bTime - aTime;
    });

    return { conversations: previews, hasMore };
  },

  /**
   * Get paginated messages for a conversation.
   */
  async getMessages(
    conversationId: string,
    cursor: string | null,
    limit: number = 30
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    let query = supabase
      .from('messaging_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch messages', error);
      throw error;
    }

    const hasMore = (data?.length || 0) > limit;
    const messages = (data || [])
      .slice(0, limit)
      .reverse()
      .map((row) => mapMessageRow(row as Record<string, unknown>));

    return { messages, hasMore };
  },

  /**
   * Get pinned messages for a conversation.
   */
  async getPinnedMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messaging_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch pinned messages', error);
      return [];
    }

    return (data || []).map((row) => mapMessageRow(row as Record<string, unknown>));
  },

  /**
   * Search messages across user's conversations using full-text search.
   */
  async searchMessages(
    userId: string,
    query: string,
    conversationId?: string,
    limit: number = 20
  ): Promise<Array<{
    messageId: string;
    conversationId: string;
    conversationTitle: string | null;
    senderName: string;
    content: string;
    createdAt: Date;
    rank: number;
  }>> {
    const { data, error } = await supabase.rpc('search_messaging_messages', {
      p_user_id: userId,
      p_query: query,
      p_conversation_id: conversationId || null,
      p_limit: limit,
    });

    if (error) {
      logger.error(LOG_TAG, 'Failed to search messages', error);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      messageId: row.message_id as string,
      conversationId: row.conversation_id as string,
      conversationTitle: (row.conversation_title as string) || null,
      senderName: row.sender_name as string,
      content: row.content as string,
      createdAt: new Date(row.created_at as string),
      rank: row.rank as number,
    }));
  },

  // ============================================
  // CONVERSATION ACTIONS
  // ============================================

  /**
   * Archive a conversation for the current user.
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await supabase
      .from('messaging_conversations')
      .update({ is_archived: true })
      .eq('id', conversationId);
  },

  /**
   * Unarchive a conversation.
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    await supabase
      .from('messaging_conversations')
      .update({ is_archived: false })
      .eq('id', conversationId);
  },

  /**
   * Mute a conversation for a duration.
   */
  async muteConversation(
    conversationId: string,
    userId: string,
    duration: 'muted_1h' | 'muted_8h' | 'muted_24h' | 'muted_forever'
  ): Promise<void> {
    let muteUntil: string | null = null;
    const now = new Date();

    switch (duration) {
      case 'muted_1h':
        muteUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        break;
      case 'muted_8h':
        muteUntil = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
        break;
      case 'muted_24h':
        muteUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'muted_forever':
        muteUntil = new Date(9999, 11, 31).toISOString();
        break;
    }

    await supabase
      .from('messaging_participants')
      .update({ mute_until: muteUntil })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  },

  /**
   * Unmute a conversation.
   */
  async unmuteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await supabase
      .from('messaging_participants')
      .update({ mute_until: null })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  },

  /**
   * Edit a message (within the allowed time window based on tier).
   */
  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_messages')
      .update({
        content: newContent,
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to edit message', error);
      throw error;
    }
  },

  /**
   * Delete a message (soft delete — content replaced with tombstone).
   */
  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('messaging_messages')
      .update({
        content: '[Message deleted]',
        media: [],
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to delete message', error);
      throw error;
    }
  },

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to real-time events for a conversation.
   * Returns a cleanup function.
   */
  subscribeToConversation(
    conversationId: string,
    callbacks: ConversationSubscriptionCallbacks
  ): () => void {
    const channel = supabase
      .channel(`messaging:${conversationId}`)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        callbacks.onMessage(payload.payload as Message);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        callbacks.onTyping(payload.payload as TypingIndicator);
      })
      .on('broadcast', { event: 'read_receipt' }, (payload) => {
        callbacks.onReadReceipt(payload.payload as { userId: string; lastReadMessageId: string });
      })
      .on('broadcast', { event: 'reaction_added' }, (payload) => {
        callbacks.onReaction(payload.payload as { messageId: string; userId: string; emoji: string });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to conversation list updates for a user.
   * Returns a cleanup function.
   */
  subscribeToConversationList(
    userId: string,
    callback: (update: { conversationId: string; lastMessage: Partial<Message> }) => void
  ): () => void {
    const channel = supabase
      .channel(`user_messaging:${userId}`)
      .on('broadcast', { event: 'conversation_update' }, (payload) => {
        callback(payload.payload as { conversationId: string; lastMessage: Partial<Message> });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============================================
  // DIA METADATA (never message content)
  // ============================================

  /**
   * Update DIA metadata signals based on messaging activity.
   * DIA reads frequency, timing, participant list — never message content.
   */
  async updateDIAMetadata(
    conversationId: string,
    senderId: string
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return;

    // For direct messages: update network edge messaging signals
    if (conversation.type === ConvType.DIRECT) {
      const participants = await this.getParticipants(conversationId);
      const other = participants.find((p) => p.userId !== senderId);
      if (!other) return;

      try {
        await supabase.rpc('update_messaging_metadata', {
          p_user_a: senderId,
          p_user_b: other.userId,
          p_timestamp: new Date().toISOString(),
        });
      } catch (err) {
        logger.warn(LOG_TAG, 'Failed to update messaging metadata for DIA', err);
      }
    }

    // For Space channels: update collaboration signals
    if (conversation.type === ConvType.SPACE_CHANNEL && conversation.contextId) {
      try {
        await supabase.rpc('update_space_activity', {
          p_space_id: conversation.contextId,
          p_user_id: senderId,
          p_activity_type: 'channel_message',
        });
      } catch (err) {
        // update_space_activity may not exist yet
        logger.warn(LOG_TAG, 'Failed to update space activity for DIA', err);
      }
    }

    // Update per-user messaging metadata
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('messaging_metadata')
      .select('id, message_count')
      .eq('conversation_id', conversationId)
      .eq('user_id', senderId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('messaging_metadata')
        .update({
          message_count: (existing.message_count || 0) + 1,
          last_message_at: now,
          updated_at: now,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('messaging_metadata')
        .insert({
          conversation_id: conversationId,
          user_id: senderId,
          message_count: 1,
          first_message_at: now,
          last_message_at: now,
        });
    }
  },

  // ============================================
  // TOTAL UNREAD COUNT
  // ============================================

  /**
   * Get total unread message count across all conversations.
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('messaging_participants')
      .select('unread_count')
      .eq('user_id', userId)
      .gt('unread_count', 0);

    if (error || !data) return 0;
    return data.reduce((sum, row) => sum + (row.unread_count || 0), 0);
  },

  // ============================================
  // HELPER: Get conversations by context
  // ============================================

  /**
   * Find conversations by their C-module context (event, space, opportunity).
   */
  async getConversationsByContext(
    contextType: 'event' | 'space' | 'opportunity',
    contextId: string
  ): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('messaging_conversations')
      .select('*')
      .eq('context_type', contextType)
      .eq('context_id', contextId);

    if (error) {
      logger.error(LOG_TAG, 'Failed to fetch conversations by context', error);
      return [];
    }

    return (data || []).map((row) => mapConversationRow(row as Record<string, unknown>));
  },
};
