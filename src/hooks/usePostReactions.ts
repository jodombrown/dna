import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReactionEmoji } from '@/types/reactions';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationEmail, NOTIFICATION_TYPES } from '@/services/notificationService';

interface ReactionData {
  emoji: ReactionEmoji;
  count: number;
  users: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  }[];
}

interface NotificationContext {
  postAuthorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

export function usePostReactions(postId: string, userId?: string, notificationContext?: NotificationContext) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch reactions for a post with user details
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      // Get all reactions for the post with user info
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          emoji,
          user_id,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId);

      if (error) throw error;

      // Group by emoji and aggregate counts/users
      const grouped = (data || []).reduce((acc, reaction) => {
        const emoji = reaction.emoji;
        if (!acc[emoji]) {
          acc[emoji] = {
            emoji,
            count: 0,
            users: [],
          };
        }
        acc[emoji].count++;
        acc[emoji].users.push({
          user_id: reaction.user_id,
          full_name: (reaction.profiles as any)?.full_name || 'Unknown',
          avatar_url: (reaction.profiles as any)?.avatar_url,
        });
        return acc;
      }, {} as Record<string, ReactionData>);

      return Object.values(grouped).sort((a, b) => b.count - a.count);
    },
    enabled: !!postId,
  });

  // Add reaction
  const addReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: userId, emoji });

      if (error) throw error;

      // Send email notification to post author (if not self-reacting)
      if (notificationContext?.postAuthorId && notificationContext.postAuthorId !== userId) {
        sendNotificationEmail({
          user_id: notificationContext.postAuthorId,
          notification_type: NOTIFICATION_TYPES.REACTION,
          title: 'Someone reacted to your post',
          message: `${notificationContext.actorName || 'Someone'} reacted ${emoji} to your post`,
          action_url: `https://diasporanetwork.africa/dna/convey/post/${postId}`,
          actor_name: notificationContext.actorName,
          actor_avatar_url: notificationContext.actorAvatarUrl,
        }).catch(err => console.error('Failed to send reaction notification email:', err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
    },
    onError: (error: any) => {
      // DNA v1.0 LOCKDOWN: Gentle feedback only
      console.warn('Failed to add reaction:', error);
      toast({
        description: 'Could not add reaction. Please try again.',
        variant: 'default',
      });
    },
  });

  // Remove reaction
  const removeReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
    },
    onError: (error: any) => {
      // DNA v1.0 LOCKDOWN: Gentle feedback only
      console.warn('Failed to remove reaction:', error);
      toast({
        description: 'Could not remove reaction. Please try again.',
        variant: 'default',
      });
    },
  });

  // Calculate totals and current user's reaction
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const currentReaction = reactions.find((r) =>
    r.users.some((u) => u.user_id === userId)
  )?.emoji;

  // Toggle reaction (add if not present, remove if present)
  const toggleReaction = async (emoji: ReactionEmoji) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to react to posts',
        variant: 'destructive',
      });
      return;
    }

    const userHasThisReaction = reactions.find((r) =>
      r.emoji === emoji && r.users.some((u) => u.user_id === userId)
    );
    
    if (userHasThisReaction) {
      await removeReaction.mutateAsync(emoji);
    } else {
      // Remove any existing reaction first
      if (currentReaction && currentReaction !== emoji) {
        await removeReaction.mutateAsync(currentReaction);
      }
      await addReaction.mutateAsync(emoji);
    }
  };

  return {
    reactions,
    totalReactions,
    currentReaction,
    isLoading,
    addReaction: addReaction.mutateAsync,
    removeReaction: removeReaction.mutateAsync,
  };
}
