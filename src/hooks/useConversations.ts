
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch conversations where user is participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get other user IDs
      const otherUserIds = conversationsData.map(conv => 
        conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id
      );

      // Fetch other users' profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      // Fetch last message for each conversation
      const conversationIds = conversationsData.map(conv => conv.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('conversation_id, content, sender_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Group messages by conversation and get the latest one
      const lastMessages = messagesData?.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) {
          acc[msg.conversation_id] = msg;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Fetch unread counts
      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id, id')
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      const unreadCounts = unreadData?.reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine all data
      const enrichedConversations = conversationsData.map(conv => {
        const otherUserId = conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id;
        const otherUser = profilesData?.find(p => p.id === otherUserId);
        const lastMessage = lastMessages[conv.id];
        const unreadCount = unreadCounts[conv.id] || 0;

        return {
          ...conv,
          other_user: otherUser,
          last_message: lastMessage,
          unread_count: unreadCount
        };
      });

      setConversations(enrichedConversations);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrGetConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Ensure user_1_id is always the smaller UUID
      const user1Id = user.id < otherUserId ? user.id : otherUserId;
      const user2Id = user.id < otherUserId ? otherUserId : user.id;

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_1_id', user1Id)
        .eq('user_2_id', user2Id)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user_1_id: user1Id,
          user_2_id: user2Id
        })
        .select('id')
        .single();

      if (error) throw error;

      await fetchConversations(); // Refresh the list
      return newConv.id;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createOrGetConversation
  };
};
