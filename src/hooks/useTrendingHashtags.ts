import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtag {
  tag: string;
  name?: string;
  usage_count: number;
  recent_usage_count: number;
  follower_count?: number;
}

/**
 * Fetch trending hashtags
 * Compatible with both old and new RPC signatures
 */
export function useTrendingHashtags(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
        p_days: 7,
      });

      if (error) {
        console.error('Error fetching trending hashtags:', error);
        return [];
      }

      // Map the response to our interface
      return ((data as unknown as any[]) || []).map(item => ({
        tag: item.name || item.tag || item.hashtag,
        name: item.name || item.display_name,
        usage_count: item.usage_count || 0,
        recent_usage_count: item.recent_uses || 0,
        follower_count: item.follower_count || 0,
      }));
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
