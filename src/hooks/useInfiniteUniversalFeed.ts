/**
 * DNA | FEED v1.2 - Infinite Scroll Hook
 * 
 * Cursor-based infinite loading for the Universal Feed.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem, FeedFilters } from '@/types/feed';
import { logHighError } from '@/lib/errorLogger';

const PAGE_SIZE = 20;

/** RPC parameters for get_universal_feed */
interface UniversalFeedRpcParams {
  p_viewer_id: string;
  p_tab: string;
  p_author_id: string | null;
  p_space_id: string | null;
  p_event_id: string | null;
  p_limit: number;
  p_offset: number;
  p_ranking_mode: string;
}

/** Raw row shape from the RPC result */
interface FeedRpcRow {
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
  story_type?: string | null;
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

export const useInfiniteUniversalFeed = (filters: Omit<FeedFilters, 'limit' | 'offset'>) => {
  const {
    data, 
    isLoading, 
    error, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch 
  } = useInfiniteQuery({
    queryKey: ['universal-feed-infinite', filters],
    queryFn: async ({ pageParam }) => {
      try {
        const offset = typeof pageParam === 'number' ? pageParam : 0;
        // Build RPC params - DO NOT include p_post_type as it doesn't exist in the DB function
        const params: UniversalFeedRpcParams = {
          p_viewer_id: filters.viewerId,
          p_tab: filters.tab || 'all',
          p_author_id: filters.authorId || null,
          p_space_id: filters.spaceId || null,
          p_event_id: filters.eventId || null,
          p_limit: PAGE_SIZE,
          p_offset: offset,
          p_ranking_mode: filters.rankingMode || 'latest',
        };

        // Call RPC - spread params to match function signature
        const { data, error } = await supabase.rpc('get_universal_feed', { ...params });

        if (error) {
          logHighError(error, 'feed', 'get_universal_feed RPC failed', { filters });
          throw error;
        }
        
        // Map RPC response to UniversalFeedItem with proper typing
        const rawRows = (data || []) as FeedRpcRow[];
        const items = rawRows.map((item) => ({
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
          story_type: item.story_type || null,
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

        return items;
      } catch (error) {
        logHighError(error, 'feed', 'Universal feed infinite query failed', { filters });
        throw error;
      }
    },
    getNextPageParam: (lastPage: UniversalFeedItem[], allPages: UniversalFeedItem[][]) =>
      lastPage.length === PAGE_SIZE ? allPages.flat().length : undefined,
    initialPageParam: 0 as number,
    enabled: !!filters.viewerId,
  });

  // PERFORMANCE: Removed aggressive realtime subscriptions that were causing
  // excessive refetches. Feed updates are now handled through:
  // 1. Manual refetch when user creates content
  // 2. Pull-to-refresh on mobile
  // 3. Periodic stale time expiration (2 minutes)
  // This significantly reduces database load and improves responsiveness.

  // Flatten pages into single array, then apply client-side postType filter.
  // Filtering happens after flattening so per-page length reflects the true
  // DB page size (critical for pagination offsets to stay aligned).
  const flattened = data?.pages.flatMap((page) => page) || [];
  const feedItems = filters.postType
    ? flattened.filter((item) => item.post_type?.toLowerCase() === filters.postType.toLowerCase())
    : flattened;

  return {
    feedItems,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    refetch,
  };
};
