
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

export const useAnalytics = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlatformStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      
      // Properly cast the JSONB response to our PlatformStats interface
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

  const trackEvent = async (
    eventType: string,
    eventName: string,
    properties: any = {}
  ) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          event_name: eventName,
          properties,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error tracking event:', err);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchPlatformStats(), fetchRecentEvents()]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    stats,
    events,
    loading,
    error,
    trackEvent,
    refetch
  };
};
