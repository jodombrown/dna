/**
 * DNA | CONVENE — Mutual Attendees Hook
 * Fetches connections of the current user who are attending a given event.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MutualAttendee {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export function useMutualAttendees(eventId: string | undefined, enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mutual-attendees', eventId, user?.id],
    queryFn: async (): Promise<MutualAttendee[]> => {
      if (!user?.id || !eventId) return [];

      // Get current user's accepted connections
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!connections || connections.length === 0) return [];

      const connectionIds = connections.map(c =>
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      );

      // Get attendees for this event who are in our connections
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'going')
        .in('user_id', connectionIds)
        .limit(5);

      if (!attendees || attendees.length === 0) return [];

      // Fetch profiles
      const userIds = attendees.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      return (profiles || []).map(p => ({
        user_id: p.id,
        full_name: p.full_name || 'DNA Member',
        avatar_url: p.avatar_url,
      }));
    },
    enabled: enabled && !!user?.id && !!eventId,
    staleTime: 60_000,
  });
}
