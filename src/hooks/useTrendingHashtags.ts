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
      // Try new RPC signature first (with timeframe_hours)
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
        p_timeframe_hours: 168, // 7 days in hours
      });

      if (error) {
        // Fall back to old RPC signature (with p_days)
        const { data: oldData, error: oldError } = await supabase.rpc('get_trending_hashtags', {
          p_limit: limit,
          p_days: 7,
        } as any);

        if (oldError) {
          console.error('Error fetching trending hashtags:', oldError);
          return [];
        }

        // Map old format to new
        return ((oldData as any[]) || []).map(item => ({
          tag: item.hashtag || item.tag || item.name,
          name: item.name || item.hashtag || item.tag,
          usage_count: item.post_count || item.usage_count || 0,
          recent_usage_count: item.recent_post_count || item.recent_uses || 0,
          follower_count: 0,
        }));
      }

      // Map new format
      return ((data as any[]) || []).map(item => ({
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
