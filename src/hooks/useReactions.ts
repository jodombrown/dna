import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Reaction = Tables<'reactions'>;
type ReactionType = 'like' | 'support' | 'join' | 'celebrate' | 'insightful';

interface ReactionCount {
  type: ReactionType;
  count: number;
}

export const useReactions = (postId: string) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;

      setReactions(data || []);

      // Check if current user has reacted
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userReactionData = (data || []).find(r => r.user_id === user.id);
        setUserReaction(userReactionData?.type as ReactionType || null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (type: ReactionType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to react to posts.",
          variant: "destructive"
        });
        return;
      }

      // If user already has this reaction, remove it
      if (userReaction === type) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', type);

        if (error) throw error;
        setUserReaction(null);
      } else {
        // Remove any existing reaction first
        if (userReaction) {
          await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }

        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type
          });

        if (error) throw error;
        setUserReaction(type);
      }

      await fetchReactions();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive"
      });
    }
  };

  const getReactionCounts = (): ReactionCount[] => {
    const counts: { [key in ReactionType]: number } = {
      like: 0,
      support: 0,
      join: 0,
      celebrate: 0,
      insightful: 0
    };

    reactions.forEach(reaction => {
      if (reaction.type && counts.hasOwnProperty(reaction.type)) {
        counts[reaction.type as ReactionType]++;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ReactionType,
        count
      }));
  };

  const getEngagementScore = (): number => {
    const scores = {
      like: 1,
      support: 2,
      join: 5,
      celebrate: 2,
      insightful: 3
    };

    return reactions.reduce((total, reaction) => {
      return total + (scores[reaction.type as ReactionType] || 0);
    }, 0);
  };

  useEffect(() => {
    if (postId) {
      fetchReactions();
    }
  }, [postId]);

  return {
    reactions,
    userReaction,
    loading,
    toggleReaction,
    getReactionCounts,
    getEngagementScore,
    refreshReactions: fetchReactions
  };
};