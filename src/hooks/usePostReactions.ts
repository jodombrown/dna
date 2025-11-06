import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReactionEmoji } from '@/types/reactions';
import { useToast } from '@/hooks/use-toast';

interface ReactionData {
  emoji: ReactionEmoji;
  count: number;
  users: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  }[];
}

export function usePostReactions(postId: string, userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reactions for a post
  const { data: reactions = [], refetch } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
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

      // Group reactions by emoji
      const grouped = (data || []).reduce((acc: Record<string, ReactionData>, item: any) => {
        const emoji = item.emoji as ReactionEmoji;
        if (!acc[emoji]) {
          acc[emoji] = {
            emoji,
            count: 0,
            users: [],
          };
        }
        acc[emoji].count++;
        acc[emoji].users.push({
          user_id: item.user_id,
          full_name: item.profiles?.full_name || 'Unknown',
          avatar_url: item.profiles?.avatar_url,
        });
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => b.count - a.count);
    },
    enabled: !!postId,
  });

  // Get user's current reaction
  const userReaction = reactions
    .flatMap((r) => r.users)
    .find((u) => u.user_id === userId);

  const currentReaction = userReaction
    ? reactions.find((r) => r.users.some((u) => u.user_id === userId))?.emoji
    : null;

  // Add or update reaction
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Not authenticated');

      // First, remove any existing reaction from this user
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Then add the new reaction
      const { error } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          emoji,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
      refetch();
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    },
  });

  // Remove reaction
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
      refetch();
    },
    onError: (error) => {
      console.error('Error removing reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    },
  });

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return {
    reactions,
    totalReactions,
    currentReaction,
    addReaction: addReactionMutation.mutate,
    removeReaction: removeReactionMutation.mutate,
    isLoading: addReactionMutation.isPending || removeReactionMutation.isPending,
  };
}
