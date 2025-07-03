
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFollowSystem } from '@/hooks/useFollowSystem';

export const useProfileConnectionHandlers = (profile: any, isOwnProfile: boolean) => {
  const { toast } = useToast();
  const followSystem = useFollowSystem('user', profile?.id || '');

  const checkFollowingStatus = async () => {
    // Use the new follow system's status
    return followSystem.isFollowing;
  };

  const handleFollow = async (isFollowing: boolean, setIsFollowing: (value: boolean) => void, setLoading: (value: boolean) => void) => {
    // Use the new follow system's toggle function
    await followSystem.toggleFollow();
    
    // Update the local state to match the follow system
    setIsFollowing(followSystem.isFollowing);
    setLoading(false);
  };

  return {
    checkFollowingStatus,
    handleFollow,
    followSystem // Expose the follow system for direct access
  };
};
