/**
 * Post Bookmarks Hook
 * 
 * Manages bookmark state for posts with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function usePostBookmarks(postId: string, userId?: string) {
  const queryClient = useQueryClient();

  // Query for bookmark count
  const { data: bookmarkData } = useQuery({
    queryKey: ['post-bookmarks', postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_bookmarks')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      if (error) {
        return { count: 0 };
      }

      return { count: count || 0 };
    },
  });

  // Query for user's bookmark status
  const { data: userBookmarkData } = useQuery({
    queryKey: ['post-user-bookmarked', postId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { bookmarked: false };
      }

      return { bookmarked: !!data };
    },
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const isCurrentlyBookmarked = userBookmarkData?.bookmarked || false;

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
      } else {
        // Add bookmark (with duplicate handling)
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) {
          // Handle duplicate key error as success (idempotent)
          if (error.code === '23505' || error.message?.includes('duplicate key value')) {
            return;
          }
          throw error;
        }
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['post-bookmarks', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-user-bookmarked', postId, userId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
    },
    onError: () => {
      toast({
        variant: 'default',
        description: 'Could not update bookmark. Please try again.',
      });
    },
  });

  return {
    bookmarkCount: bookmarkData?.count || 0,
    userHasBookmarked: userBookmarkData?.bookmarked || false,
    toggleBookmark: () => toggleBookmarkMutation.mutate(),
    isToggling: toggleBookmarkMutation.isPending,
  };
}
