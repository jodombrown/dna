import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';

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
  const [additionalStats, setAdditionalStats] = useState({
    activeUsersThisWeek: 0,
    loading: true
  });

  // Use real-time queries for key metrics
  const { data: profiles, loading: profilesLoading } = useRealtimeQuery('admin-profiles', {
    table: 'profiles',
    select: 'id, created_at',
    enabled: true
  });

  const { data: posts, loading: postsLoading } = useRealtimeQuery('admin-posts', {
    table: 'posts',
    select: 'id, created_at, author_id',
    enabled: true
  });

  const { data: flaggedContent, loading: flaggedLoading } = useRealtimeQuery('admin-flags', {
    table: 'content_flags',
    select: 'id',
    filter: 'resolved_at=is.null',
    enabled: true
  });

  const { data: communities, loading: communitiesLoading } = useRealtimeQuery('admin-communities', {
    table: 'communities',
    select: 'id',
    filter: 'is_active=eq.true',
    enabled: true
  });

  const { data: events, loading: eventsLoading } = useRealtimeQuery('admin-events', {
    table: 'events',
    select: 'id',
    enabled: true
  });

  // Calculate derived stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate stats from real-time data
    const totalUsers = profiles.length;
    const newSignupsToday = profiles.filter(p => 
      new Date(p.created_at) >= todayStart
    ).length;
    
    const postsToday = posts.filter(p => 
      new Date(p.created_at) >= todayStart
    ).length;

    const loading = profilesLoading || postsLoading || flaggedLoading || 
                   communitiesLoading || eventsLoading || additionalStats.loading;

    return {
      totalUsers,
      newSignupsToday,
      activeUsersThisWeek: additionalStats.activeUsersThisWeek,
      postsToday,
      flaggedContent: flaggedContent.length,
      totalCommunities: communities.length,
      totalEvents: events.length,
      loading
    };
  }, [profiles, posts, flaggedContent, communities, events, additionalStats, 
      profilesLoading, postsLoading, flaggedLoading, communitiesLoading, eventsLoading]);

  // Calculate active users (requires separate query)
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const { data: activeComments } = await supabase
          .from('comments')
          .select('author_id')
          .gte('created_at', weekStart.toISOString());

        const activeUserIds = new Set([
          ...posts.filter(p => new Date(p.created_at) >= weekStart).map(p => p.author_id),
          ...(activeComments?.map(c => c.author_id) || [])
        ]);

        setAdditionalStats({
          activeUsersThisWeek: activeUserIds.size,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching active users:', error);
        setAdditionalStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (posts.length > 0) {
      fetchActiveUsers();
    }
  }, [posts]);

  return stats;
}