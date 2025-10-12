import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * useUnreadMessageCount - Hook to fetch the count of unread messages
 * 
 * Counts messages in conversations where:
 * - User is a participant (user_a or user_b)
 * - Message is not from the current user
 * - Message is unread (read = false)
 * 
 * @returns Query result with unread message count
 */
export function useUnreadMessageCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // Get all conversations where user is a participant
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

      if (convError) {
        console.error('Error fetching conversations:', convError);
        return 0;
      }

      if (!conversations || conversations.length === 0) {
        return 0;
      }

      const conversationIds = conversations.map(c => c.id);

      // Count unread messages in these conversations
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error counting unread messages:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
