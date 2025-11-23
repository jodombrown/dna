import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePostBookmark(postId: string, userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if post is bookmarked
  const { data: isBookmarked = false, refetch } = useQuery({
    queryKey: ['post-bookmark', postId, userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!userId && !!postId,
  });

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
      refetch();
      
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Post saved',
        description: isBookmarked 
          ? 'Removed from your saved posts' 
          : 'Added to your saved posts',
      });
    },
    onError: (error) => {
      // TRUST-FIRST: Silent log, gentle message
      console.warn('Failed to update bookmark:', error);
      toast({
        description: 'Could not update bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    isBookmarked,
    toggleBookmark: toggleBookmarkMutation.mutate,
    isLoading: toggleBookmarkMutation.isPending,
  };
}
