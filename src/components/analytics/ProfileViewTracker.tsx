import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileViewTrackerProps {
  profileId: string;
  viewType?: string;
}

export const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({ 
  profileId, 
  viewType = 'profile_page' 
}) => {
  const { user } = useAuth();

  useEffect(() => {
    const logView = async () => {
      if (!user || user.id === profileId) return;

      try {
        await supabase.rpc('log_profile_view', {
          p_profile_id: profileId,
          p_view_type: viewType
        });
      } catch (error) {
        console.error('Error logging profile view:', error);
      }
    };

    logView();
  }, [profileId, viewType, user]);

  return null;
};