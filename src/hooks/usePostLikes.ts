import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationEmail, NOTIFICATION_TYPES } from '@/services/notificationService';
import { getPostUrl } from '@/lib/config';
import { diaEventBus } from '@/services/dia/diaEventBus';

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
      // Step 1: Fetch likes (no join - post_likes has no FK to profiles)
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId);

      if (likesError) {
        return {
          likeCount: 0,
          userHasLiked: false,
          likedBy: [] as LikeUser[],
        };
      }

      const rows = likesData || [];
      const likeCount = rows.length;
      const userHasLiked = userId ? rows.some((like) => like.user_id === userId) : false;

      // Step 2: Fetch profile data for likedBy users (separate query)
      let likedBy: LikeUser[] = [];
      if (rows.length > 0) {
        const userIds = rows.map((r) => r.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, headline')
          .in('id', userIds);

        if (profilesData) {
          likedBy = profilesData.map((p) => ({
            user_id: p.id,
            full_name: p.full_name || '',
            username: p.username || '',
            avatar_url: p.avatar_url || undefined,
            headline: p.headline || undefined,
          }));
        }
      }

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
          throw error;
        }
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) {
          const message = (error as { message?: string }).message || '';
          // Treat unique constraint violations as success (idempotent like)
          if (error.code === '23505' || message.includes('duplicate key value')) {
            // Idempotent - like already exists
          } else {
            throw error;
          }
        }

        // Send email notification to post author (if not self-liking)
        if (notificationContext?.postAuthorId && notificationContext.postAuthorId !== userId) {
          sendNotificationEmail({
            user_id: notificationContext.postAuthorId,
            notification_type: NOTIFICATION_TYPES.POST_LIKE,
            title: 'Someone affirmed your post',
            message: `${notificationContext.actorName || 'Someone'} affirmed your post`,
            action_url: getPostUrl(postId),
            actor_name: notificationContext.actorName,
            actor_avatar_url: notificationContext.actorAvatarUrl,
          }).catch(() => {
            // Silently ignore notification email errors
          });
        }
      }
    },
    onSuccess: () => {
      // DIA Sprint 4B: Check for content milestone after a like
      const currentCount = (likeData?.likeCount ?? 0) + 1;
      const milestones: Array<{ count: number; milestone: '10_likes' | '50_likes' | '100_views' }> = [
        { count: 10, milestone: '10_likes' },
        { count: 50, milestone: '50_likes' },
        { count: 100, milestone: '100_views' },
      ];
      const hitMilestone = milestones.find(m => currentCount === m.count);
      if (hitMilestone && notificationContext?.postAuthorId) {
        diaEventBus.emit({
          type: 'content_milestone',
          contentId: postId,
          authorId: notificationContext.postAuthorId,
          milestone: hitMilestone.milestone,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
    },
    onError: () => {
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
