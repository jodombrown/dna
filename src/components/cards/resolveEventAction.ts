/**
 * resolveEventAction — the ONE action word for an event's primary CTA.
 *
 * Pure: given the event's cancelled/past state and the viewer's own RSVP,
 * returns the label the primary action prints. Mirrors the word set already
 * live on StickyRSVPBar and the event cards (Cancelled / Event Ended / Going
 * / I'm going) so a hero, a card, and the detail page never disagree on what
 * an identical state is called.
 */

export interface EventActionInput {
  isCancelled?: boolean;
  isPast?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
}

export function resolveEventAction({ isCancelled, isPast, rsvpStatus }: EventActionInput): string {
  if (isCancelled) return 'Cancelled';
  if (isPast) return 'Event Ended';
  if (rsvpStatus === 'going') return 'Going';
  return "I'm going";
}

export default resolveEventAction;
