/**
 * DNA Profile v2 Hook
 * Fetches and manages Profile v2 bundle data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileV2Bundle } from '@/types/profileV2';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileV2 = (username: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile-v2', username, user?.id],
    queryFn: async (): Promise<ProfileV2Bundle | null> => {
      if (!username) return null;

      const { data, error } = await supabase.rpc('rpc_get_profile_bundle', {
        p_username: username,
        p_viewer_id: user?.id || null,
      });

      if (error) {
        console.error('Error fetching profile bundle:', error);
        throw error;
      }

      return data as unknown as ProfileV2Bundle;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
