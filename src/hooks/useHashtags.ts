import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hashtagService, HashtagPost as ServiceHashtagPost } from '@/services/hashtagService';

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
      // Use the new get_hashtag_posts RPC
      const posts = await hashtagService.getPosts(hashtag, limit, offset, 'recent');

      // Map to the expected interface
      return posts.map((post: ServiceHashtagPost) => ({
        id: post.post_id,
        author_id: post.author_id,
        author_name: post.author_name,
        author_username: post.author_username,
        author_avatar: post.author_avatar,
        author_headline: post.author_headline,
        content: post.content,
        media_url: post.media_urls?.[0] || null,
        post_type: 'post',
        privacy_level: 'public',
        created_at: post.created_at,
        updated_at: null,
        like_count: post.like_count,
        comment_count: post.comment_count,
        share_count: post.reshare_count,
        bookmark_count: 0,
        user_has_liked: false,
        user_has_bookmarked: false,
      }));
    },
    enabled: !!hashtag,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTrendingHashtags = (limit: number = 10, days: number = 7) => {
  return useQuery({
    queryKey: ['trending-hashtags', limit, days],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      // Try the new enhanced RPC first
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        p_limit: limit,
        p_timeframe_hours: days * 24, // Convert days to hours for new RPC
      });

      if (error) {
        // Fall back to old RPC signature
        const { data: oldData, error: oldError } = await supabase.rpc('get_trending_hashtags', {
          p_limit: limit,
          p_days: days,
        } as any);

        if (oldError) {
          console.error('Error fetching trending hashtags:', oldError);
          return [];
        }

        // Map old RPC response
        return ((oldData as any[]) || []).map(item => ({
          hashtag: item.hashtag || item.tag,
          post_count: item.post_count || item.usage_count || 0,
          recent_post_count: item.recent_post_count || item.recent_uses || 0,
        }));
      }

      // Map the new RPC response to our interface
      return ((data as any[]) || []).map(item => ({
        hashtag: item.name || item.tag || item.hashtag,
        post_count: item.usage_count || item.post_count || 0,
        recent_post_count: item.recent_uses || item.recent_usage_count || item.recent_post_count || 0,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
};
