/**
 * DNA | CONVENE — Full Event Attendees Hook
 * Returns all attendees for an event, sorted with connections first.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EventAttendee {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  username: string | null;
  isConnection: boolean;
}

export function useEventAttendees(eventId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event-attendees-full', eventId, user?.id],
    queryFn: async (): Promise<EventAttendee[]> => {
      if (!eventId) return [];

      // Fetch all going attendees
      const { data: attendeeRows, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'going');

      if (attendeeError) throw attendeeError;
      if (!attendeeRows || attendeeRows.length === 0) return [];

      const userIds = attendeeRows.map(a => a.user_id);

      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, headline, username')
        .in('id', userIds);

      if (profileError) throw profileError;
      if (!profiles) return [];

      // Get current user's connections for sorting priority
      let connectionIds = new Set<string>();
      if (user?.id) {
        const { data: connections } = await supabase
          .from('connections')
          .select('requester_id, recipient_id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (connections) {
          connectionIds = new Set(
            connections.map(c =>
              c.requester_id === user.id ? c.recipient_id : c.requester_id
            )
          );
        }
      }

      const attendees: EventAttendee[] = profiles.map(p => ({
        userId: p.id,
        fullName: p.full_name || 'DNA Member',
        avatarUrl: p.avatar_url,
        headline: p.headline as string | null,
        username: p.username,
        isConnection: connectionIds.has(p.id),
      }));

      // Sort: connections first, then alphabetical
      attendees.sort((a, b) => {
        if (a.isConnection && !b.isConnection) return -1;
        if (!a.isConnection && b.isConnection) return 1;
        return a.fullName.localeCompare(b.fullName);
      });

      return attendees;
    },
    enabled: !!eventId,
    staleTime: 60_000,
  });
}
