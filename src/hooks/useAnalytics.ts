
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformStats {
  total_users: number;
  total_profiles: number;
  total_posts: number;
  total_communities: number;
  total_events: number;
  pending_communities: number;
  pending_flags: number;
  active_users_last_7_days: number;
  posts_last_30_days: number;
  events_next_30_days: number;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_name: string;
  user_id?: string;
  properties: any;
  created_at: string;
}

interface UserGrowthData {
  date: string;
  new_users: number;
  total_users: number;
}

interface EngagementData {
  date: string;
  posts: number;
  comments: number;
  likes: number;
}

export const useAnalytics = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlatformStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      
      setStats(data as unknown as PlatformStats);
    } catch (err: any) {
      console.error('Error fetching platform stats:', err);
      setError(err.message);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching analytics events:', err);
      setError(err.message);
    }
  };

  const fetchUserGrowthData = async () => {
    try {
      // Get user registration data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      // Process the data to get daily growth
      const growthMap = new Map<string, number>();
      data?.forEach(profile => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        growthMap.set(date, (growthMap.get(date) || 0) + 1);
      });

      // Convert to array format needed for charts
      const growthData: UserGrowthData[] = [];
      let totalUsers = 0;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const newUsers = growthMap.get(dateStr) || 0;
        totalUsers += newUsers;
        
        growthData.push({
          date: dateStr,
          new_users: newUsers,
          total_users: totalUsers
        });
      }

      setUserGrowthData(growthData);
    } catch (err: any) {
      console.error('Error fetching user growth data:', err);
    }
  };

  const fetchEngagementData = async () => {
    try {
      // Get post engagement data for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('posts')
        .select('created_at, likes_count, comments_count')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      // Process the data by day
      const engagementMap = new Map<string, { posts: number; likes: number; comments: number }>();
      
      data?.forEach(post => {
        const date = new Date(post.created_at).toISOString().split('T')[0];
        const current = engagementMap.get(date) || { posts: 0, likes: 0, comments: 0 };
        engagementMap.set(date, {
          posts: current.posts + 1,
          likes: current.likes + (post.likes_count || 0),
          comments: current.comments + (post.comments_count || 0)
        });
      });

      // Convert to array format
      const engagement: EngagementData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = engagementMap.get(dateStr) || { posts: 0, likes: 0, comments: 0 };
        
        engagement.push({
          date: dateStr,
          posts: dayData.posts,
          comments: dayData.comments,
          likes: dayData.likes
        });
      }

      setEngagementData(engagement);
    } catch (err: any) {
      console.error('Error fetching engagement data:', err);
    }
  };

  const trackEvent = async (
    eventType: string,
    eventName: string,
    properties: any = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          event_name: eventName,
          properties,
          user_id: user?.id
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error tracking event:', err);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([
      fetchPlatformStats(), 
      fetchRecentEvents(),
      fetchUserGrowthData(),
      fetchEngagementData()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    stats,
    events,
    userGrowthData,
    engagementData,
    loading,
    error,
    trackEvent,
    refetch
  };
};
