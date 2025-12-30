import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FeedbackAnalytics, FeedbackStatus, FeedbackCategory, FeedbackMessageWithSender } from '@/types/feedback';

/**
 * Hook for fetching feedback analytics (admin only)
 */
export function useFeedbackAnalytics(channelId: string | null, enabled: boolean = false) {
  return useQuery({
    queryKey: ['feedback-analytics', channelId],
    queryFn: async (): Promise<FeedbackAnalytics | null> => {
      if (!channelId) return null;

      // Get all messages for the channel
      const { data: messages, error } = await supabase
        .from('feedback_messages')
        .select(`
          id,
          status,
          category,
          created_at,
          sender_id,
          sender:profiles!sender_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .is('parent_id', null);

      if (error) {
        return null;
      }

      // Get reactions for trending calculation
      const messageIds = messages?.map(m => m.id) || [];
      let reactions: { message_id: string; emoji: string }[] = [];
      
      if (messageIds.length > 0) {
        const { data: reactionsData } = await supabase
          .from('feedback_reactions')
          .select('message_id, emoji')
          .in('message_id', messageIds);
        reactions = reactionsData || [];
      }

      // Calculate reaction counts per message
      const reactionCounts: Record<string, number> = {};
      reactions.forEach(r => {
        reactionCounts[r.message_id] = (reactionCounts[r.message_id] || 0) + 1;
      });

      // Calculate analytics
      const total = messages?.length || 0;

      // By status
      const byStatus: Record<FeedbackStatus, number> = {
        open: 0,
        acknowledged: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      };
      messages?.forEach(m => {
        if (m.status) {
          byStatus[m.status as FeedbackStatus] = (byStatus[m.status as FeedbackStatus] || 0) + 1;
        }
      });

      // By category
      const byCategory: Record<FeedbackCategory, number> = {
        bug: 0,
        feature: 0,
        ux: 0,
        general: 0,
        praise: 0,
      };
      messages?.forEach(m => {
        if (m.category) {
          byCategory[m.category as FeedbackCategory] = (byCategory[m.category as FeedbackCategory] || 0) + 1;
        }
      });

      // Resolution rate
      const resolved = byStatus.resolved + byStatus.closed;
      const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

      // Trending issues (most reactions)
      const trendingMessages = messages
        ?.sort((a, b) => (reactionCounts[b.id] || 0) - (reactionCounts[a.id] || 0))
        .slice(0, 5) as unknown as FeedbackMessageWithSender[];

      // Top contributors
      const contributorCounts: Record<string, { count: number; profile: { username: string | null; full_name: string | null; avatar_url: string | null } }> = {};
      messages?.forEach((m: any) => {
        if (m.sender_id) {
          if (!contributorCounts[m.sender_id]) {
            contributorCounts[m.sender_id] = {
              count: 0,
              profile: m.sender as { username: string | null; full_name: string | null; avatar_url: string | null },
            };
          }
          contributorCounts[m.sender_id].count++;
        }
      });
      const topContributors = Object.entries(contributorCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([userId, data]) => ({
          user_id: userId,
          count: data.count,
          profile: data.profile,
        }));

      // Messages over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const messagesOverTime: Record<string, number> = {};
      messages?.forEach(m => {
        const date = new Date(m.created_at).toISOString().split('T')[0];
        if (new Date(m.created_at) >= thirtyDaysAgo) {
          messagesOverTime[date] = (messagesOverTime[date] || 0) + 1;
        }
      });

      return {
        total_messages: total,
        by_status: byStatus,
        by_category: byCategory,
        resolution_rate: resolutionRate,
        avg_resolution_time_hours: 0, // Not tracked in current schema
        trending_issues: trendingMessages || [],
        top_contributors: topContributors,
        messages_over_time: Object.entries(messagesOverTime)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, count]) => ({ date, count })),
      };
    },
    enabled: enabled && !!channelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
