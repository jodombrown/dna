
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface GroupConversation {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  member_count: number;
  is_active: boolean;
  members?: GroupMember[];
  last_message?: {
    content: string;
    sender_id: string;
  };
  unread_count?: number;
}

export interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useGroupConversations = () => {
  const { user } = useAuth();
  const [groupConversations, setGroupConversations] = useState<GroupConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch group conversations where user is a member
      const { data: conversations, error: conversationsError } = await supabase
        .from('group_conversations')
        .select('*')
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      if (!conversations || conversations.length === 0) {
        setGroupConversations([]);
        setLoading(false);
        return;
      }

      // Fetch members for each conversation
      const conversationIds = conversations.map(conv => conv.id);
      const { data: members } = await supabase
        .from('group_conversation_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          group_conversation_id
        `)
        .in('group_conversation_id', conversationIds);

      // Fetch profiles separately
      const userIds = members?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Fetch last messages for each conversation
      const { data: lastMessages } = await supabase
        .from('messages')
        .select('group_conversation_id, content, sender_id, created_at')
        .in('group_conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Group messages by conversation and get the latest one
      const lastMessagesByConversation = lastMessages?.reduce((acc, msg) => {
        if (!acc[msg.group_conversation_id]) {
          acc[msg.group_conversation_id] = msg;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Create profiles lookup
      const profilesLookup = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      // Enhance conversations with members and last messages
      const enhancedConversations: GroupConversation[] = conversations.map(conv => {
        const conversationMembers: GroupMember[] = members?.filter(m => m.group_conversation_id === conv.id).map(m => ({
          id: m.id,
          user_id: m.user_id,
          role: (m.role as 'admin' | 'member') || 'member',
          joined_at: m.joined_at,
          profile: profilesLookup[m.user_id] ? {
            full_name: profilesLookup[m.user_id].full_name || '',
            avatar_url: profilesLookup[m.user_id].avatar_url || undefined
          } : undefined
        })) || [];
        
        const lastMessage = lastMessagesByConversation[conv.id];

        return {
          ...conv,
          members: conversationMembers,
          last_message: lastMessage,
          unread_count: 0 // TODO: Calculate unread count
        };
      });

      setGroupConversations(enhancedConversations);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching group conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGroupConversation = async (
    name: string, 
    description?: string, 
    memberIds: string[] = []
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data: newGroup, error } = await supabase
        .from('group_conversations')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select('id')
        .single();

      if (error) throw error;

      // Add additional members if provided
      if (memberIds.length > 0) {
        const memberInserts = memberIds.map(userId => ({
          group_conversation_id: newGroup.id,
          user_id: userId,
          role: 'member' as const
        }));

        await supabase
          .from('group_conversation_members')
          .insert(memberInserts);
      }

      toast.success('Group conversation created successfully!');
      await fetchGroupConversations();
      return newGroup.id;
    } catch (err: any) {
      console.error('Error creating group conversation:', err);
      toast.error('Failed to create group conversation');
      return null;
    }
  };

  const addMemberToGroup = async (groupId: string, userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_conversation_members')
        .insert({
          group_conversation_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Member added to group!');
      await fetchGroupConversations();
      return true;
    } catch (err: any) {
      console.error('Error adding member to group:', err);
      toast.error('Failed to add member to group');
      return false;
    }
  };

  const removeMemberFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_conversation_members')
        .delete()
        .eq('group_conversation_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Member removed from group!');
      await fetchGroupConversations();
      return true;
    } catch (err: any) {
      console.error('Error removing member from group:', err);
      toast.error('Failed to remove member from group');
      return false;
    }
  };

  useEffect(() => {
    fetchGroupConversations();
  }, [user]);

  return {
    groupConversations,
    loading,
    error,
    createGroupConversation,
    addMemberToGroup,
    removeMemberFromGroup,
    refetch: fetchGroupConversations
  };
};
