import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePostBookmark(postId: string, userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if post is bookmarked and if it's pinned
  const { data: bookmarkData, refetch } = useQuery({
    queryKey: ['post-bookmark', postId, userId],
    queryFn: async () => {
      if (!userId) return { isBookmarked: false, isPinned: false };

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('id, pinned_at')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return {
        isBookmarked: !!data,
        isPinned: !!data?.pinned_at,
      };
    },
    enabled: !!userId && !!postId,
  });

  const isBookmarked = bookmarkData?.isBookmarked ?? false;
  const isPinned = bookmarkData?.isPinned ?? false;

  // Toggle bookmark
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-bookmark', postId, userId] });
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks', userId] });
      queryClient.invalidateQueries({ queryKey: ['pinned-bookmarks', userId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      refetch();
      
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Post saved',
        description: isBookmarked 
          ? 'Removed from your saved posts' 
          : 'Added to your saved posts',
      });
    },
    onError: (error) => {
      console.warn('Failed to update bookmark:', error);
      toast({
        description: 'Could not update bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle pin on bookmark
  const togglePinMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      if (!isBookmarked) throw new Error('Post is not bookmarked');

      const { error } = await supabase
        .from('post_bookmarks')
        .update({ pinned_at: isPinned ? null : new Date().toISOString() })
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-bookmark', postId, userId] });
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks', userId] });
      queryClient.invalidateQueries({ queryKey: ['pinned-bookmarks', userId] });
      refetch();
      
      toast({
        title: isPinned ? 'Unpinned' : 'Pinned',
        description: isPinned 
          ? 'Removed from pinned saved items' 
          : 'Added to pinned saved items',
      });
    },
    onError: (error) => {
      console.warn('Failed to update pin:', error);
      toast({
        description: 'Could not update pin. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    isBookmarked,
    isPinned,
    toggleBookmark: toggleBookmarkMutation.mutate,
    togglePin: togglePinMutation.mutate,
    isLoading: toggleBookmarkMutation.isPending,
    isPinLoading: togglePinMutation.isPending,
  };
}
