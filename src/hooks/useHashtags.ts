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
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_posts_by_hashtag', {
        p_hashtag: hashtag,
        p_viewer_id: user?.id || null,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        console.error('Error fetching hashtag posts:', error);
        throw error;
      }

      return (data as HashtagPost[]) || [];
    },
    enabled: !!hashtag,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTrendingHashtags = (limit: number = 10, days: number = 7) => {
  return useQuery({
    queryKey: ['trending-hashtags', limit, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
        p_days: days,
      });

      if (error) {
        console.error('Error fetching trending hashtags:', error);
        throw error;
      }

      return (data as TrendingHashtag[]) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
