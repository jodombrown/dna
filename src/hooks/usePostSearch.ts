import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
 * Hook to search posts with text matching and filters.
 * Queries posts table with ILIKE + joins to profiles for author info.
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
      if (!query || query.length < 2) return [];

      const searchTerm = `%${query}%`;

      // Build query: search content, author name, or author username
      let q = supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          image_url,
          post_type,
          privacy_level,
          created_at,
          updated_at,
          profiles:author_id (
            full_name,
            username,
            avatar_url,
            headline
          )
        `)
        .eq('is_deleted', false)
        .or(`content.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters?.postType) {
        q = q.eq('post_type', filters.postType);
      }
      if (filters?.dateFrom) {
        q = q.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        q = q.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error } = await q;

      if (error) throw error;

      // Also search by author name/username if not already matching content
      let authorResults: typeof data = [];
      const authorQ = supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          image_url,
          post_type,
          privacy_level,
          created_at,
          updated_at,
          profiles:author_id (
            full_name,
            username,
            avatar_url,
            headline
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Search profiles that match the query
      const { data: matchingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .limit(20);

      if (matchingProfiles && matchingProfiles.length > 0) {
        const authorIds = matchingProfiles.map(p => p.id);
        const { data: authorData } = await authorQ.in('author_id', authorIds);
        authorResults = authorData || [];
      }

      // Merge and deduplicate
      const allResults = [...(data || []), ...authorResults];
      const seen = new Set<string>();
      const unique = allResults.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      // Map to SearchPost shape
      return unique.slice(0, limit).map((item) => {
        const profile = item.profiles as unknown as Record<string, string | null> | null;
        return {
          id: item.id,
          author_id: item.author_id,
          author_name: profile?.full_name || 'Unknown',
          author_username: profile?.username || '',
          author_avatar: profile?.avatar_url || null,
          author_headline: profile?.headline || null,
          content: item.content,
          media_url: item.image_url,
          post_type: item.post_type,
          privacy_level: item.privacy_level,
          created_at: item.created_at,
          updated_at: item.updated_at,
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          bookmark_count: 0,
          user_has_liked: false,
          user_has_bookmarked: false,
        };
      });
    },
    enabled: query.length >= 2,
    staleTime: 1 * 60 * 1000,
  });
};
