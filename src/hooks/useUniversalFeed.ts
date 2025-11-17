/**
 * DNA | FEED - Universal Feed Hook
 * 
 * The single source of truth for querying the DNA feed.
 * Supports all filter contexts: home, profile, space, event.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem, FeedFilters } from '@/types/feed';
import { useEffect } from 'react';
import { logHighError, withErrorLogging } from '@/lib/errorLogger';

export const useUniversalFeed = (filters: FeedFilters) => {
  const queryClient = useQueryClient();
  const invalidateFeed = () => {
    queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['universal-feed', filters],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_universal_feed', {
          p_viewer_id: filters.viewerId,
          p_tab: filters.tab || 'all',
          p_author_id: filters.authorId || null,
          p_space_id: filters.spaceId || null,
          p_event_id: filters.eventId || null,
          p_limit: filters.limit || 20,
          p_offset: filters.offset || 0,
        });

        if (error) {
          logHighError(error, 'feed', 'get_universal_feed RPC failed', { filters });
          throw error;
        }
        
        return (data || []) as unknown as UniversalFeedItem[];
      } catch (error) {
        logHighError(error, 'feed', 'Universal feed query failed', { filters });
        throw error;
      }
    },
    enabled: !!filters.viewerId,
  });

  // Real-time subscription for feed updates
  useEffect(() => {
    if (!filters.viewerId) return;

    const channelName = `universal_feed_updates_${filters.viewerId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        invalidateFeed();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, () => {
        invalidateFeed();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => {
        invalidateFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.viewerId]);

  return {
    feedItems: data || [],
    isLoading,
    error,
    refetch,
  };
};
