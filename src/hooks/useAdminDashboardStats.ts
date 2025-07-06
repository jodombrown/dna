import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  newSignupsToday: number;
  activeUsersThisWeek: number;
  postsToday: number;
  flaggedContent: number;
  totalCommunities: number;
  totalEvents: number;
  loading: boolean;
}

export function useAdminDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newSignupsToday: 0,
    activeUsersThisWeek: 0,
    postsToday: 0,
    flaggedContent: 0,
    totalCommunities: 0,
    totalEvents: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch new signups today
        const { count: newSignupsToday } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString());

        // Fetch active users this week (users who created posts or comments)
        const { data: activePosts } = await supabase
          .from('posts')
          .select('author_id')
          .gte('created_at', weekStart.toISOString());

        const { data: activeComments } = await supabase
          .from('comments')
          .select('author_id')
          .gte('created_at', weekStart.toISOString());

        const activeUserIds = new Set([
          ...(activePosts?.map(p => p.author_id) || []),
          ...(activeComments?.map(c => c.author_id) || [])
        ]);

        // Fetch posts today
        const { count: postsToday } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString());

        // Fetch flagged content
        const { count: flaggedContent } = await supabase
          .from('content_flags')
          .select('*', { count: 'exact', head: true })
          .is('resolved_at', null);

        // Fetch total communities
        const { count: totalCommunities } = await supabase
          .from('communities')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch total events
        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: totalUsers || 0,
          newSignupsToday: newSignupsToday || 0,
          activeUsersThisWeek: activeUserIds.size,
          postsToday: postsToday || 0,
          flaggedContent: flaggedContent || 0,
          totalCommunities: totalCommunities || 0,
          totalEvents: totalEvents || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    // Set up real-time updates for key metrics
    const channel = supabase
      .channel('admin-dashboard-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'posts' 
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'content_flags' 
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
}