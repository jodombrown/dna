import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationEmail, NOTIFICATION_TYPES } from '@/services/notificationService';

interface LikeUser {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  headline?: string;
}
interface NotificationContext {
  postAuthorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

export function usePostLikes(postId: string, userId?: string, notificationContext?: NotificationContext) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch like count and whether current user liked
  const { data: likeData, isLoading } = useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId);

      if (error) {
        console.error('Failed to load post likes:', error);
        return {
          likeCount: 0,
          userHasLiked: false,
          likedBy: [] as LikeUser[],
        };
      }

      const rows = (data || []) as any[];
      const likeCount = rows.length;
      const userHasLiked = userId ? rows.some((like) => like.user_id === userId) : false;
      const likedBy: LikeUser[] = rows.map((like) => ({
        user_id: like.user_id,
        full_name: '',
        username: '',
        avatar_url: undefined,
        headline: undefined,
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

        if (error) {
          console.error('Unlike failed:', error);
          throw error;
        }
      } else {
        // Like - insert with conflict handling
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
          })
          .select()
          .single();

        if (error) {
          const code = (error as any).code || (error as any).details;
          const message = (error as any).message || '';

          // Treat unique constraint violations as success (idempotent like)
          if (code === '23505' || message.includes('duplicate key value')) {
            console.warn('Like already exists, treating as success:', error);
          } else {
            console.error('Like failed:', error);
            throw error;
          }
        }

        // Send email notification to post author (if not self-liking)
        if (notificationContext?.postAuthorId && notificationContext.postAuthorId !== userId) {
          sendNotificationEmail({
            user_id: notificationContext.postAuthorId,
            notification_type: NOTIFICATION_TYPES.POST_LIKE,
            title: 'Someone liked your post',
            message: `${notificationContext.actorName || 'Someone'} liked your post`,
            action_url: `https://diasporanetwork.africa/dna/convey/post/${postId}`,
            actor_name: notificationContext.actorName,
            actor_avatar_url: notificationContext.actorAvatarUrl,
          }).catch(err => console.error('Failed to send like notification email:', err));
        }
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
