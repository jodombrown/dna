import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchFilters {
  authorId?: string;
  postType?: 'post' | 'article' | 'poll' | 'event';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchPost {
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

/**
 * Hook to search posts with full-text search and filters
 */
export const usePostSearch = (
  query: string,
  filters?: SearchFilters,
  limit: number = 20,
  offset: number = 0
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['post-search', query, filters, user?.id, limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_posts', {
        p_query: query || null,
        p_viewer_id: user?.id || null,
        p_author_id: filters?.authorId || null,
        p_post_type: filters?.postType || null,
        p_date_from: filters?.dateFrom?.toISOString() || null,
        p_date_to: filters?.dateTo?.toISOString() || null,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        console.error('Error searching posts:', error);
        throw error;
      }

      return (data as SearchPost[]) || [];
    },
    enabled: query.length > 0, // Only search when there's a query
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
