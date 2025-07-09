import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { AdinService } from '@/services/adinService';

type Post = Tables<'posts'> & {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    profession: string | null;
    display_name: string | null;
  };
  adin_score?: number;
  adin_signals?: string[];
};

interface FeedOptions {
  pillarFilter?: 'connect' | 'collaborate' | 'contribute';
  enableAdinRanking?: boolean;
  userInterests?: string[];
  advancedFilters?: any;
}

export const useAdinFeed = (options: FeedOptions = {}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { pillarFilter, enableAdinRanking = true, advancedFilters } = options;

  const calculateAdinScore = async (post: Post, userContext: any): Promise<number> => {
    if (!user || !userContext) return 0.5; // Default score

    let score = 0.5; // Base score

    // Interest alignment (0.2 weight)
    if (userContext.interests && post.content) {
      const contentLower = post.content.toLowerCase();
      const matchingInterests = userContext.interests.filter((interest: string) => 
        contentLower.includes(interest.toLowerCase())
      );
      score += (matchingInterests.length / Math.max(userContext.interests.length, 1)) * 0.2;
    }

    // Pillar preference (0.3 weight)
    if (userContext.engagement_pillars?.includes(post.pillar)) {
      score += 0.3;
    }

    // Recency boost (0.2 weight)
    const postAge = Date.now() - new Date(post.created_at!).getTime();
    const hoursAge = postAge / (1000 * 60 * 60);
    if (hoursAge < 24) {
      score += (24 - hoursAge) / 24 * 0.2;
    }

    // Author relationship signals (0.3 weight)
    try {
      const { data: connectionSignals } = await supabase
        .from('adin_connection_signals')
        .select('score')
        .or(`source_user.eq.${user.id},target_user.eq.${user.id}`)
        .or(`source_user.eq.${post.author_id},target_user.eq.${post.author_id}`)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (connectionSignals && connectionSignals.length > 0) {
        score += connectionSignals[0].score * 0.3;
      }
    } catch (error) {
      console.error('Error calculating connection signals:', error);
    }

    return Math.min(1.0, score); // Cap at 1.0
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user context for ADIN ranking
      const userContext = user ? await AdinService.getUserContext(user.id) : null;

      // Build posts query
      let query = supabase
        .from('posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      // Apply pillar filter if specified
      if (pillarFilter) {
        query = query.eq('pillar', pillarFilter);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        throw postsError;
      }

      // Get unique author IDs
      const authorIds = [...new Set(postsData?.map(post => post.author_id).filter(Boolean) || [])];
      
      // Fetch author profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, profession, display_name')
        .in('id', authorIds);

      if (profilesError) {
        console.warn('Error fetching author profiles:', profilesError);
      }

      // Create a map of profiles by ID
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // Combine posts with author data and calculate ADIN scores
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const postWithAuthor = {
            ...post,
            author: post.author_id ? profileMap.get(post.author_id) : null
          };

          if (enableAdinRanking && userContext) {
            const adinScore = await calculateAdinScore(postWithAuthor, userContext);
            return {
              ...postWithAuthor,
              adin_score: adinScore,
              adin_signals: ['interest_match', 'pillar_preference', 'recency'] // Demo signals
            };
          }

          return postWithAuthor;
        })
      );

      // Sort by ADIN score if enabled, otherwise by creation time
      if (enableAdinRanking) {
        postsWithAuthors.sort((a, b) => {
          const aScore = (a as Post).adin_score || 0;
          const bScore = (b as Post).adin_score || 0;
          return bScore - aScore;
        });
      }

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching posts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      toast({
        title: "Error Loading Feed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = () => {
    fetchPosts();
  };

  const handlePostInteraction = async (postId: string, interactionType: 'like' | 'comment' | 'share') => {
    if (!user) return;

    try {
      // Create connection signal for post interaction
      const post = posts.find(p => p.id === postId);
      if (post && post.author_id && post.author_id !== user.id) {
        await AdinService.createConnectionSignal(
          user.id,
          post.author_id,
          `post_${interactionType}`,
          0.1 + (interactionType === 'comment' ? 0.1 : 0), // Comments worth more
          { post_id: postId, pillar: post.pillar }
        );
      }

      // Update user's ADIN profile activity
      await AdinService.updateUserProfile(user.id, post?.pillar || 'connect', []);
    } catch (error) {
      console.error('Error handling post interaction:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [pillarFilter, enableAdinRanking, user?.id]);

  return {
    posts,
    loading,
    error,
    refreshPosts,
    handlePostInteraction
  };
};