import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileViewer } from '@/types/analytics';

/**
 * useProfileViewers - Hook to fetch who viewed the user's profile
 * 
 * Returns detailed information about profile viewers including:
 * - Viewer profile details (username, name, avatar, headline)
 * - View count and last viewed timestamp
 * - Connection status with the viewer
 * 
 * @param profileId - The ID of the profile to get viewers for
 * @returns Query result with profile viewers data
 */
export function useProfileViewers(profileId: string | null | undefined) {
  return useQuery<ProfileViewer[]>({
    queryKey: ['profile-viewers', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase.rpc('get_profile_viewers', {
        p_profile_id: profileId,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) {
        console.error('Error fetching profile viewers:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profileId,
    staleTime: 30000, // Cache for 30 seconds
  });
}
