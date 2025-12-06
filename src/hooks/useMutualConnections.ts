import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MutualConnection {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
}

export const useMutualConnections = (userId1: string | undefined, userId2: string | undefined) => {
  return useQuery({
    queryKey: ['mutual-connections', userId1, userId2],
    queryFn: async () => {
      if (!userId1 || !userId2) return [];

      const { data, error } = await supabase.rpc('get_mutual_connections', {
        user1_id: userId1,
        user2_id: userId2,
      });

      if (error) {
        console.error('Error fetching mutual connections:', error);
        throw error;
      }

      return (data as MutualConnection[]) || [];
    },
    enabled: !!userId1 && !!userId2 && userId1 !== userId2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
