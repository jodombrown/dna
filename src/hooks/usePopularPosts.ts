import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mapFeedRow, type FeedRpcRow } from '@/lib/feed/mapFeedRow';
import type { UniversalFeedItem } from '@/types/feed';

/**
 * Popular posts ("Trending in the Diaspora") shown to new members whose feed is
 * still empty. This is the same `get_universal_feed` RPC as every other feed
 * surface, only with 'top' ranking, so it goes through the canonical
 * `mapFeedRow` mapper - never a hand-rolled row shape. A local shape here is
 * how Space posts lost their `space_title` and rendered the generic "Space"
 * placeholder on the one surface a brand-new member sees first (BD644).
 */
export const usePopularPosts = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['popular-posts', user?.id, limit],
    queryFn: async (): Promise<UniversalFeedItem[]> => {
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

      return ((data as FeedRpcRow[]) || []).map(mapFeedRow);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
