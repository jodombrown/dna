import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileViewTrackerProps {
  profileId: string;
  viewType?: string;
}

/**
 * ProfileViewTracker - Automatically tracks profile views
 *
 * Records when users view profiles with:
 * - Spam prevention (max 1 view per hour)
 * - Notifications (first view of the day)
 * - Own profile exclusion
 */
export const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({
  profileId,
  viewType = 'profile_page'
}) => {
  const { user } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current) return;

    const trackView = async () => {
      // Don't track if viewing own profile or not logged in
      if (!user || user.id === profileId) return;

      try {
        // Use new record_profile_view function with notifications
        const { error } = await supabase.rpc('record_profile_view', {
          p_viewer_id: user.id,
          p_profile_id: profileId,
        });

        if (error) {
          console.warn('Failed to record profile view:', error);
          return;
        }

        hasTracked.current = true;
      } catch (err) {
        console.warn('Error tracking profile view:', err);
      }
    };

    // Track after a short delay to ensure user actually landed on page
    const timer = setTimeout(trackView, 2000);

    return () => clearTimeout(timer);
  }, [profileId, user]);

  return null;
};