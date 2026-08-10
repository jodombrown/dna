/**
 * EventPriceMeta — the price slot's one render surface.
 *
 * Wraps resolveEventPrice() for the meta row: date and place, then this,
 * last, right-aligned by the caller's flex layout. Lora at meta size,
 * because every number in this system is Lora — not a badge, not a ribbon,
 * not a coloured chip, no accent bar. Renders nothing when the price is
 * unresolved (BD111) — callers never need to branch on that themselves.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { resolveEventPrice, type EventPriceTicketType } from './resolveEventPrice';

interface EventPriceMetaProps {
  ticketTypes: EventPriceTicketType[] | null | undefined;
  currency: string | null | undefined;
  className?: string;
}

export const EventPriceMeta: React.FC<EventPriceMetaProps> = ({
  ticketTypes,
  currency,
  className,
}) => {
  const price = resolveEventPrice(ticketTypes ?? [], currency ?? null);
  if (!price) return null;
  // min-w-0: as a flex item in the meta row, the price otherwise sets its own
  // content floor and blocks the row (and the card) from shrinking to the
  // track. Wrap vs. truncate at the narrow end is an open copy call — not
  // decided here (whitespace-nowrap / shrink-0 stay off).
  return <span className={cn('min-w-0', className)}>{price}</span>;
};

export default EventPriceMeta;
