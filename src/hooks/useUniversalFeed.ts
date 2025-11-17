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

export const useUniversalFeed = (filters: FeedFilters) => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['universal-feed', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_universal_feed', {
        p_viewer_id: filters.viewerId,
        p_tab: filters.tab || 'all',
        p_author_id: filters.authorId || null,
        p_space_id: filters.spaceId || null,
        p_event_id: filters.eventId || null,
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0,
      });

      if (error) throw error;
      return (data || []) as unknown as UniversalFeedItem[];
    },
    enabled: !!filters.viewerId,
  });

  // Real-time subscription for feed updates
  useEffect(() => {
    if (!filters.viewerId) return;

    const channel = supabase
      .channel('universal_feed_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_likes' },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments' },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.viewerId, refetch]);

  return {
    feedItems: data || [],
    isLoading,
    error,
    refetch,
  };
};
