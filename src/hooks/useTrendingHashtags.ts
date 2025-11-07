import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtag {
  tag: string;
  usage_count: number;
  recent_usage_count: number;
}

/**
 * Fetch trending hashtags
 */
export function useTrendingHashtags(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
      });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}