import { useQuery } from '@tanstack/react-query';
import { connectionService } from '@/services/connectionService';
import type { ConnectionStatus } from '@/types/connections';

/**
 * useConnectionStatus - Hook to check connection status with another user
 * 
 * Returns the current connection status between the authenticated user and a target user.
 * Status can be: 'none', 'pending_sent', 'pending_received', 'accepted', 'declined'
 * 
 * @param userId - The ID of the user to check connection status with
 * @returns Query result with connection status
 */
export function useConnectionStatus(userId: string | null | undefined) {
  return useQuery<ConnectionStatus>({
    queryKey: ['connection-status', userId],
    queryFn: async () => {
      if (!userId) return 'none';
      return connectionService.getConnectionStatus(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
  });
}
