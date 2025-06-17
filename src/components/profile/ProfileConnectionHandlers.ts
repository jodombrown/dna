
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfileConnectionHandlers = (profile: any, isOwnProfile: boolean) => {
  const { toast } = useToast();

  const checkFollowingStatus = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      const { data } = await supabase
        .from('user_connections')
        .select('id')
        .eq('follower_id', currentUser.user.id)
        .eq('following_id', profile.id)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const handleFollow = async (isFollowing: boolean, setIsFollowing: (value: boolean) => void, setLoading: (value: boolean) => void) => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_connections')
          .delete()
          .eq('follower_id', currentUser.user.id)
          .eq('following_id', profile.id);

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You're no longer following ${profile.full_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('user_connections')
          .insert({
            follower_id: currentUser.user.id,
            following_id: profile.id
          });

        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${profile.full_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    checkFollowingStatus,
    handleFollow,
  };
};
