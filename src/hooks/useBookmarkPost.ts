/**
 * DNA | FEED v1.1 - Post Bookmark Hook
 * 
 * Manages bookmark/unbookmark operations for feed posts.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFeedTracking } from './useFeedTracking';

export function useBookmarkPost() {
  const queryClient = useQueryClient();
  const { trackFeedEvent } = useFeedTracking();

  const bookmarkMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      const { error } = await supabase
        .from('post_bookmarks')
        .insert({
          user_id: userId,
          post_id: postId,
          folder: 'default',
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success('Post bookmarked');
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      
      trackFeedEvent({
        postId: variables.postId,
        postType: 'post', // We don't have full context here, but track the action
        action: 'bookmark',
        surface: 'home', // Default, could be passed in
      });
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast.error('Failed to bookmark post');
    },
  });

  const unbookmarkMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success('Bookmark removed');
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      
      trackFeedEvent({
        postId: variables.postId,
        postType: 'post',
        action: 'unbookmark',
        surface: 'home',
      });
    },
    onError: (error) => {
      console.error('Unbookmark error:', error);
      toast.error('Failed to remove bookmark');
    },
  });

  return {
    bookmarkPost: bookmarkMutation.mutate,
    unbookmarkPost: unbookmarkMutation.mutate,
    isBookmarking: bookmarkMutation.isPending,
    isUnbookmarking: unbookmarkMutation.isPending,
  };
}
