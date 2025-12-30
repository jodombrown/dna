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

/** Raw response item from get_universal_feed RPC */
interface UniversalFeedRpcItem {
  id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url: string | null;
  content: string;
  title: string | null;
  subtitle?: string | null;
  image_url: string | null;
  post_type: string;
  privacy_level: string;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  space_id: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number | string;
  comments_count: number | string;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  link_url?: string | null;
  link_title?: string | null;
  link_description?: string | null;
  link_metadata?: Record<string, unknown> | null;
  original_post_id?: string | null;
  original_author_id?: string | null;
  original_author_username?: string | null;
  original_author_full_name?: string | null;
  original_author_avatar_url?: string | null;
  original_author_headline?: string | null;
  original_content?: string | null;
  original_image_url?: string | null;
  original_created_at?: string | null;
}

export function useUniversalFeed(filters: FeedFilters) {
  const { viewerId, tab = 'all', authorId, spaceId, eventId, rankingMode = 'latest', limit = 30 } = filters;

  const queryKey = ['universal-feed', { viewerId, tab, authorId, spaceId, eventId, rankingMode }];

  const query = useQuery({
    queryKey,
    enabled: !!viewerId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_universal_feed', {
            p_viewer_id: viewerId,
            p_tab: tab,
            p_author_id: authorId || null,
            p_space_id: spaceId || null,
            p_event_id: eventId || null,
            p_limit: limit,
            p_offset: 0,
            p_ranking_mode: rankingMode,
          })
          .returns<UniversalFeedRpcItem[]>();

        if (error) {
          logHighError(error, 'feed', 'get_universal_feed failed', { filters });
          throw error;
        }

        // Map RPC response to UniversalFeedItem
        return (data || []).map((item) => ({
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
          space_title: null,
          event_id: item.event_id,
          event_title: null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          like_count: Number(item.likes_count),
          comment_count: Number(item.comments_count),
          share_count: 0,
          view_count: 0,
          bookmark_count: 0,
          has_liked: item.user_has_liked,
          has_bookmarked: item.user_has_bookmarked,
          link_url: item.link_url || null,
          link_title: item.link_title || null,
          link_description: item.link_description || null,
          link_metadata: item.link_metadata || null,
          // Original post data for reshares
          original_post_id: item.original_post_id || null,
          original_author_id: item.original_author_id || null,
          original_author_username: item.original_author_username || null,
          original_author_full_name: item.original_author_full_name || null,
          original_author_avatar_url: item.original_author_avatar_url || null,
          original_author_headline: item.original_author_headline || null,
          original_content: item.original_content || null,
          original_image_url: item.original_image_url || null,
          original_created_at: item.original_created_at || null,
        })) as UniversalFeedItem[];
      } catch (err: unknown) {
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
