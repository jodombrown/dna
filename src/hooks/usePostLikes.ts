import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LikeUser {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  headline?: string;
}

export function usePostLikes(postId: string, userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch like count and whether current user liked
  const { data: likeData, isLoading } = useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          user_id,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            headline
          )
        `)
        .eq('post_id', postId);

      if (error) throw error;

      const likeCount = data?.length || 0;
      const userHasLiked = userId ? data?.some((like) => like.user_id === userId) : false;
      const likedBy: LikeUser[] = (data || []).map((like: any) => ({
        user_id: like.user_id,
        full_name: like.profiles?.full_name || 'Unknown',
        username: like.profiles?.username || '',
        avatar_url: like.profiles?.avatar_url,
        headline: like.profiles?.headline,
      }));

      return {
        likeCount,
        userHasLiked,
        likedBy,
      };
    },
    enabled: !!postId,
  });

  // Toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      if (likeData?.userHasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Like - using insert, duplicate will be handled by RLS
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
    },
    onError: (error) => {
      // DNA v1.0 LOCKDOWN: Gentle feedback only, no red banners
      console.warn('Failed to update like:', error);
      toast({
        description: 'Could not update like. Please try again.',
        variant: 'default',
      });
    },
  });

  return {
    likeCount: likeData?.likeCount || 0,
    userHasLiked: likeData?.userHasLiked || false,
    likedBy: likeData?.likedBy || [],
    toggleLike: toggleLikeMutation.mutate,
    isLoading: toggleLikeMutation.isPending,
  };
}
