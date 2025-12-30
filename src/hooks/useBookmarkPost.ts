/**
 * DNA | FEED - Post Bookmarks Hook
 * 
 * Manages bookmarking and unbookmarking posts.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBookmarkPost = (postId: string, viewerId: string, initialBookmarked: boolean) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async (bookmark: boolean) => {
      if (bookmark) {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: viewerId,
          });

        if (error) throw error;
      } else {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', viewerId);

        if (error) throw error;
      }
    },
    onMutate: async (bookmark) => {
      // Optimistic update
      setIsBookmarked(bookmark);
    },
    onSuccess: (_, bookmark) => {
      // Invalidate feed queries to refresh bookmark counts
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['post-bookmark'] });
      
      toast.success(bookmark ? 'Post saved' : 'Bookmark removed');
    },
    onError: (error, bookmark) => {
      // Rollback on error
      setIsBookmarked(!bookmark);
      toast.error('Failed to update bookmark');
    },
  });

  const toggleBookmark = () => {
    bookmarkMutation.mutate(!isBookmarked);
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading: bookmarkMutation.isPending,
  };
};
