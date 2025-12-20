import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FeedbackAnalytics, AdminStatus, AdminCategory, UserTag } from '@/types/feedback';

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
          admin_status,
          admin_category,
          user_tag,
          created_at,
          resolved_at,
          is_deleted,
          sender_id,
          sender:profiles!sender_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .is('parent_message_id', null);

      if (error) {
        console.error('[useFeedbackAnalytics] Error fetching messages:', error);
        return null;
      }

      // Get reactions for trending calculation
      const { data: reactions } = await supabase
        .from('feedback_reactions')
        .select('message_id, emoji')
        .in('message_id', messages?.map(m => m.id) || []);

      // Calculate reaction counts per message
      const reactionCounts: Record<string, number> = {};
      reactions?.forEach(r => {
        reactionCounts[r.message_id] = (reactionCounts[r.message_id] || 0) + 1;
      });

      // Calculate analytics
      const total = messages?.length || 0;

      // By status
      const byStatus: Record<AdminStatus, number> = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        wont_fix: 0,
      };
      messages?.forEach(m => {
        if (m.admin_status) {
          byStatus[m.admin_status as AdminStatus]++;
        }
      });

      // By category
      const byCategory: Record<AdminCategory, number> = {
        bug: 0,
        feature_request: 0,
        ux_issue: 0,
        question: 0,
        duplicate: 0,
        other: 0,
      };
      messages?.forEach(m => {
        if (m.admin_category) {
          byCategory[m.admin_category as AdminCategory]++;
        }
      });

      // By user tag
      const byUserTag: Record<UserTag, number> = {
        bug: 0,
        suggestion: 0,
        question: 0,
        praise: 0,
        other: 0,
      };
      messages?.forEach(m => {
        if (m.user_tag) {
          byUserTag[m.user_tag as UserTag]++;
        }
      });

      // Resolution rate
      const resolved = byStatus.resolved + byStatus.wont_fix;
      const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

      // Average resolution time
      let totalResolutionTime = 0;
      let resolvedCount = 0;
      messages?.forEach(m => {
        if (m.resolved_at && m.created_at) {
          const created = new Date(m.created_at).getTime();
          const resolvedAt = new Date(m.resolved_at).getTime();
          totalResolutionTime += (resolvedAt - created) / (1000 * 60 * 60); // hours
          resolvedCount++;
        }
      });
      const avgResolutionTimeHours = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

      // Trending issues (most reactions)
      const trendingMessages = messages
        ?.sort((a, b) => (reactionCounts[b.id] || 0) - (reactionCounts[a.id] || 0))
        .slice(0, 5)
        .map(m => ({
          ...m,
          reactionCount: reactionCounts[m.id] || 0,
        }));

      // Top contributors
      const contributorCounts: Record<string, { count: number; profile: { username: string | null; full_name: string | null; avatar_url: string | null } }> = {};
      messages?.forEach(m => {
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
        by_user_tag: byUserTag,
        resolution_rate: resolutionRate,
        avg_resolution_time_hours: avgResolutionTimeHours,
        trending_issues: trendingMessages as any,
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
