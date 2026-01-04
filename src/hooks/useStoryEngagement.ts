/**
 * DNA | CONVEY - Story Engagement Hook
 * 
 * Comprehensive hook for story engagement:
 * - Reactions (emoji-based)
 * - Comments (count)
 * - Views (tracking + count)
 * - Bookmarks (save/unsave)
 */

import { useEffect, useRef, useState } from 'react';
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

interface StoryEngagementData {
  reactions: ReactionData[];
  totalReactions: number;
  currentReaction?: ReactionEmoji;
  commentCount: number;
  viewCount: number;
  isBookmarked: boolean;
  isLoading: boolean;
}

export function useStoryEngagement(storyId: string, userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch reactions for the story
  const { data: reactionsData = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ['story-reactions', storyId],
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
        .eq('post_id', storyId);

      if (error) throw error;

      // Group by emoji
      const grouped = (data || []).reduce((acc, reaction) => {
        const emoji = reaction.emoji as ReactionEmoji;
        if (!acc[emoji]) {
          acc[emoji] = { emoji, count: 0, users: [] };
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
    enabled: !!storyId,
  });

  // Fetch comment count
  const { data: commentCount = 0 } = useQuery({
    queryKey: ['story-comments-count', storyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact' })
        .eq('post_id', storyId)
        .eq('is_deleted', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!storyId,
  });

  // Fetch view count
  const { data: viewCount = 0 } = useQuery({
    queryKey: ['story-views-count', storyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_views')
        .select('id', { count: 'exact' })
        .eq('post_id', storyId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!storyId,
  });

  // Check if user has bookmarked
  const { data: isBookmarked = false, isLoading: bookmarkLoading } = useQuery({
    queryKey: ['story-bookmark', storyId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', storyId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!storyId && !!userId,
  });

  // Add reaction mutation
  const addReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_reactions')
        .insert({ post_id: storyId, user_id: userId, emoji });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-reactions', storyId] });
    },
    onError: (error) => {
      toast({ description: 'Could not add reaction. Please try again.' });
    },
  });

  // Remove reaction mutation
  const removeReaction = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', storyId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-reactions', storyId] });
    },
    onError: (error) => {
      toast({ description: 'Could not remove reaction. Please try again.' });
    },
  });

  // Toggle bookmark mutation
  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');

      if (isBookmarked) {
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', storyId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({ post_id: storyId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-bookmark', storyId, userId] });
      toast({
        description: isBookmarked ? 'Story removed from bookmarks' : 'Story saved to bookmarks',
      });
    },
    onError: (error) => {
      toast({ description: 'Could not update bookmark. Please try again.' });
    },
  });

  // Calculate current user's reaction
  const totalReactions = reactionsData.reduce((sum, r) => sum + r.count, 0);
  const currentReaction = reactionsData.find((r) =>
    r.users.some((u) => u.user_id === userId)
  )?.emoji;

  // Toggle reaction helper
  const toggleReaction = async (emoji: ReactionEmoji) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to react to stories',
      });
      return;
    }

    const hasThisReaction = reactionsData.find(
      (r) => r.emoji === emoji && r.users.some((u) => u.user_id === userId)
    );

    if (hasThisReaction) {
      await removeReaction.mutateAsync(emoji);
    } else {
      // Remove existing reaction first
      if (currentReaction && currentReaction !== emoji) {
        await removeReaction.mutateAsync(currentReaction);
      }
      await addReaction.mutateAsync(emoji);
    }
  };

  return {
    reactions: reactionsData,
    totalReactions,
    currentReaction,
    commentCount,
    viewCount,
    isBookmarked,
    isLoading: reactionsLoading || bookmarkLoading,
    toggleReaction,
    toggleBookmark: toggleBookmark.mutateAsync,
    isTogglingBookmark: toggleBookmark.isPending,
  };
}

/**
 * Track story view when element becomes visible
 */
export function useStoryViewTracker(storyId: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!storyId || sent) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !sent) {
          setSent(true);
          try {
            await supabase.rpc('log_post_view', { p_post_id: storyId });
          } catch (err) {
            // Silently ignore view tracking errors
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [storyId, sent]);

  return ref;
}
