import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEngagementMetrics = () => {
  return useQuery({
    queryKey: ['engagement-metrics'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: activeUsers } = await supabase
        .from('user_engagement_tracking')
        .select('user_id')
        .gte('last_active', sevenDaysAgo.toISOString());

      // Get onboarding completion rate
      const { count: completedOnboarding } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .not('onboarding_completed_at', 'is', null);

      // Get average engagement score
      const { data: engagementScores } = await supabase
        .from('user_engagement_tracking')
        .select('engagement_score');

      const avgEngagementScore = engagementScores?.length
        ? engagementScores.reduce((sum, { engagement_score }) => sum + (engagement_score || 0), 0) / engagementScores.length
        : 0;

      // Get profile completeness distribution
      const { data: profiles } = await supabase
        .from('profiles')
        .select('profile_completeness_score');

      const completenessDistribution = {
        low: profiles?.filter(p => (p.profile_completeness_score || 0) < 30).length || 0,
        medium: profiles?.filter(p => (p.profile_completeness_score || 0) >= 30 && (p.profile_completeness_score || 0) < 70).length || 0,
        high: profiles?.filter(p => (p.profile_completeness_score || 0) >= 70).length || 0,
      };

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers?.length || 0,
        onboardingCompletionRate: totalUsers ? ((completedOnboarding || 0) / totalUsers) * 100 : 0,
        avgEngagementScore: Math.round(avgEngagementScore),
        completenessDistribution,
      };
    },
  });
};

export const useOnboardingFunnel = () => {
  return useQuery({
    queryKey: ['onboarding-funnel'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('profile_completeness_score, onboarding_completed_at, created_at');

      const total = profiles?.length || 0;
      const completed = profiles?.filter(p => p.onboarding_completed_at).length || 0;
      const highCompleteness = profiles?.filter(p => (p.profile_completeness_score || 0) >= 70).length || 0;

      return [
        { step: 'Signed Up', count: total, percentage: 100 },
        { step: 'Profile Created', count: total, percentage: 100 },
        { step: 'Onboarding Completed', count: completed, percentage: total ? (completed / total) * 100 : 0 },
        { step: 'Profile 70%+ Complete', count: highCompleteness, percentage: total ? (highCompleteness / total) * 100 : 0 },
      ];
    },
  });
};

export const useRetentionMetrics = () => {
  return useQuery({
    queryKey: ['retention-metrics'],
    queryFn: async () => {
      const { data: tracking } = await supabase
        .from('user_engagement_tracking')
        .select('user_id, last_active, created_at')
        .order('created_at', { ascending: false });

      if (!tracking) return [];

      // Group by week for cohort analysis
      const cohorts: { [key: string]: { total: number; active: number } } = {};
      const now = new Date();

      tracking.forEach(({ created_at, last_active }) => {
        const createdDate = new Date(created_at);
        const weekKey = `Week ${Math.floor((now.getTime() - createdDate.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
        
        if (!cohorts[weekKey]) {
          cohorts[weekKey] = { total: 0, active: 0 };
        }
        
        cohorts[weekKey].total++;
        
        if (last_active) {
          const daysSinceActive = (now.getTime() - new Date(last_active).getTime()) / (24 * 60 * 60 * 1000);
          if (daysSinceActive <= 7) {
            cohorts[weekKey].active++;
          }
        }
      });

      return Object.entries(cohorts).map(([week, data]) => ({
        cohort: week,
        retention: data.total ? (data.active / data.total) * 100 : 0,
        users: data.total,
      }));
    },
  });
};

export const useActivityHeatmap = () => {
  return useQuery({
    queryKey: ['activity-heatmap'],
    queryFn: async () => {
      const { data: tracking } = await supabase
        .from('user_engagement_tracking')
        .select('last_active, last_profile_update, last_connection_made, last_post_created');

      const activityByFeature = {
        'Profile Updates': tracking?.filter(t => t.last_profile_update).length || 0,
        'Connections Made': tracking?.filter(t => t.last_connection_made).length || 0,
        'Posts Created': tracking?.filter(t => t.last_post_created).length || 0,
        'Platform Active': tracking?.filter(t => t.last_active).length || 0,
      };

      return Object.entries(activityByFeature).map(([feature, count]) => ({
        feature,
        activity: count,
      }));
    },
  });
};
