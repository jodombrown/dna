import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PopularPost {
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
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  space_id: string | null;
  event_id: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  engagement_score: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
}

export const usePopularPosts = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['popular-posts', user?.id, limit],
    queryFn: async (): Promise<PopularPost[]> => {
      // Use get_universal_feed with 'top' ranking as fallback until dedicated RPC exists
      const viewerId = user?.id || '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await (supabase.rpc as any)('get_universal_feed', {
        p_viewer_id: viewerId,
        p_tab: 'all',
        p_author_id: null,
        p_space_id: null,
        p_event_id: null,
        p_limit: limit,
        p_offset: 0,
        p_ranking_mode: 'top',
      });

      if (error) {
        return [];
      }

      // Map response to PopularPost format
      interface FeedRow {
        id: string;
        author_id: string;
        author_full_name: string;
        author_username: string;
        author_avatar_url: string | null;
        content: string;
        image_url: string | null;
        post_type: string;
        privacy_level: string;
        linked_entity_type: string | null;
        linked_entity_id: string | null;
        space_id: string | null;
        event_id: string | null;
        created_at: string;
        likes_count: number;
        comments_count: number;
        user_has_liked: boolean;
        user_has_bookmarked: boolean;
      }
      return ((data as FeedRow[]) || []).map((item) => ({
        id: item.id,
        author_id: item.author_id,
        author_name: item.author_full_name,
        author_username: item.author_username,
        author_avatar: item.author_avatar_url,
        author_headline: null,
        content: item.content,
        media_url: item.image_url,
        post_type: item.post_type,
        privacy_level: item.privacy_level,
        linked_entity_type: item.linked_entity_type,
        linked_entity_id: item.linked_entity_id,
        space_id: item.space_id,
        event_id: item.event_id,
        created_at: item.created_at,
        like_count: Number(item.likes_count) || 0,
        comment_count: Number(item.comments_count) || 0,
        share_count: 0,
        bookmark_count: 0,
        engagement_score: (Number(item.likes_count) || 0) + (Number(item.comments_count) || 0) * 3,
        user_has_liked: item.user_has_liked || false,
        user_has_bookmarked: item.user_has_bookmarked || false,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
