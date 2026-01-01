/**
 * DNA | FEED v1.2 - Infinite Scroll Hook
 * 
 * Cursor-based infinite loading for the Universal Feed.
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem, FeedFilters } from '@/types/feed';
import { useEffect } from 'react';
import { logHighError } from '@/lib/errorLogger';

const PAGE_SIZE = 20;
const DEBUG_FEED = false; // Enable for troubleshooting only

export const useInfiniteUniversalFeed = (filters: Omit<FeedFilters, 'limit' | 'offset'>) => {
  const queryClient = useQueryClient();
  
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
        // Build RPC params - DO NOT include p_post_type as it doesn't exist in the DB function
        const params: Record<string, any> = {
          p_viewer_id: filters.viewerId,
          p_tab: filters.tab || 'all',
          p_author_id: filters.authorId || null,
          p_space_id: filters.spaceId || null,
          p_event_id: filters.eventId || null,
          p_limit: PAGE_SIZE,
          p_offset: 0,
          p_ranking_mode: filters.rankingMode || 'latest',
        };
        if (pageParam) {
          params.p_cursor = pageParam;
        }

        const { data, error } = await (supabase.rpc as any)('get_universal_feed', params);

        if (error) {
          logHighError(error, 'feed', 'get_universal_feed RPC failed', { filters });
          throw error;
        }
        
        // Map RPC response to UniversalFeedItem
        const items = (data || []).map((item: any) => ({
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

        // Apply client-side postType filter ONLY when explicitly specified (e.g., for Convey hub)
        // Use case-insensitive comparison to handle any database inconsistencies
        const filteredItems = filters.postType
          ? items.filter((item) => item.post_type?.toLowerCase() === filters.postType.toLowerCase())
          : items;

        // CRITICAL FIX: Calculate nextOffset from RAW items, not filtered
        // This prevents premature pagination stops when filtering (e.g., Convey stories-only view)
        const currentOffset = typeof pageParam === 'number' ? pageParam : 0;
        const nextOffset = items.length === PAGE_SIZE ? currentOffset + PAGE_SIZE : null;

        return {
          items: filteredItems,
          nextCursor: nextOffset,
        };
      } catch (error) {
        logHighError(error, 'feed', 'Universal feed infinite query failed', { filters });
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0 as number,
    enabled: !!filters.viewerId,
  });

  // Real-time subscription for feed updates
  useEffect(() => {
    if (!filters.viewerId) return;

    const channelName = `universal_feed_updates_${filters.viewerId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.viewerId, queryClient]);

  // Flatten pages into single array
  const feedItems = data?.pages.flatMap(page => page.items) || [];

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
