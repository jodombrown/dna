import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HashtagPost {
  id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  author_headline: string | null;
  content: string;
  media_url: string | null;
  post_type: string;
  privacy_level: string;
  created_at: string;
  updated_at: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
}

export interface TrendingHashtag {
  hashtag: string;
  post_count: number;
  recent_post_count: number;
}

export const useHashtagPosts = (hashtag: string, limit: number = 20, offset: number = 0) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hashtag-posts', hashtag, user?.id, limit, offset],
    queryFn: async (): Promise<HashtagPost[]> => {
      // RPC not yet implemented - return empty for now
      console.warn('get_posts_by_hashtag RPC not yet implemented');
      return [];
    },
    enabled: !!hashtag,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTrendingHashtags = (limit: number = 10, days: number = 7) => {
  return useQuery({
    queryKey: ['trending-hashtags', limit, days],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
        p_days: days,
      });

      if (error) {
        console.error('Error fetching trending hashtags:', error);
        return [];
      }

      // Map the RPC response to our interface
      return ((data as any[]) || []).map(item => ({
        hashtag: item.tag || item.hashtag,
        post_count: item.usage_count || item.post_count || 0,
        recent_post_count: item.recent_usage_count || item.recent_post_count || 0,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
};