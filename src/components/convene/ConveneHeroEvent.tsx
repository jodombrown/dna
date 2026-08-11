/**
 * DNA | CONVENE — Hero Event Section
 *
 * The single featured event at the top of the discovery hub. Same species as
 * the cards beneath it (flat warm chassis, 3px Convene bevel) — bigger and
 * carrying more fields, not a different look: a context pill, the title at
 * real size, a date block, a linked venue, going count, and price/action.
 *
 * The cover is a slot, not the surface: inset inside the card's own padding,
 * roughly a third of the card, never full-bleed, never carrying overlaid
 * text. Every field beneath it is a real slot — nothing renders a
 * placeholder when the data behind it is absent (BD111).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Video, Globe, Users, ExternalLink } from 'lucide-react';
import { EventTime } from '@/components/events/EventTime';
import { cn } from '@/lib/utils';
import { formatEventPlace, type EventPlaceInput } from '@/lib/events/formatPlace';
import { LocationLine } from '@/components/maps/LocationLine';
import { EventPriceMeta } from '@/components/cards/EventPriceMeta';
import { resolveEventAction, EVENT_ACTION_LABELS } from '@/components/cards/resolveEventAction';
import type { EventPriceTicketType } from '@/components/cards/resolveEventPrice';

const CARD_PADDING = 'var(--card-padding)';

interface HeroEventProps {
  event: EventPlaceInput & {
    id: string;
    title: string;
    slug?: string | null;
    start_time?: string | null;
    time_confirmed?: boolean | null;
    date_confirmed?: boolean | null;
    end_time?: string | null;
    cover_image_url?: string | null;
    event_type?: string | null;
    format?: string | null;
    max_attendees?: number | null;
    description?: string | null;
    short_description?: string | null;
    is_curated?: boolean;
    is_cancelled?: boolean;
    meeting_url?: string | null;
    location_lat?: number | null;
    location_lng?: number | null;
    currency?: string | null;
    event_ticket_types?: EventPriceTicketType[];
    event_attendees?: Array<{ count: number }>;
    organizer?: {
      full_name: string;
      avatar_url?: string | null;
    } | null;
  };
}

export function ConveneHeroEvent({ event }: HeroEventProps) {
  const navigate = useNavigate();
  const imageUrl = event.cover_image_url ?? null;
  const attendeeCount = event.event_attendees?.[0]?.count ?? 0;

  const isVirtual = event.format === 'virtual';
  const isHybrid = event.format === 'hybrid';
  const formatLabel = isVirtual ? 'Virtual' : isHybrid ? 'Hybrid' : 'In Person';
  const place = formatEventPlace(event, 'full');

  const handleClick = () => {
    navigate(`/dna/convene/events/${event.slug || event.id}`);
  };

  // The primary action always just navigates to the event page — no inline
  // RSVP flow here — so it shares one action word resolved from the ticket
  // types, same as ConveneEventCard and CuratedEventCard.
  const actionLabel = EVENT_ACTION_LABELS[resolveEventAction(event.event_ticket_types ?? [])];

  return (
    <div
      className={cn(
        'relative w-full cursor-pointer overflow-hidden rounded-xl bg-card border-bevel',
        event.is_cancelled && 'opacity-60',
      )}
      style={{ borderColor: 'hsl(var(--bevel-event))' }}
      onClick={handleClick}
    >
      <div
        className="grid grid-cols-3 gap-4"
        style={{ padding: CARD_PADDING }}
      >
        {/* Image — inset in the card's own padding, roughly a third of the
            card at every width, never full-bleed, never overlaid with text. */}
        <div className="relative col-span-1 min-h-0 overflow-hidden rounded-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>

        {/* Fact — every field a real slot; the context pill leads. */}
        <div className="col-span-2 flex min-w-0 flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-full border border-bevel-event bg-bevel-event/10 px-3 py-1 text-micro uppercase text-bevel-event">
            {event.location_city ? `Featured in ${event.location_city}` : 'Featured Event'}
          </span>

          <h2 className="text-h2 text-foreground">{event.title}</h2>

          <p className="flex items-center gap-1.5 text-body text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <EventTime
              event={{
                start_time: event.start_time,
                end_time: event.end_time,
                time_confirmed: event.time_confirmed,
                date_confirmed: event.date_confirmed,
              }}
              eventId={event.id}
              variant="datetime"
            />
          </p>

          <div className="flex items-start gap-1.5 text-body text-muted-foreground" onClick={(e) => e.stopPropagation()}>
            {isVirtual ? <Video className="mt-0.5 h-4 w-4 shrink-0" /> : isHybrid ? <Globe className="mt-0.5 h-4 w-4 shrink-0" /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0" />}
            <div className="flex min-w-0 flex-col">
              <span className="text-meta text-muted-foreground">{formatLabel}</span>
              {isVirtual ? (
                event.meeting_url && (
                  <a
                    href={event.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-body text-primary hover:underline"
                  >
                    Join meeting <ExternalLink className="h-3 w-3" />
                  </a>
                )
              ) : (
                <LocationLine
                  locationName={place.venue}
                  locationAddress={place.street}
                  locality={place.locality}
                  lat={event.location_lat ?? undefined}
                  lng={event.location_lng ?? undefined}
                  className="text-body text-foreground"
                />
              )}
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-meta">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {attendeeCount > 0 ? (
              <span className="font-semibold text-foreground">{attendeeCount} going</span>
            ) : (
              <span className="text-muted-foreground">No Members yet. Be the first.</span>
            )}
          </p>

          <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <EventPriceMeta
              ticketTypes={event.event_ticket_types}
              currency={event.currency}
              className="text-h3 text-foreground"
            />
            <Button
              size="hero"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConveneHeroEvent;
