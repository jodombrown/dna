
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export type FollowTargetType = 'user' | 'tag' | 'initiative';

interface FollowState {
  isFollowing: boolean;
  followerCount: number;
  loading: boolean;
}

export const useFollowSystem = (targetType: FollowTargetType, targetId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followState, setFollowState] = useState<FollowState>({
    isFollowing: false,
    followerCount: 0,
    loading: true
  });

  // Check if current user is following the target
  const checkFollowStatus = async () => {
    if (!user || !targetId) {
      setFollowState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Check if user follows this target
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();

      if (followError) throw followError;

      // Get total follower count for this target
      const { count, error: countError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (countError) throw countError;

      setFollowState({
        isFollowing: !!followData,
        followerCount: count || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error checking follow status:', error);
      setFollowState(prev => ({ ...prev, loading: false }));
    }
  };

  // Toggle follow status
  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow content",
        variant: "destructive"
      });
      return;
    }

    if (!targetId) return;

    setFollowState(prev => ({ ...prev, loading: true }));

    try {
      if (followState.isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('target_type', targetType)
          .eq('target_id', targetId);

        if (error) throw error;

        setFollowState(prev => ({
          isFollowing: false,
          followerCount: Math.max(0, prev.followerCount - 1),
          loading: false
        }));

        toast({
          title: "Unfollowed",
          description: `You are no longer following this ${targetType}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            target_type: targetType,
            target_id: targetId
          });

        if (error) throw error;

        setFollowState(prev => ({
          isFollowing: true,
          followerCount: prev.followerCount + 1,
          loading: false
        }));

        toast({
          title: "Following",
          description: `You are now following this ${targetType}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkFollowStatus();
  }, [user, targetType, targetId]);

  return {
    ...followState,
    toggleFollow,
    refreshFollowStatus: checkFollowStatus
  };
};
