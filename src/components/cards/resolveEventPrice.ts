/**
 * resolveEventPrice — the ONE price string for an event's ticket types.
 *
 * Pure: no fetching, no Supabase, no clock reads beyond an injectable `now`.
 * Callers fetch `event_ticket_types` (and `events.currency`) themselves and
 * hand the rows in here.
 *
 * Filter FIRST, then read:
 *   visible = ticket types where hidden is not true
 *             AND (sales_start is null OR sales_start <= now)
 *             AND (sales_end   is null OR sales_end   >= now)
 *
 * Resolve over `visible`:
 *   visible is empty                    -> render nothing
 *   any flex with min_price_cents null  -> "Pay what you want"   NO currency needed
 *   every visible type is free          -> "Free"                NO currency needed
 *   otherwise an amount is required:
 *     events.currency is null           -> render nothing
 *     low  = min over (free=0, paid=price_cents, flex=min_price_cents)
 *     high = max over (free=0, paid=price_cents)      // flex has no ceiling
 *     any flex present                  -> "from {CUR} {low}"
 *     low equals high                   -> "{CUR} {low}"
 *     otherwise                         -> "{CUR} {low} to {high}", low=0 prints "Free"
 *
 * Two cases are DELIBERATELY unresolved and render nothing rather than a guess:
 *   a) a floorless flex type sitting alongside a paid type, where both "Pay what
 *      you want" and "from" would mislead
 *   b) any combination not enumerated above (e.g. an unrecognised payment_type,
 *      or a paid/flex row missing the cents column its type requires)
 * Both log once at debug (BD111) instead of inventing a fallback string.
 *
 * "Free" and "Pay what you want" need no currency on purpose — an organizer
 * running a free event needs no Stripe account and will legitimately have
 * ticket types with events.currency null. Only an AMOUNT requires the currency.
 */

import type { Database } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

export type EventPriceTicketType = Pick<
  Database['public']['Tables']['event_ticket_types']['Row'],
  'hidden' | 'sales_start' | 'sales_end' | 'payment_type' | 'price_cents' | 'min_price_cents'
>;

const formatAmount = (cents: number): string => {
  const major = cents / 100;
  return Number.isInteger(major) ? String(major) : major.toFixed(2);
};

const lowLabel = (cents: number, currency: string): string =>
  cents === 0 ? 'Free' : `${currency} ${formatAmount(cents)}`;

interface TypeAmount {
  low: number;
  high: number | null; // null for flex — it has no ceiling
  isFlex: boolean;
}

export function resolveEventPrice(
  ticketTypes: EventPriceTicketType[],
  currency: string | null,
  now: Date = new Date(),
): string | null {
  const visible = ticketTypes.filter((t) => {
    if (t.hidden === true) return false;
    if (t.sales_start && new Date(t.sales_start) > now) return false;
    if (t.sales_end && new Date(t.sales_end) < now) return false;
    return true;
  });

  if (visible.length === 0) return null;

  const hasFloorlessFlex = visible.some(
    (t) => t.payment_type === 'flex' && t.min_price_cents == null,
  );
  const hasPaid = visible.some((t) => t.payment_type === 'paid');

  if (hasFloorlessFlex) {
    if (hasPaid) {
      logger.debug(
        'resolveEventPrice',
        'floorless flex ticket type alongside a paid type — unresolved (BD111)',
        { visible },
      );
      return null;
    }
    return 'Pay what you want';
  }

  if (visible.every((t) => t.payment_type === 'free')) {
    return 'Free';
  }

  if (currency == null) return null;

  const amounts: (TypeAmount | null)[] = visible.map((t) => {
    if (t.payment_type === 'free') return { low: 0, high: 0, isFlex: false };
    if (t.payment_type === 'paid') {
      return t.price_cents == null ? null : { low: t.price_cents, high: t.price_cents, isFlex: false };
    }
    if (t.payment_type === 'flex') {
      // Floorless flex already handled above, so min_price_cents is set here.
      return t.min_price_cents == null ? null : { low: t.min_price_cents, high: null, isFlex: true };
    }
    return null; // an unrecognised payment_type — unenumerated
  });

  if (amounts.some((a) => a === null)) {
    logger.debug('resolveEventPrice', 'unenumerated ticket-type combination — unresolved (BD111)', {
      visible,
    });
    return null;
  }
  const resolved = amounts as TypeAmount[];

  const low = Math.min(...resolved.map((a) => a.low));
  const anyFlex = resolved.some((a) => a.isFlex);

  if (anyFlex) {
    return `from ${currency} ${formatAmount(low)}`;
  }

  const high = Math.max(...resolved.map((a) => a.high as number));

  if (low === high) {
    return `${currency} ${formatAmount(low)}`;
  }
  return `${lowLabel(low, currency)} to ${currency} ${formatAmount(high)}`;
}

export default resolveEventPrice;
