import { useInfiniteQuery } from '@tanstack/react-query';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';

type FeedType = 'all' | 'connections' | 'my_posts';

const POSTS_PER_PAGE = 10;

export function useInfiniteFeedPosts(
  feedType: FeedType = 'all',
  userId?: string,
  hashtag?: string | null
) {
  return useInfiniteQuery({
    queryKey: ['infinite-feed-posts', userId, feedType, hashtag],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) {
        console.log('No user found');
        return { posts: [], nextOffset: null };
      }

      console.log('Fetching feed posts:', { userId, feedType, hashtag, offset: pageParam });

      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: userId,
        p_feed_type: feedType,
        p_hashtag: hashtag || null,
        p_limit: POSTS_PER_PAGE,
        p_offset: pageParam,
      });

      if (error) {
        console.error('Feed query error:', error);
        throw error;
      }

      const posts = (data || []) as PostWithAuthor[];
      console.log('Feed posts retrieved:', posts.length);

      // Determine if there are more posts
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
    staleTime: 30000,
    initialPageParam: 0,
  });
}
