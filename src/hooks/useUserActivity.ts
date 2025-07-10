import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserActivitySummary {
  recentConnections: number;
  recentPosts: number;
  recentCommunities: number;
  connectProgress: number;
  collaborateProgress: number;
  contributeProgress: number;
  unreadMessages: number;
  pendingRequests: number;
}

export interface RecentActivity {
  id: string;
  type: 'connection' | 'post' | 'community' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  pillar?: string;
}

export const useUserActivity = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserActivitySummary>({
    recentConnections: 0,
    recentPosts: 0,
    recentCommunities: 0,
    connectProgress: 0,
    collaborateProgress: 0,
    contributeProgress: 0,
    unreadMessages: 0,
    pendingRequests: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivitySummary = async () => {
    if (!user?.id) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch recent connections
      const { data: connections } = await supabase
        .from('contact_requests')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('status', 'accepted')
        .gte('updated_at', sevenDaysAgo.toISOString());

      // Fetch recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, pillar')
        .eq('author_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Fetch recent community memberships
      const { data: communities } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('user_id', user.id)
        .gte('joined_at', sevenDaysAgo.toISOString());

      // Fetch unread messages
      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Fetch pending requests
      const { data: pending } = await supabase
        .from('contact_requests')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      // Calculate pillar progress based on impact log
      const { data: impact } = await supabase
        .from('impact_log')
        .select('pillar, points')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const pillarScores = {
        connect: 0,
        collaborate: 0,
        contribute: 0
      };

      impact?.forEach(entry => {
        if (entry.pillar && pillarScores.hasOwnProperty(entry.pillar)) {
          pillarScores[entry.pillar as keyof typeof pillarScores] += entry.points || 0;
        }
      });

      setSummary({
        recentConnections: connections?.length || 0,
        recentPosts: posts?.length || 0,
        recentCommunities: communities?.length || 0,
        connectProgress: Math.min(pillarScores.connect, 100),
        collaborateProgress: Math.min(pillarScores.collaborate, 100),
        contributeProgress: Math.min(pillarScores.contribute, 100),
        unreadMessages: messages?.length || 0,
        pendingRequests: pending?.length || 0
      });

    } catch (error) {
      console.error('Error fetching activity summary:', error);
    }
  };

  const fetchRecentActivities = async () => {
    if (!user?.id) return;

    try {
      const activities: RecentActivity[] = [];
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Recent connections
      const { data: connections } = await supabase
        .from('contact_requests')
        .select(`
          id, created_at, status,
          profiles:sender_id(full_name)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'accepted')
        .gte('updated_at', threeDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(3);

      connections?.forEach(conn => {
        activities.push({
          id: conn.id,
          type: 'connection',
          title: 'New Connection',
          description: `Connected with ${(conn as any).profiles?.full_name || 'DNA Member'}`,
          timestamp: conn.created_at,
          pillar: 'connect'
        });
      });

      // Recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, pillar, created_at')
        .eq('author_id', user.id)
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      posts?.forEach(post => {
        activities.push({
          id: post.id,
          type: 'post',
          title: 'Posted Update',
          description: post.content?.substring(0, 60) + '...' || 'Shared an update',
          timestamp: post.created_at,
          pillar: post.pillar
        });
      });

      // Sort by timestamp and limit to 5 most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchActivitySummary(),
        fetchRecentActivities()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  return {
    summary,
    recentActivities,
    loading,
    refresh: () => {
      fetchActivitySummary();
      fetchRecentActivities();
    }
  };
};