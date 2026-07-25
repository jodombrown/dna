/**
 * EventListRow — the horizontal geometry primitive for dense event lists.
 *
 * Sibling to EventCardFrame. Where the frame is a vertical, aspect-locked card,
 * the row is a horizontal, content-height list item. Like the frame it knows
 * nothing about events: it takes a React node per slot and owns geometry and
 * rhythm only, so every dense event surface — My Events, a profile's events tab,
 * later attendee and search lists — is byte-identical in shape.
 *
 * Two interior layouts fall out of the same slots (see the ports):
 *   · date-box-led — `leading` carries the date box; title + meta stack beside it.
 *   · title-led    — no `leading`; `title` and `titleTrailing` share one line.
 *
 * Chassis (BD176): NO border and NO bevel. A row is not a card and does not
 * carry a card's edge — a 3px four-sided bevel on a dense row reads heavy and
 * turns a list into a pile of cards. Separation between rows is a hairline the
 * LIST owns (`divide-y divide-border`), never the row itself. The Convene C
 * identity is carried by the date box, not by an edge.
 *
 * Unlike the frame, the row has NO fixed height. A card is aspect-locked; a row
 * breathes with its content. That is the honest difference between the two
 * primitives — keep it explicit.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface EventListRowProps {
  /** Left slot — the date box. Optional: omit it for the title-led layout. */
  leading?: React.ReactNode;
  /** The title line. Required. Truncates within its column (min-w-0). */
  title: React.ReactNode;
  /** Right-aligned on the title line — a status badge, or the time (title-led). */
  titleTrailing?: React.ReactNode;
  /** The line under the title — time + location. Optional. */
  meta?: React.ReactNode;
  /** Below meta — mutual attendees, RSVP badge, registration, inline actions. */
  body?: React.ReactNode;
  /** Trailing column pinned to the row's right edge — buttons, a count. Optional. */
  actions?: React.ReactNode;
  onClick?: () => void;
  /** Layout positioning only — never restyling (design-system rule 6). */
  className?: string;
}

// The card-padding token steps with the viewport (16 / 14 / 12); it has no
// Tailwind utility, so it is applied inline — the one certified way to read the
// token, matching EventCardFrame.
const CARD_PADDING = 'var(--card-padding)';

export const EventListRow: React.FC<EventListRowProps> = ({
  leading,
  title,
  titleTrailing,
  meta,
  body,
  actions,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      style={{ padding: CARD_PADDING }}
      className={cn(
        'flex items-start gap-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/40',
        className,
      )}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}

      {/* Content column. min-w-0 is load-bearing: without it flex refuses to
          shrink and a long title overflows the row (the BD185 mechanism). */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">{title}</div>
          {titleTrailing != null && (
            <div className="flex-shrink-0">{titleTrailing}</div>
          )}
        </div>
        {meta && <div className="mt-1">{meta}</div>}
        {body}
      </div>

      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
};

export default EventListRow;
