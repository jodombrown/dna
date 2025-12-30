import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingStoryScore {
  post_id: string;
  trending_score: number;
  view_count: number;
  reaction_count: number;
  comment_count: number;
  bookmark_count: number;
}

export interface TrendingStory {
  id: string;
  title: string;
  content: string;
  story_type: string;
  image_url: string | null;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
  trending_score: number;
  view_count: number;
  reaction_count: number;
  comment_count: number;
  bookmark_count: number;
}

/**
 * Fetch trending stories based on 48-hour engagement velocity
 * Score = views(1x) + reactions(3x) + comments(5x) + bookmarks(2x)
 */
export function useTrendingStories(limit: number = 5) {
  return useQuery({
    queryKey: ['trending-stories', limit],
    queryFn: async (): Promise<TrendingStory[]> => {
      // Get trending scores from RPC
      const { data: trendingScores, error: trendingError } = await supabase
        .rpc('get_trending_stories', { p_limit: limit });

      if (trendingError) {
        throw trendingError;
      }

      if (!trendingScores || trendingScores.length === 0) {
        return [];
      }

      const postIds = (trendingScores as TrendingStoryScore[]).map(t => t.post_id);

      // Fetch full post data for trending stories
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          story_type,
          image_url,
          author_id,
          created_at
        `)
        .in('id', postIds);

      if (postsError) {
        throw postsError;
      }

      // Fetch author profiles separately
      const authorIds = [...new Set((posts || []).map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);
      
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Merge trending scores with post data
      const scoreMap = new Map(
        (trendingScores as TrendingStoryScore[]).map(t => [t.post_id, t])
      );

      const trendingStories: TrendingStory[] = (posts || [])
        .map(post => {
          const score = scoreMap.get(post.id);
          const profile = profileMap.get(post.author_id);
          
          return {
            id: post.id,
            title: post.title || 'Untitled Story',
            content: post.content || '',
            story_type: post.story_type || 'update',
            image_url: post.image_url,
            author_id: post.author_id,
            author_name: profile?.full_name || 'DNA Member',
            author_avatar: profile?.avatar_url || null,
            created_at: post.created_at,
            trending_score: score?.trending_score || 0,
            view_count: score?.view_count || 0,
            reaction_count: score?.reaction_count || 0,
            comment_count: score?.comment_count || 0,
            bookmark_count: score?.bookmark_count || 0,
          };
        })
        // Sort by trending score (maintain RPC order)
        .sort((a, b) => b.trending_score - a.trending_score);

      return trendingStories;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
