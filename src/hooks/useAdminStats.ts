import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  total: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
  dau: number;
  wau: number;
  mau: number;
}

export interface ConnectionStats {
  total: number;
  pending: number;
  new_this_week: number;
}

export interface EventStats {
  total: number;
  upcoming: number;
  this_week: number;
}

export interface ContentStats {
  total_posts: number;
  posts_this_week: number;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  unresolved: number;
}

export interface ModerationStats {
  pending_flags: number;
  resolved_this_week: number;
}

export interface AdminDashboardStats {
  users: UserStats;
  connections: ConnectionStats;
  events: EventStats;
  content: ContentStats;
  feedback: FeedbackStats;
  moderation: ModerationStats;
  generated_at: string;
}

export interface UserGrowthDataPoint {
  date: string;
  new_users: number;
  cumulative_users: number;
}

export interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
}

interface UseAdminStatsReturn {
  stats: AdminDashboardStats | null;
  userGrowth: UserGrowthDataPoint[];
  userSegments: UserSegment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchGrowth: (days?: number) => Promise<void>;
  refetchSegments: () => Promise<void>;
}

export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthDataPoint[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_admin_dashboard_stats');

      if (rpcError) {
        console.error('Error fetching stats:', rpcError);
        setError('Failed to fetch dashboard stats');
        return;
      }

      if (data) {
        setStats(data as unknown as AdminDashboardStats);
        setError(null);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('An error occurred while fetching stats');
    }
  }, []);

  const fetchGrowth = useCallback(async (days: number = 30) => {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_user_growth_data', {
        p_days: days
      });

      if (rpcError) {
        console.error('Error fetching growth data:', rpcError);
        return;
      }

      if (data) {
        setUserGrowth(data as unknown as UserGrowthDataPoint[]);
      }
    } catch (err) {
      console.error('Growth data fetch error:', err);
    }
  }, []);

  const fetchSegments = useCallback(async () => {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_user_segments_distribution');

      if (rpcError) {
        console.error('Error fetching segments:', rpcError);
        return;
      }

      if (data) {
        setUserSegments(data as unknown as UserSegment[]);
      }
    } catch (err) {
      console.error('Segments fetch error:', err);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchGrowth(), fetchSegments()]);
    setIsLoading(false);
  }, [fetchStats, fetchGrowth, fetchSegments]);

  useEffect(() => {
    refetch();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch, fetchStats]);

  return {
    stats,
    userGrowth,
    userSegments,
    isLoading,
    error,
    refetch,
    refetchGrowth: fetchGrowth,
    refetchSegments: fetchSegments
  };
};

export default useAdminStats;
