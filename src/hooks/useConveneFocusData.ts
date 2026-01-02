/**
 * useConveneFocusData - Data Hook for Convene Focus Panel
 *
 * Fetches and manages data for the Convene Focus panel including:
 * - Upcoming RSVPed events
 * - Event invitations
 * - Recommended events
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STALE_TIMES } from '@/lib/queryClient';

export interface UpcomingEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  isVirtual: boolean;
  coverImageUrl: string | null;
  status: 'going' | 'maybe';
}

export interface EventInvite {
  id: string;
  eventId: string;
  eventTitle: string;
  invitedBy: string;
  invitedByName: string;
  startTime: string;
  location: string | null;
  isVirtual: boolean;
}

export interface RecommendedEvent {
  id: string;
  title: string;
  startTime: string;
  location: string | null;
  isVirtual: boolean;
  coverImageUrl: string | null;
  attendeeCount: number;
  matchReason: string;
}

export function useConveneFocusData() {
  const { user, profile } = useAuth();

  // Fetch upcoming events where user is attending
  const upcomingQuery = useQuery({
    queryKey: ['conveneFocus', 'upcoming', user?.id],
    queryFn: async (): Promise<UpcomingEvent[]> => {
      const now = new Date().toISOString();

      const { data } = await supabase
        .from('event_attendees')
        .select(`
          id,
          status,
          events!inner (
            id,
            title,
            start_time,
            end_time,
            location,
            is_virtual,
            cover_image_url
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['going', 'maybe'])
        .gte('events.start_time', now)
        .order('events(start_time)', { ascending: true })
        .limit(5);

      return (data || []).map((att: any) => ({
        id: att.events.id,
        title: att.events.title,
        startTime: att.events.start_time,
        endTime: att.events.end_time,
        location: att.events.location,
        isVirtual: att.events.is_virtual || false,
        coverImageUrl: att.events.cover_image_url,
        status: att.status as 'going' | 'maybe',
      }));
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch recommended events based on user interests
  const recommendedQuery = useQuery({
    queryKey: ['conveneFocus', 'recommended', user?.id],
    queryFn: async (): Promise<RecommendedEvent[]> => {
      const now = new Date().toISOString();
      const userInterests = profile?.interests || [];

      // Fetch upcoming public events
      const { data: events } = await supabase
        .from('events')
        .select(`
          id,
          title,
          start_time,
          location,
          is_virtual,
          cover_image_url,
          tags,
          event_attendees (count)
        `)
        .eq('status', 'published')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(10);

      // Filter out events user is already attending
      const userEventIds = new Set(upcomingQuery.data?.map(e => e.id) || []);

      const recommendations = (events || [])
        .filter((e: any) => !userEventIds.has(e.id))
        .slice(0, 4)
        .map((event: any) => {
          const eventTags = event.tags || [];
          const matchingInterests = userInterests.filter((i: string) =>
            eventTags.some((t: string) => t.toLowerCase().includes(i.toLowerCase()))
          );

          return {
            id: event.id,
            title: event.title,
            startTime: event.start_time,
            location: event.location,
            isVirtual: event.is_virtual || false,
            coverImageUrl: event.cover_image_url,
            attendeeCount: event.event_attendees?.[0]?.count || 0,
            matchReason: matchingInterests.length > 0
              ? `Matches your interest in ${matchingInterests[0]}`
              : 'Popular in your network',
          };
        });

      return recommendations;
    },
    enabled: !!user?.id && upcomingQuery.isSuccess,
    staleTime: STALE_TIMES.medium,
  });

  return {
    upcomingEvents: upcomingQuery.data || [],
    eventInvites: [], // TODO: Add when invites table exists
    recommendedEvents: recommendedQuery.data || [],
    isLoading: upcomingQuery.isLoading,
    upcomingCount: upcomingQuery.data?.length || 0,
    refetch: () => {
      upcomingQuery.refetch();
      recommendedQuery.refetch();
    },
  };
}
