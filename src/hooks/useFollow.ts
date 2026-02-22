/**
 * useFollow - Sprint 12D.2
 *
 * Hook for managing follow/unfollow state between users.
 * Returns follow state, counts, and toggle function with optimistic updates.
 * Uses `db` bypass for user_follows (not yet in generated types).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface UseFollowResult {
  isFollowing: boolean;
  isLoading: boolean;
  isToggling: boolean;
  followerCount: number;
  followingCount: number;
  toggleFollow: () => void;
}

export function useFollow(targetUserId: string | undefined): UseFollowResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user follows target
  const { data: followState, isLoading } = useQuery({
    queryKey: ['follow-state', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) {
        return { isFollowing: false };
      }

      const { data, error } = await db
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', targetUserId)
        .maybeSingle();

      return { isFollowing: !error && !!data };
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
    staleTime: 30000,
  });

  // Fetch follower/following counts for target user
  const { data: counts } = useQuery({
    queryKey: ['follow-counts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return { followerCount: 0, followingCount: 0 };

      const { data: profile } = await db
        .from('profiles')
        .select('follower_count, following_count')
        .eq('id', targetUserId)
        .single();

      return {
        followerCount: profile?.follower_count ?? 0,
        followingCount: profile?.following_count ?? 0,
      };
    },
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  // Toggle follow/unfollow
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) {
        throw new Error('Invalid follow operation');
      }

      const isCurrentlyFollowing = followState?.isFollowing || false;

      if (isCurrentlyFollowing) {
        const { error } = await db
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetUserId);
        if (error) throw error;

        // Update counts
        await Promise.all([
          db.from('profiles').update({ follower_count: Math.max((counts?.followerCount || 1) - 1, 0) }).eq('id', targetUserId),
          db.from('profiles').update({ following_count: Math.max((counts?.followingCount || 1) - 1, 0) }).eq('id', user.id),
        ]).catch(() => {});
      } else {
        const { error } = await db
          .from('user_follows')
          .insert({ follower_id: user.id, followed_id: targetUserId });
        if (error) throw error;

        // Update counts
        await Promise.all([
          db.from('profiles').update({ follower_count: (counts?.followerCount || 0) + 1 }).eq('id', targetUserId),
          db.from('profiles').update({ following_count: (counts?.followingCount || 0) + 1 }).eq('id', user.id),
        ]).catch(() => {});
      }
    },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['follow-state', user?.id, targetUserId] });
      await queryClient.cancelQueries({ queryKey: ['follow-counts', targetUserId] });

      const prevFollowState = queryClient.getQueryData(['follow-state', user?.id, targetUserId]);
      const prevCounts = queryClient.getQueryData(['follow-counts', targetUserId]);

      const isCurrentlyFollowing = followState?.isFollowing || false;

      queryClient.setQueryData(['follow-state', user?.id, targetUserId], {
        isFollowing: !isCurrentlyFollowing,
      });

      queryClient.setQueryData(['follow-counts', targetUserId], {
        followerCount: (counts?.followerCount || 0) + (isCurrentlyFollowing ? -1 : 1),
        followingCount: counts?.followingCount || 0,
      });

      return { prevFollowState, prevCounts };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevFollowState) {
        queryClient.setQueryData(['follow-state', user?.id, targetUserId], context.prevFollowState);
      }
      if (context?.prevCounts) {
        queryClient.setQueryData(['follow-counts', targetUserId], context.prevCounts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-state', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts', targetUserId] });
    },
  });

  return {
    isFollowing: followState?.isFollowing || false,
    isLoading,
    isToggling: toggleMutation.isPending,
    followerCount: counts?.followerCount || 0,
    followingCount: counts?.followingCount || 0,
    toggleFollow: () => toggleMutation.mutate(),
  };
}
