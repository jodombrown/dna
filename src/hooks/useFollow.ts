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
import { queryKeys } from '@/lib/queryClient';

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
    queryKey: queryKeys.profile.counts.follow(targetUserId),
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

        // follower_count/following_count on profiles are maintained
        // atomically by the sync_follow_counts DB trigger on user_follows
        // (see migration 20260807150000) — writing them from the client
        // here was a racy read-modify-write that could lose increments
        // under concurrent follow/unfollow actions, with errors silently
        // swallowed. onSettled below refetches the authoritative counts.
      } else {
        const { error } = await db
          .from('user_follows')
          .insert({ follower_id: user.id, followed_id: targetUserId });
        if (error) throw error;
      }
    },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['follow-state', user?.id, targetUserId] });
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.counts.follow(targetUserId) });

      const prevFollowState = queryClient.getQueryData(['follow-state', user?.id, targetUserId]);
      const prevCounts = queryClient.getQueryData(queryKeys.profile.counts.follow(targetUserId));

      const isCurrentlyFollowing = followState?.isFollowing || false;

      queryClient.setQueryData(['follow-state', user?.id, targetUserId], {
        isFollowing: !isCurrentlyFollowing,
      });

      queryClient.setQueryData(queryKeys.profile.counts.follow(targetUserId), {
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
        queryClient.setQueryData(queryKeys.profile.counts.follow(targetUserId), context.prevCounts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-state', user?.id, targetUserId] });
      // Parent namespace, not the target's leaf: a follow toggle moves the
      // target's follower_count AND the actor's following_count, and the
      // leaf-only invalidation left the actor's own tally stale.
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.counts.all });
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
