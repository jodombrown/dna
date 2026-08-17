/**
 * useEventManagementRole — does this user hold a management-tier role on
 * this event via event_roles (organizer, co_host/co-host, or promoter)?
 *
 * Distinct from being the event's literal creator (events.organizer_id) or
 * the feed post's author — a team-invited teammate is neither of those but
 * should still be treated as management everywhere the app decides between
 * "RSVP" and "Manage". Same role-set decision as BD570/BD584/BD586:
 * 'moderator'/'speaker'/'volunteer'/'check-in' are deliberately excluded,
 * they don't imply personal hosting/management of the event. event_roles'
 * own check constraint carries both 'co_host' and 'co-host' as separate
 * legacy values; both are included here to match.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MANAGEMENT_ROLES = ['organizer', 'co_host', 'co-host', 'promoter'] as const;

export function useEventManagementRole(eventId: string | null | undefined, userId: string | undefined) {
  const enabled = !!eventId && !!userId;

  const { data: hasManagementRole } = useQuery({
    queryKey: ['event-management-role', eventId, userId],
    enabled,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_roles')
        .select('role')
        .eq('event_id', eventId!)
        .eq('user_id', userId!)
        .in('role', MANAGEMENT_ROLES)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  return !!hasManagementRole;
}
