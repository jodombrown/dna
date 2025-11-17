/**
 * DNA | FEED - Universal Feed Hook
 * 
 * The single source of truth for querying the DNA feed.
 * Supports all filter contexts: home, profile, space, event.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem, FeedFilters } from '@/types/feed';
import { logHighError } from '@/lib/errorLogger';

export function useUniversalFeed(filters: FeedFilters) {
  const { viewerId, tab = 'all', authorId, spaceId, eventId, rankingMode = 'latest', limit = 30 } = filters;

  const queryKey = ['universal-feed', { viewerId, tab, authorId, spaceId, eventId, rankingMode }];

  const query = useQuery({
    queryKey,
    enabled: !!viewerId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_universal_feed', {
          p_viewer_id: viewerId,
          p_tab: tab,
          p_author_id: authorId || null,
          p_space_id: spaceId || null,
          p_event_id: eventId || null,
          p_limit: limit,
          p_offset: 0,
          p_ranking_mode: rankingMode,
        });

        if (error) {
          logHighError(error, 'feed', 'get_universal_feed failed', { filters });
          throw error;
        }

        return (data || []) as UniversalFeedItem[];
      } catch (err: any) {
        logHighError(err, 'feed', 'get_universal_feed threw', { filters });
        throw err;
      }
    },
  });

  return {
    feedItems: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
