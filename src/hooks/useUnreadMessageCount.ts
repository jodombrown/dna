import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * useUnreadMessageCount - Hook to fetch the count of unread messages
 * 
 * Uses the get_total_unread_count RPC function which counts messages based on:
 * - Messages created after user's last_read_at timestamp in conversation_participants
 * - Messages not sent by the current user
 * - Non-deleted messages
 * 
 * @returns Query result with unread message count
 */
export function useUnreadMessageCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
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
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
