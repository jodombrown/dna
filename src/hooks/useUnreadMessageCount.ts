import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';

/**
 * useUnreadMessageCount - Hook to fetch the count of unread messages
 * 
 * Uses the messageService to count unread messages directly from the database.
 * 
 * @returns Query result with unread message count
 */
export function useUnreadMessageCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      return messageService.getTotalUnreadCount();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
