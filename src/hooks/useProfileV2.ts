/**
 * useProfileV2 - View Other Users' Profiles
 *
 * Use this hook to fetch a profile bundle by username for viewing.
 * Includes viewer context for personalized data (e.g., connection status).
 *
 * For the current user's OWN profile, use useProfile instead.
 *
 * BULLETPROOF: Never throws errors - always returns null on failure
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileV2Bundle } from '@/types/profileV2';
import { useAuth } from '@/contexts/AuthContext';
import { STALE_TIMES } from '@/lib/queryClient';

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
          return null;
        }

        return data as unknown as ProfileV2Bundle;
      } catch {
        // Catch any unexpected errors - NEVER throw
        return null;
      }
    },
    enabled: !!username,
    staleTime: STALE_TIMES.profile,
    retry: 1, // Only retry once
    throwOnError: false, // Never throw to React Query error boundary
  });
};
