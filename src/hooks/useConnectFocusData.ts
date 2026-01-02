/**
 * useConnectFocusData - Data Hook for Connect Focus Panel
 *
 * Fetches and manages data for the Connect Focus panel including:
 * - Pending connection requests
 * - Connection suggestions/recommendations
 * - Recent network activity
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { connectionService } from '@/services/connectionService';
import { STALE_TIMES } from '@/lib/queryClient';

export interface PendingRequest {
  id: string;
  requesterId: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  message: string | null;
  createdAt: string;
}

export interface ConnectionSuggestion {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  matchScore: number;
  matchReasons: string[];
  mutualConnectionsCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'accepted' | 'new_join' | 'profile_view';
  message: string;
  timestamp: string;
}

export function useConnectFocusData() {
  const { user } = useAuth();

  // Fetch pending connection requests
  const pendingQuery = useQuery({
    queryKey: ['connectFocus', 'pending', user?.id],
    queryFn: async (): Promise<PendingRequest[]> => {
      const requests = await connectionService.getPendingRequests();
      return requests.slice(0, 6).map((req) => ({
        id: req.connection_id,
        requesterId: req.requester_id,
        fullName: req.full_name || 'Unknown',
        avatarUrl: req.avatar_url,
        headline: req.headline,
        location: req.location,
        message: req.message,
        createdAt: req.created_at,
      }));
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch connection suggestions
  const suggestionsQuery = useQuery({
    queryKey: ['connectFocus', 'suggestions', user?.id],
    queryFn: async (): Promise<ConnectionSuggestion[]> => {
      const recommendations = await connectionService.getConnectionRecommendations(6);
      return recommendations.map((rec) => ({
        userId: rec.user_id,
        fullName: rec.full_name || 'Unknown',
        avatarUrl: rec.avatar_url,
        headline: rec.headline,
        location: rec.location,
        matchScore: rec.match_score,
        matchReasons: rec.match_reasons || [],
        mutualConnectionsCount: rec.mutual_connections_count || 0,
      }));
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.medium, // 5 minutes
  });

  // Fetch recent activity
  const activityQuery = useQuery({
    queryKey: ['connectFocus', 'activity', user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      // Get recently accepted connections (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: acceptedConnections } = await supabase
        .from('connections')
        .select(`
          id,
          updated_at,
          requester:profiles!connections_requester_id_fkey(full_name),
          recipient:profiles!connections_recipient_id_fkey(full_name)
        `)
        .or(`requester_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .eq('status', 'accepted')
        .gte('updated_at', sevenDaysAgo)
        .order('updated_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      (acceptedConnections || []).forEach((conn: any) => {
        const otherPerson = conn.requester?.full_name === user?.id
          ? conn.recipient?.full_name
          : conn.requester?.full_name;

        if (otherPerson) {
          activities.push({
            id: conn.id,
            type: 'accepted',
            message: `${otherPerson} is now in your network`,
            timestamp: conn.updated_at,
          });
        }
      });

      return activities.slice(0, 5);
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.medium,
  });

  return {
    pendingRequests: pendingQuery.data || [],
    suggestions: suggestionsQuery.data || [],
    recentActivity: activityQuery.data || [],
    isLoading: pendingQuery.isLoading || suggestionsQuery.isLoading,
    pendingCount: pendingQuery.data?.length || 0,
    suggestionCount: suggestionsQuery.data?.length || 0,
    refetch: () => {
      pendingQuery.refetch();
      suggestionsQuery.refetch();
      activityQuery.refetch();
    },
  };
}
