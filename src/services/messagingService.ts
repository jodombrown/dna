import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  message_type: string;
  attachments?: any[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface ConversationWithProfile extends Conversation {
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
    headline?: string;
  };
  latest_message?: {
    content: string;
    is_read: boolean;
    created_at: string;
  };
}

export const conversationsService = {
  // Get all conversations for the current user
  async getUserConversations(userId: string): Promise<ConversationWithProfile[]> {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages!inner(*)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    if (!conversations) return [];

    // Get profiles for other users and latest messages
    const conversationsWithProfiles: ConversationWithProfile[] = [];
    
    for (const conv of conversations) {
      const otherUserId = conv.user_1_id === userId ? conv.user_2_id : conv.user_1_id;
      
      // Get other user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, headline')
        .eq('id', otherUserId)
        .single();

      // Get latest message
      const { data: latestMessage } = await supabase
        .from('messages')
        .select('content, is_read, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      conversationsWithProfiles.push({
        ...conv,
        other_user: profile || {
          id: otherUserId,
          full_name: 'Unknown User',
          avatar_url: '',
          headline: ''
        },
        latest_message: latestMessage || undefined
      });
    }

    return conversationsWithProfiles;
  },

  // Create or get existing conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_1_id.eq.${userId1},user_2_id.eq.${userId2}),and(user_1_id.eq.${userId2},user_2_id.eq.${userId1})`)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_1_id: userId1,
        user_2_id: userId2
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data?.id || null;
  }
};

export const messagesService = {
  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  },

  // Send a new message
  async sendMessage(conversationId: string, senderId: string, content: string, attachments?: any[]): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        attachments: attachments || []
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  }
};

export const reactionsService = {
  // Get reactions for messages
  async getMessageReactions(messageIds: string[]): Promise<MessageReaction[]> {
    if (messageIds.length === 0) return [];

    try {
      const { data, error } = await supabase.rpc('get_message_reactions', {
        p_message_ids: messageIds
      });

      if (error) {
        console.error('Error fetching reactions:', error);
        return [];
      }

      return data as MessageReaction[] || [];
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return [];
    }
  },

  // Add reaction to message
  async addReaction(messageId: string, userId: string, reaction: string): Promise<boolean> {
    try {
      await supabase.rpc('add_message_reaction', {
        p_message_id: messageId,
        p_user_id: userId,
        p_reaction: reaction
      });
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  },

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string, reaction: string): Promise<boolean> {
    try {
      await supabase.rpc('remove_message_reaction', {
        p_message_id: messageId,
        p_user_id: userId,
        p_reaction: reaction
      });
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }
};