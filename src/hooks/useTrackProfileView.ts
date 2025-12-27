/**
 * useTrackProfileView Hook
 *
 * Tracks profile views for analytics. Calls the track_profile_view RPC function
 * to record views and update the view counter.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseTrackProfileViewOptions {
  profileId: string | undefined;
  enabled?: boolean;
}

export const useTrackProfileView = ({
  profileId,
  enabled = true,
}: UseTrackProfileViewOptions) => {
  const { user } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load, and only if enabled and profileId exists
    if (!enabled || !profileId || hasTracked.current) {
      return;
    }

    // Don't track owner viewing their own profile
    if (user?.id === profileId) {
      return;
    }

    const trackView = async () => {
      try {
        await supabase.rpc('track_profile_view', {
          p_profile_id: profileId,
          p_viewer_id: user?.id || null,
          p_referrer: document.referrer || null,
          p_user_agent: navigator.userAgent || null,
        });
        hasTracked.current = true;
      } catch (error) {
        // Silently fail - analytics shouldn't break the user experience
        console.debug('Failed to track profile view:', error);
      }
    };

    // Small delay to avoid tracking on rapid navigation
    const timeoutId = setTimeout(trackView, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [profileId, user?.id, enabled]);
};

export default useTrackProfileView;
