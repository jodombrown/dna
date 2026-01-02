/**
 * useContributeFocusData - Data Hook for Contribute Focus Panel
 *
 * Fetches and manages data for the Contribute Focus panel including:
 * - Opportunity matches for user
 * - User's active listings
 * - Recent opportunities in the marketplace
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STALE_TIMES } from '@/lib/queryClient';

export interface OpportunityMatch {
  id: string;
  title: string;
  type: 'job' | 'mentorship' | 'investment' | 'service' | 'other';
  location: string | null;
  isRemote: boolean;
  matchScore: number;
  matchReason: string;
  createdAt: string;
}

export interface UserListing {
  id: string;
  title: string;
  type: string;
  status: 'open' | 'in_progress' | 'completed';
  interestedCount: number;
  newInterestToday: number;
  createdAt: string;
}

export interface RecentOpportunity {
  id: string;
  title: string;
  type: string;
  location: string | null;
  isRemote: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export function useContributeFocusData() {
  const { user, profile } = useAuth();

  // Fetch user's active listings (contribution needs they've posted)
  const listingsQuery = useQuery({
    queryKey: ['contributeFocus', 'listings', user?.id],
    queryFn: async (): Promise<UserListing[]> => {
      const { data } = await supabase
        .from('contribution_needs')
        .select(`
          id,
          title,
          need_type,
          status,
          created_at,
          contribution_offers (id, created_at)
        `)
        .eq('created_by', user?.id)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(5);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return (data || []).map((need: any) => {
        const offers = need.contribution_offers || [];
        const newToday = offers.filter((o: any) =>
          new Date(o.created_at) >= today
        ).length;

        return {
          id: need.id,
          title: need.title,
          type: need.need_type,
          status: need.status,
          interestedCount: offers.length,
          newInterestToday: newToday,
          createdAt: need.created_at,
        };
      });
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch opportunity matches based on user skills/interests
  const matchesQuery = useQuery({
    queryKey: ['contributeFocus', 'matches', user?.id],
    queryFn: async (): Promise<OpportunityMatch[]> => {
      const userSkills = profile?.skills || [];
      const userInterests = profile?.interests || [];

      // Fetch open contribution needs that match user profile
      const { data } = await supabase
        .from('contribution_needs')
        .select(`
          id,
          title,
          need_type,
          location,
          is_remote,
          required_skills,
          created_at
        `)
        .eq('status', 'open')
        .neq('created_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Score and filter based on skill/interest matches
      const scored = (data || []).map((need: any) => {
        const requiredSkills = need.required_skills || [];
        const matchingSkills = userSkills.filter((s: string) =>
          requiredSkills.some((rs: string) =>
            rs.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(rs.toLowerCase())
          )
        );

        const score = Math.min(100, matchingSkills.length * 20 + 40);
        const matchReason = matchingSkills.length > 0
          ? `Matches your skills in ${matchingSkills.slice(0, 2).join(', ')}`
          : 'Based on your profile';

        return {
          id: need.id,
          title: need.title,
          type: need.need_type as OpportunityMatch['type'],
          location: need.location,
          isRemote: need.is_remote || false,
          matchScore: score,
          matchReason,
          createdAt: need.created_at,
        };
      });

      // Return top matches sorted by score
      return scored
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.medium,
  });

  // Fetch recent opportunities
  const recentQuery = useQuery({
    queryKey: ['contributeFocus', 'recent'],
    queryFn: async (): Promise<RecentOpportunity[]> => {
      const { data } = await supabase
        .from('contribution_needs')
        .select(`
          id,
          title,
          need_type,
          location,
          is_remote,
          created_at,
          creator:profiles!contribution_needs_created_by_fkey (
            id,
            full_name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      return (data || []).map((need: any) => ({
        id: need.id,
        title: need.title,
        type: need.need_type,
        location: need.location,
        isRemote: need.is_remote || false,
        createdBy: need.creator?.id,
        createdByName: need.creator?.full_name || 'Someone',
        createdAt: need.created_at,
      }));
    },
    staleTime: STALE_TIMES.medium,
  });

  return {
    matches: matchesQuery.data || [],
    userListings: listingsQuery.data || [],
    recentOpportunities: recentQuery.data || [],
    isLoading: listingsQuery.isLoading || matchesQuery.isLoading,
    matchCount: matchesQuery.data?.length || 0,
    listingCount: listingsQuery.data?.length || 0,
    refetch: () => {
      matchesQuery.refetch();
      listingsQuery.refetch();
      recentQuery.refetch();
    },
  };
}
