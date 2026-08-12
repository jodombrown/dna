/**
 * DNA | CONVENE — Discovery Lane Rows
 *
 * The hosted-detail sibling of DiscoveryLane: same section header and empty
 * state, but ConveneEventRows in a vertical EventRowList instead of a
 * horizontal-scroll card rail, so the list can sit beside a hosted detail
 * panel without wrapping (Pack 18, extended to the flat case).
 */

import { EventRowList } from '@/components/convene/EventRowList';
import { ConveneEventRow } from '@/components/convene/ConveneEventRow';
import { pickEventPlace } from '@/lib/events/formatPlace';
import type { DiscoveryEvent } from '@/components/convene/DiscoveryLane';
import type { ConveneEventCardProps } from '@/components/convene/ConveneEventCard';

// Maps a lane's DiscoveryEvent into ConveneEventRow's event shape — the same
// field-by-field normalization DiscoveryLane already does for ConveneEventCard,
// reused here so a hosted detail's row rendering matches the card rendering it
// replaces.
function toRowEvent(event: DiscoveryEvent): ConveneEventCardProps['event'] {
  return {
    id: event.id,
    title: event.title,
    start_time: event.start_time,
    end_time: event.end_time,
    time_confirmed: event.time_confirmed,
    date_confirmed: event.date_confirmed,
    ...pickEventPlace(event),
    cover_image_url: event.cover_image_url,
    event_type: event.event_type || undefined,
    format: event.format || undefined,
    is_cancelled: event.is_cancelled,
    slug: event.slug,
    max_attendees: event.max_attendees,
    organizer: event.organizer
      ? {
          id: event.organizer.id,
          full_name: event.organizer.full_name,
          avatar_url: event.organizer.avatar_url,
          username: event.organizer.username,
        }
      : undefined,
    event_attendees: event.event_attendees,
    currency: event.currency,
    event_ticket_types: event.event_ticket_types,
  };
}

interface DiscoveryLaneRowsProps {
  title: string;
  events: DiscoveryEvent[];
  emptyMessage?: string;
  suppressDateTbc?: boolean;
  onEventClick: (event: DiscoveryEvent) => void;
}

export function DiscoveryLaneRows({
  title,
  events,
  emptyMessage,
  suppressDateTbc,
  onEventClick,
}: DiscoveryLaneRowsProps) {
  if (events.length === 0 && !emptyMessage) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-dna-forest">{title}</h3>
      <div className="h-px bg-dna-copper/20" />

      {events.length === 0 && emptyMessage ? (
        <p className="text-body text-muted-foreground py-4 text-center">{emptyMessage}</p>
      ) : (
        <EventRowList>
          {events.map((event) => (
            <ConveneEventRow
              key={event.id}
              event={toRowEvent(event)}
              onClick={() => onEventClick(event)}
              suppressDateTbc={suppressDateTbc}
            />
          ))}
        </EventRowList>
      )}
    </section>
  );
}

export default DiscoveryLaneRows;
