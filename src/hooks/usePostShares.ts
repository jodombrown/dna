import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/** Typed Supabase error for mutation handlers */
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

export function usePostShares(postId: string, userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch share count
  const { data: shareCount = 0, isLoading } = useQuery({
    queryKey: ['post-shares', postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_shares')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!postId,
  });

  // Check if user has shared
  const { data: userHasShared = false } = useQuery({
    queryKey: ['post-share-status', postId, userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!postId && !!userId,
  });

  // Share post
  const sharePost = useMutation({
    mutationFn: async (commentary?: string) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase.from('post_shares').insert({
        post_id: postId,
        user_id: userId,
        share_commentary: commentary || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-shares', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-share-status', postId, userId] });
      toast({
        title: 'Post shared',
        description: 'You shared this post to your network',
      });
    },
    onError: (error: SupabaseError) => {
      toast({
        title: 'Failed to share post',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  // Unshare post
  const unsharePost = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_shares')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-shares', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-share-status', postId, userId] });
      toast({
        title: 'Share removed',
        description: 'This post was removed from your shares',
      });
    },
    onError: (error: SupabaseError) => {
      toast({
        title: 'Failed to remove share',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    shareCount,
    userHasShared,
    sharePost: sharePost.mutateAsync,
    unsharePost: unsharePost.mutateAsync,
    isLoading,
    isSharing: sharePost.isPending,
  };
}
