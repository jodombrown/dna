/**
 * DNA Profile v2 Hook
 * Fetches and manages Profile v2 bundle data
 * BULLETPROOF: Never throws errors - always returns null on failure
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

      try {
        const { data, error } = await supabase.rpc('rpc_get_profile_bundle', {
          p_username: username,
          p_viewer_id: user?.id || null,
        });

        // Return null on error - NEVER throw to avoid ErrorBoundary
        if (error) {
          console.warn('Profile bundle fetch error:', error.message);
          return null;
        }

        return data as unknown as ProfileV2Bundle;
      } catch (err) {
        // Catch any unexpected errors - NEVER throw
        console.warn('Profile bundle unexpected error:', err);
        return null;
      }
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Only retry once
    throwOnError: false, // Never throw to React Query error boundary
  });
};
