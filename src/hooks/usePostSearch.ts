import { useQuery } from '@tanstack/react-query';
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
    queryFn: async (): Promise<SearchPost[]> => {
      // RPC not yet implemented - return empty for now
      return [];
    },
    enabled: query.length > 0,
    staleTime: 1 * 60 * 1000,
  });
};