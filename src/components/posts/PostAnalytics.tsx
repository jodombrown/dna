import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostAnalyticsProps {
  postId: string;
  className?: string;
  showEngagement?: boolean;
}

interface PostAnalyticsSummary {
  total_views: number;
  unique_viewers: number;
  total_engagement: number;
  engagement_rate: number;
}

export function PostAnalytics({ postId, className, showEngagement = false }: PostAnalyticsProps) {
  const { data: analytics } = useQuery({
    queryKey: ['post-analytics', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('post_id', postId);
      
      if (error) throw error;
      
      // Calculate summary stats from post_analytics events
      const viewEvents = data.filter(d => d.event_type === 'view');
      const totalViews = viewEvents.length;
      const uniqueViewers = new Set(viewEvents.map(d => d.user_id)).size;
      const engagedViews = data.filter(d => ['like', 'comment', 'share'].includes(d.event_type)).length;
      const engagementRate = totalViews > 0 ? (engagedViews / totalViews) * 100 : 0;
      
      return {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        total_engagement: engagedViews,
        engagement_rate: engagementRate,
      };
    },
    staleTime: 60000, // 1 minute
  });

  if (!analytics || analytics.total_views === 0) return null;

  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        <span>{analytics.total_views.toLocaleString()} views</span>
      </div>
      
      {showEngagement && analytics.total_engagement > 0 && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{analytics.engagement_rate.toFixed(1)}% engaged</span>
        </div>
      )}
    </div>
  );
}
