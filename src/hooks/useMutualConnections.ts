/**
 * DNA | CONNECT - Mutual Connections Hook
 *
 * Fetches mutual connections between two users.
 * Implements the CONNECT principle for relationship visibility.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MutualConnection {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  headline?: string | null;
}

/**
 * Hook to get mutual connections between the current user and a target user
 */
export const useMutualConnections = (
  currentUserId: string | undefined,
  targetUserId: string | undefined
) => {
  // Fetch mutual connections list
  const {
    data: connections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mutual-connections', currentUserId, targetUserId],
    queryFn: async (): Promise<MutualConnection[]> => {
      if (!currentUserId || !targetUserId) return [];

      const { data, error } = await supabase.rpc('get_mutual_connections', {
        user1_id: currentUserId,
        user2_id: targetUserId,
      });

      if (error) {
        return [];
      }

      // Map the RPC response to our interface
      return ((data as any[]) || []).map((item) => ({
        user_id: item.id || item.user_id,
        full_name: item.full_name || '',
        username: item.username || '',
        avatar_url: item.avatar_url || null,
        headline: item.headline || null,
      }));
    },
    enabled:
      !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 5 * 60 * 1000,
  });

  // Get count separately for efficiency (uses optimized count function)
  const { data: countData = 0 } = useQuery({
    queryKey: ['mutual-connection-count', currentUserId, targetUserId],
    queryFn: async (): Promise<number> => {
      if (!currentUserId || !targetUserId) return 0;

      const { data, error } = await (supabase.rpc as any)('get_mutual_connection_count', {
        user_a: currentUserId,
        user_b: targetUserId,
      });

      if (error) {
        // Fallback to connections length if count function not available
        return connections.length;
      }

      return typeof data === 'number' ? data : 0;
    },
    enabled:
      !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 5 * 60 * 1000,
  });

  // Ensure count is always a number
  const count = typeof countData === 'number' ? countData : 0;

  return {
    mutualConnections: connections,
    mutualCount: count || connections.length,
    isLoading,
    error,
    hasMutualConnections: (count || connections.length) > 0,
  };
};