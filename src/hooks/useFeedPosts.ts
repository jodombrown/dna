import { useQuery } from '@tanstack/react-query';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';

type FeedType = 'all' | 'connections' | 'my_posts';

export function useFeedPosts(feedType: FeedType = 'all', userId?: string) {
  return useQuery({
    queryKey: ['feed-posts', userId, feedType],
    queryFn: async () => {
      if (!userId) {
        console.log('No user found');
        return [];
      }

      console.log('Fetching feed posts:', { userId, feedType });

      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: userId,
        p_feed_type: feedType,
        p_hashtag: null,
        p_limit: 20,
        p_offset: 0,
      });

      if (error) {
        console.error('Feed query error:', error);
        throw error;
      }

      console.log('Feed posts retrieved:', data?.length || 0);
      return (data || []) as PostWithAuthor[];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });
}
