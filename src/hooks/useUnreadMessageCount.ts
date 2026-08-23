import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { queryKeys } from '@/lib/queryClient';

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
    queryKey: queryKeys.messages.counts.unread(user?.id),
    queryFn: async () => {
      if (!user) return 0;
      return messageService.getTotalUnreadCount();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
