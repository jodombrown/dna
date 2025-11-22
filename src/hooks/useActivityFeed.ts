import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, ActivityType } from '@/types/activity';

interface UseActivityFeedParams {
  userId: string | undefined;
  activityTypes?: ActivityType[];
  limit?: number;
}

interface FeedPage {
  activities: Activity[];
  nextPage?: number;
}

export const useActivityFeed = ({ 
  userId, 
  activityTypes, 
  limit = 20 
}: UseActivityFeedParams) => {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['activity-feed', userId, activityTypes],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) throw new Error('User ID required');

      const offset = (pageParam as number) * limit;
      const { data, error } = await supabase.rpc('get_activity_feed', {
        p_user_id: userId,
        p_activity_types: activityTypes || null,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      return {
        activities: (data || []) as unknown as Activity[],
        nextPage: data && data.length === limit ? (pageParam as number) + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
};
