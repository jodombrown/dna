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

        // Map RPC response to UniversalFeedItem
        return (data || []).map((item: any) => ({
          post_id: item.id,
          author_id: item.author_id,
          author_username: item.author_username,
          author_display_name: item.author_full_name,
          author_avatar_url: item.author_avatar_url,
          content: item.content,
          title: item.title,
          subtitle: item.subtitle || null,
          media_url: item.image_url,
          post_type: item.post_type,
          privacy_level: item.privacy_level,
          linked_entity_type: item.linked_entity_type,
          linked_entity_id: item.linked_entity_id,
          space_id: item.space_id,
          space_title: null, // Not returned by RPC yet
          event_id: item.event_id,
          event_title: null, // Not returned by RPC yet
          created_at: item.created_at,
          updated_at: item.updated_at,
          like_count: Number(item.likes_count),
          comment_count: Number(item.comments_count),
          share_count: 0, // Not implemented yet
          view_count: 0, // Not implemented yet
          bookmark_count: 0, // Not returned by RPC
          has_liked: item.user_has_liked,
          has_bookmarked: item.user_has_bookmarked,
        })) as UniversalFeedItem[];
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
