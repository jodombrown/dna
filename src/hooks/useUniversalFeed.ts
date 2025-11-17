import { useInfiniteQuery } from '@tanstack/react-query';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';

export type FeedType = 'all' | 'network' | 'my_posts';

export interface UniversalFeedFilters {
  feedType?: FeedType;
  authorId?: string;  // For profile feeds
  spaceId?: string;   // For space feeds
  eventId?: string;   // For event feeds
  hashtag?: string | null;
}

const POSTS_PER_PAGE = 20;

/**
 * Universal Feed Hook
 * 
 * This is the canonical feed engine for DNA platform.
 * It powers:
 * - Home feed (/dna/feed) with tabs: All, Network, My Posts
 * - Profile activity feeds
 * - Space feeds
 * - Event feeds
 * 
 * All content types (posts, events, spaces, needs, stories) flow through this.
 */
export function useUniversalFeed(
  userId: string | undefined,
  filters: UniversalFeedFilters = {}
) {
  const { 
    feedType = 'all', 
    authorId, 
    spaceId, 
    eventId, 
    hashtag 
  } = filters;

  return useInfiniteQuery({
    queryKey: ['universal-feed', userId, feedType, authorId, spaceId, eventId, hashtag],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) {
        console.log('[UniversalFeed] No user found');
        return { posts: [], nextOffset: null };
      }

      console.log('[UniversalFeed] Fetching:', {
        userId,
        feedType,
        authorId,
        spaceId,
        eventId,
        hashtag,
        offset: pageParam,
      });

      const { data, error } = await supabase.rpc('get_universal_feed', {
        p_user_id: userId,
        p_feed_type: feedType,
        p_author_id: authorId || null,
        p_space_id: spaceId || null,
        p_event_id: eventId || null,
        p_hashtag: hashtag || null,
        p_limit: POSTS_PER_PAGE,
        p_offset: pageParam,
      });

      if (error) {
        console.error('[UniversalFeed] Query error:', error);
        throw error;
      }

      const posts = (data || []) as PostWithAuthor[];
      console.log('[UniversalFeed] Retrieved:', posts.length, 'items');

      const hasMore = posts.length === POSTS_PER_PAGE;
      const nextOffset = hasMore ? pageParam + POSTS_PER_PAGE : null;

      return {
        posts,
        nextOffset,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!userId,
    retry: 2,
    staleTime: 30000, // 30 seconds
    initialPageParam: 0,
  });
}
