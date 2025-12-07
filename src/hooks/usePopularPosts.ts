import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_popular_posts', {
        p_limit: limit,
        p_viewer_id: user?.id || null,
      });

      if (error) {
        console.error('Error fetching popular posts:', error);
        throw error;
      }

      return data as PopularPost[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
