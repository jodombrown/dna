import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReactionEmoji } from '@/types/reactions';

interface CommentReactionData {
  emoji: ReactionEmoji;
  count: number;
}

export function useCommentReactions(commentId: string, userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comment-reactions', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('emoji, user_id')
        .eq('comment_id', commentId);

      if (error) throw error;

      // Aggregate reactions by emoji
      const reactionMap = new Map<string, { count: number; hasUserReacted: boolean }>();
      
      data?.forEach((reaction) => {
        const existing = reactionMap.get(reaction.emoji) || { count: 0, hasUserReacted: false };
        reactionMap.set(reaction.emoji, {
          count: existing.count + 1,
          hasUserReacted: existing.hasUserReacted || reaction.user_id === userId,
        });
      });

      return {
        reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
          emoji,
          count: data.count,
        })),
        userReaction: data?.find((r) => r.user_id === userId)?.emoji || null,
        totalCount: data?.length || 0,
      };
    },
    enabled: !!commentId,
  });

  const addReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase.from('comment_reactions').insert({
        comment_id: commentId,
        user_id: userId,
        emoji,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-reactions', commentId] });
    },
    onError: (error) => {
      toast.error('Failed to add reaction');
    },
  });

  const removeReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-reactions', commentId] });
    },
    onError: (error) => {
      toast.error('Failed to remove reaction');
    },
  });

  const toggleReaction = async (emoji: ReactionEmoji) => {
    if (data?.userReaction === emoji) {
      await removeReaction.mutateAsync(emoji);
    } else {
      // Remove existing reaction first if switching
      if (data?.userReaction) {
        await removeReaction.mutateAsync(data.userReaction);
      }
      await addReaction.mutateAsync(emoji);
    }
  };

  return {
    reactions: data?.reactions || [],
    userReaction: data?.userReaction,
    totalCount: data?.totalCount || 0,
    isLoading,
    toggleReaction,
  };
}
