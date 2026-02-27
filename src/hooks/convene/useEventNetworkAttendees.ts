/**
 * DNA | CONVENE — Batch Network Attendees Hook
 * Cross-C CONNECT -> CONVENE integration.
 * Given an array of event IDs, returns which of the current user's connections
 * are attending each event. Uses a single batch query to avoid N+1.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NetworkAttendee {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

export type NetworkAttendeesByEvent = Record<string, NetworkAttendee[]>;

export function useEventNetworkAttendees(eventIds: string[]) {
  const { user } = useAuth();

  return useQuery<NetworkAttendeesByEvent>({
    queryKey: ['event-network-attendees', eventIds.sort().join(','), user?.id],
    queryFn: async (): Promise<NetworkAttendeesByEvent> => {
      if (!user?.id || eventIds.length === 0) return {};

      // 1. Get current user's accepted connections
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!connections || connections.length === 0) return {};

      const connectionIds = connections.map((c) =>
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      );

      // 2. Batch fetch attendees for ALL given event IDs who are in our connections
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('event_id, user_id')
        .in('event_id', eventIds)
        .eq('status', 'going')
        .in('user_id', connectionIds);

      if (!attendees || attendees.length === 0) return {};

      // 3. Get unique user IDs and fetch their profiles
      const uniqueUserIds = [...new Set(attendees.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', uniqueUserIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.id,
          {
            userId: p.id,
            fullName: p.full_name || 'DNA Member',
            avatarUrl: p.avatar_url,
          },
        ])
      );

      // 4. Group by event_id
      const result: NetworkAttendeesByEvent = {};
      for (const attendee of attendees) {
        const profile = profileMap.get(attendee.user_id);
        if (!profile) continue;
        if (!result[attendee.event_id]) {
          result[attendee.event_id] = [];
        }
        result[attendee.event_id].push(profile);
      }

      return result;
    },
    enabled: eventIds.length > 0 && !!user?.id,
    staleTime: 60_000,
  });
}
