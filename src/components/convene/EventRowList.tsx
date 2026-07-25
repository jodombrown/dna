import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The list container for a stack of <EventListRow>s.
 *
 * Owns two things the rows deliberately do not: the gap between a collapsible
 * trigger and its content, and the hairline between rows. BD226 moved row
 * separation off the row (which used to carry a `border-l-4` spine) and onto
 * the list. This is where that lives.
 */
export const EventRowList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn('mt-3 divide-y divide-border', className)}>{children}</div>
);

export default EventRowList;
