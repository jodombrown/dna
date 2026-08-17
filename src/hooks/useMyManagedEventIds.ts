/**
 * useMyManagedEventIds — every event the current user manages, as a Set of
 * event ids, for O(1) lookup per card in a list. Batch equivalent of
 * useEventManagementRole (BD588) — that hook checks ONE event and is safe
 * to call from a single-event component; this one exists because Rules of
 * Hooks forbids calling a per-event hook inside a .map() when rendering a
 * list of cards. Same role-set decision as BD570/584/586/588/590:
 * organizer/co_host/co-host/promoter via event_roles, unioned with events
 * the user literally created (events.organizer_id).
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MANAGEMENT_ROLES = ['organizer', 'co_host', 'co-host', 'promoter'] as const;

export function useMyManagedEventIds(userId: string | undefined) {
  const { data: managedEventIds } = useQuery({
    queryKey: ['my-managed-event-ids', userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Set<string>> => {
      const [ownedResult, roleResult] = await Promise.all([
        supabase.from('events').select('id').eq('organizer_id', userId!),
        supabase
          .from('event_roles')
          .select('event_id')
          .eq('user_id', userId!)
          .in('role', MANAGEMENT_ROLES),
      ]);
      if (ownedResult.error) throw ownedResult.error;
      if (roleResult.error) throw roleResult.error;

      const ids = new Set<string>();
      (ownedResult.data ?? []).forEach((e) => ids.add(e.id));
      (roleResult.data ?? []).forEach((r) => ids.add(r.event_id));
      return ids;
    },
  });

  return managedEventIds ?? new Set<string>();
}
