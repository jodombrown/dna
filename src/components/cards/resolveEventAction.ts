/**
 * resolveEventAction — the ONE action word for an event's primary CTA.
 *
 * Pure: no fetching, no Supabase. Callers fetch `event_ticket_types` and hand
 * the rows in here, same discipline as resolveEventPrice.ts. Shares that
 * file's visible-ticket-types filter (getVisibleTicketTypes) so the two
 * resolvers never disagree about what "visible" means.
 *
 *   visible ticket types empty (no ticketing at all) -> 'rsvp'      "I'm going"
 *   every visible type free                          -> 'register' "Register"
 *   anything else (paid, flex, PWYW)                  -> 'tickets'  "Get tickets"
 */

import { getVisibleTicketTypes, type EventPriceTicketType } from './resolveEventPrice';

export type EventAction = 'rsvp' | 'register' | 'tickets';

export function resolveEventAction(
  ticketTypes: EventPriceTicketType[],
  now: Date = new Date(),
): EventAction {
  const visible = getVisibleTicketTypes(ticketTypes, now);

  if (visible.length === 0) return 'rsvp';
  if (visible.every((t) => t.payment_type === 'free')) return 'register';
  return 'tickets';
}

export const EVENT_ACTION_LABELS: Record<EventAction, string> = {
  rsvp: "I'm going",
  register: 'Register',
  tickets: 'Get tickets',
};

export default resolveEventAction;
