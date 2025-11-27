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
        // Build RPC params without p_cursor when it's undefined to avoid PostgREST overload (300)
        const params: Record<string, any> = {
          p_viewer_id: filters.viewerId,
          p_tab: filters.tab || 'all',
          p_author_id: filters.authorId || null,
          p_space_id: filters.spaceId || null,
          p_event_id: filters.eventId || null,
          p_post_type: filters.postType || null,
          p_limit: PAGE_SIZE,
          p_offset: 0,
          p_ranking_mode: filters.rankingMode || 'latest',
        };
        if (pageParam) {
          params.p_cursor = pageParam;
        }

        const { data, error } = await supabase.rpc('get_universal_feed', params as any);

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
        
        // Calculate next cursor from last item
        const nextCursor = items.length === PAGE_SIZE && items[items.length - 1]
          ? items[items.length - 1].created_at
          : null;

        return {
          items,
          nextCursor,
        };
      } catch (error) {
        logHighError(error, 'feed', 'Universal feed infinite query failed', { filters });
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
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
