import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventAnalytics {
  event_id: string;
  rsvp_stats: {
    going: number;
    maybe: number;
    not_going: number;
    waitlist: number;
    total: number;
  };
  checkin_stats: {
    checked_in: number;
    going_count: number;
    show_up_rate: number;
  };
  event_has_passed: boolean;
  rsvp_timeline: Array<{
    date: string;
    count: number;
  }> | null;
}

export interface OrganizerAnalytics {
  organizer_id: string;
  time_period_days: number;
  events_hosted: {
    total: number;
    last_30_days: number;
    last_90_days: number;
    upcoming: number;
    past: number;
  };
  avg_rsvps_per_event: number;
  avg_going_per_event: number;
  avg_show_up_rate: number;
  event_list: Array<{
    event_id: string;
    title: string;
    start_time: string;
    end_time: string;
    going_count: number;
    total_rsvps: number;
    checked_in_count: number;
    show_up_rate: number;
  }> | null;
  conversion_metrics: {
    events_to_groups: null;
    events_to_spaces: null;
    events_to_opportunities: null;
    note: string;
  };
}

/**
 * Hook to fetch analytics for a specific event
 */
export function useEventAnalytics(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID required');

      const { data, error } = await supabase.rpc('get_event_analytics', {
        p_event_id: eventId,
      });

      if (error) throw error;
      return data as unknown as EventAnalytics;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook to fetch organizer-level analytics
 */
export function useOrganizerAnalytics(organizerId: string | undefined, daysBack: number = 90) {
  return useQuery({
    queryKey: ['organizer-analytics', organizerId, daysBack],
    queryFn: async () => {
      if (!organizerId) throw new Error('Organizer ID required');

      const { data, error } = await supabase.rpc('get_organizer_analytics', {
        p_organizer_id: organizerId,
        p_days_back: daysBack,
      });

      if (error) throw error;
      return data as unknown as OrganizerAnalytics;
    },
    enabled: !!organizerId,
  });
}
