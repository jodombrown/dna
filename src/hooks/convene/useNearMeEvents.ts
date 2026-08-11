// useNearMeEvents — the client half of Feature A's "near me" sort.
//
// It calls rpc_events_near (via getEventsNear) and turns the result into a
// reordered list + distance labels + an honest header for whichever anchor the
// fallback chain landed on: device → declared → chapter → none.
//
// Anchors, honestly:
//   • device   — navigator geolocation (getEventsNear; never persisted, gate #4)
//   • declared — the profile's own coordinate, read via get_own_location()
//                (SECURITY DEFINER RPC; authenticated-only), never a direct
//                profiles read from the client
//   • chapter  — NOT wired: the DNA × Place "chapter" is a city NAME in this
//                schema (profiles.current_city), and geo_places exposes only a
//                PostGIS centroid, not a client-readable lat/lng. Until a
//                chapter-coordinate source exists we pass chapter: null. The
//                header branch for it is already correct, so it lights up with
//                no UI change the day that source lands.
//
// BD213 discipline: getEventsNear lets a real RPC error propagate, so react-
// query surfaces it as isError here. The caller shows an honest failure state
// instead of quietly rendering the plain list as if it were a proximity result.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getEventsNear, SOFT_RADIUS_M, type NearAnchor } from '@/lib/maps/eventsNear';
import { buildNearOrdering, nearEmptyMessage, nearHeader } from '@/lib/maps/nearOrder';

export interface NearMeEvents<T> {
  ordered: T[];
  distanceLabels: Record<string, string>;
  header: string;
  /** Honest empty-state copy: names the radius and the resolved anchor (BD480). */
  emptyMessage: string;
  anchor: NearAnchor;
  isPending: boolean;
  isError: boolean;
}

export function useNearMeEvents<T extends { id: string }>(
  events: T[],
  enabled: boolean,
): NearMeEvents<T> {
  const { user } = useAuth();

  // Declared anchor: the profile's own current coordinate, read-only. This is
  // the projection the fallback chain reads when device geolocation is denied.
  // current_city is fetched alongside it purely for display — it is a public
  // profile column, not the SECURITY DEFINER-gated coordinate — so the empty
  // state can name the anchor ("Los Angeles") instead of a vague "your area".
  const declaredQuery = useQuery({
    queryKey: ['near-me-declared', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const [locationRes, cityRes] = await Promise.all([
        supabase.rpc('get_own_location'),
        supabase.from('profiles').select('current_city').eq('id', user.id).maybeSingle(),
      ]);
      if (locationRes.error) throw locationRes.error;
      const row = Array.isArray(locationRes.data) ? locationRes.data[0] : null;
      if (!row || row.current_lat == null || row.current_lng == null) return null;
      return {
        lat: row.current_lat,
        lng: row.current_lng,
        city: cityRes.data?.current_city ?? null,
      };
    },
    enabled: enabled && !!user?.id,
    staleTime: 300_000,
  });

  // Wait for the declared projection to settle before the RPC call, so the
  // fallback is actually available if the device is denied. A signed-out or
  // profile-less viewer settles immediately with a null declared anchor.
  const declaredReady = !enabled || !user?.id || declaredQuery.isFetched;
  const declared = declaredQuery.data ?? null;

  // The order (event ids + distances) is safe to cache; the device coordinate
  // that produced it is not — it never enters the key and never leaves
  // getEventsNear's closure (gate #4).
  const nearQuery = useQuery({
    queryKey: ['near-me-order', user?.id, declared?.lat ?? null, declared?.lng ?? null],
    queryFn: () => getEventsNear({ declared, chapter: null }),
    enabled: enabled && declaredReady,
    retry: false,
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!enabled) {
      return {
        ordered: events,
        distanceLabels: {},
        header: '',
        emptyMessage: '',
        anchor: 'none' as NearAnchor,
        isPending: false,
        isError: false,
      };
    }
    const anchor: NearAnchor = nearQuery.data?.anchor ?? 'none';
    const order = nearQuery.data?.order ?? [];
    const { ordered, distanceLabels, matched } = buildNearOrdering(events, order);
    const isPending = !declaredReady || (nearQuery.isPending && nearQuery.fetchStatus !== 'idle');
    // device has no reverse-geocoded name; declared uses the profile's own city.
    const anchorLabel = anchor === 'declared' ? declared?.city ?? null : null;
    return {
      ordered,
      distanceLabels,
      header: nearHeader(anchor, matched),
      emptyMessage: nearEmptyMessage(anchor, anchorLabel, SOFT_RADIUS_M),
      anchor,
      isPending,
      isError: nearQuery.isError,
    };
  }, [
    enabled,
    events,
    declared,
    declaredReady,
    nearQuery.data,
    nearQuery.isPending,
    nearQuery.fetchStatus,
    nearQuery.isError,
  ]);
}
