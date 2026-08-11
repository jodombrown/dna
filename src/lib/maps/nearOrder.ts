// Pure helpers that turn an rpc_events_near ordering into something the UI can
// render: a reordered event list, per-event distance labels, and an honest
// header for the current anchor. Kept pure (no React, no Supabase) so the
// ordering + labelling contract is unit-tested without a DOM or a network.
import type { NearAnchor, NearOrder } from './eventsNear';

// Metres → a short, human label. Coarsened deliberately: a "near me" sort is a
// relative signal, not a survey reading, and 1387 m reads as false precision.
export function formatDistanceM(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '';
  if (meters < 1000) {
    const rounded = Math.max(50, Math.round(meters / 50) * 50);
    return `${rounded} m`;
  }
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export interface NearOrdering<T> {
  /** events the RPC matched, reordered by ascending distance. Non-matches are absent, not last. */
  ordered: T[];
  /** eventId → distance label, only for events the RPC actually placed */
  distanceLabels: Record<string, string>;
  /** how many of the loaded events the RPC ranked — 0 means "nothing near you" */
  matched: number;
}

// Reorder the loaded events by the RPC's ranking, nearest-first, and DROP
// everything the RPC didn't match: the radius is a filter, not just a sort
// key, so an event with no rank is out of the Near Me set entirely.
//
// Virtual events are excluded before the distance step even runs — an event
// with no physical location cannot be "near" anyone, RPC match or not.
export function buildNearOrdering<T extends { id: string; format?: string | null }>(
  events: T[],
  order: NearOrder[],
): NearOrdering<T> {
  const physical = events.filter((e) => e.format !== 'virtual');

  const rank = new Map<string, number>();
  const distance = new Map<string, number>();
  order.forEach((o, i) => {
    if (!rank.has(o.eventId)) rank.set(o.eventId, i);
    distance.set(o.eventId, o.distanceM);
  });

  const ordered = physical
    .filter((e) => rank.has(e.id))
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const ra = rank.get(a.e.id) as number;
      const rb = rank.get(b.e.id) as number;
      if (ra !== rb) return ra - rb;
      return a.i - b.i;
    })
    .map((x) => x.e);

  const distanceLabels: Record<string, string> = {};
  let matched = 0;
  for (const e of physical) {
    if (distance.has(e.id)) {
      const label = formatDistanceM(distance.get(e.id) as number);
      if (label) {
        distanceLabels[e.id] = label;
        matched += 1;
      }
    }
  }

  return { ordered, distanceLabels, matched };
}

// The honest header. If we have no anchor, or the RPC placed none of the loaded
// events, we say so plainly — "Nothing near you yet" — rather than dressing the
// default upcoming list up as a proximity result.
export function nearHeader(anchor: NearAnchor, matched: number): string {
  if (anchor === 'none' || matched === 0) return 'Nothing near you yet';
  switch (anchor) {
    case 'device':
      return 'Events near you';
    case 'declared':
      return 'Near your saved location';
    case 'chapter':
      return 'Near your chapter';
    default:
      return 'Nothing near you yet';
  }
}

const DEFAULT_ANCHOR_LABEL: Record<Exclude<NearAnchor, 'none'>, string> = {
  device: 'your location',
  declared: 'your saved location',
  chapter: 'your chapter',
};

// The honest empty state. A bounded search returning nothing must read as a
// true statement about its bound ("no events within the radius of the
// anchor"), never as a broken lens. With no anchor at all — geolocation
// denied and no profile city — there is no bound to state, so this says what
// would fix it instead of pretending an empty search happened.
export function nearEmptyMessage(
  anchor: NearAnchor,
  anchorLabel: string | null,
  radiusM: number,
): string {
  if (anchor === 'none') return 'Turn on location to see events near you.';
  const km = Math.round(radiusM / 1000);
  const label = anchorLabel ?? DEFAULT_ANCHOR_LABEL[anchor];
  return `No events within ${km}km of ${label}.`;
}
