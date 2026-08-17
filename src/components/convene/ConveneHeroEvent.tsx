/**
 * DNA | CONVENE — Hero Event Section
 *
 * The single featured event at the top of the discovery hub. Same species as
 * the cards beneath it (flat warm chassis, 3px Convene bevel) — bigger and
 * carrying more fields, not a different look: a context pill, the title at
 * real size, a date block, a linked venue, going count, and price/action.
 *
 * The cover is a slot, not the surface: inset inside the card's own padding,
 * a fixed 280px-wide track (S95) regardless of card width, never
 * full-bleed, never carrying overlaid text. Every field beneath it is a
 * real slot — nothing renders a placeholder when the data behind it is
 * absent (BD111).
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
import { EventPlate } from '@/components/cards/EventPlate';
import { useConveneEventSelection } from '@/contexts/convene/ConveneEventSelectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEventManagementRole } from '@/hooks/useEventManagementRole';

const CARD_PADDING = 'var(--card-padding)';

// The hero photo's own fixed track width — independent of AppShell's
// LEFT_RAIL_DESKTOP (a nav rail's width happens to match today, but the two
// represent unrelated decisions and must stay free to diverge). At md and
// up the grid is this fixed column plus a 1fr text column, so the image
// holds 280x187 (3:2, S92) at any card width and all growth goes to text.
const HERO_IMAGE_COLUMN = '280px';

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
    // EventPlate's no-cover fallback (BD214): a curated event's host is the
    // source domain (resolved from these two inside the plate), never the
    // DNA-side profile join — which is why organizer_name below is gated on
    // is_curated rather than passed straight through from `organizer`.
    curated_source?: string | null;
    curated_source_url?: string | null;
  };
}

export function ConveneHeroEvent({ event }: HeroEventProps) {
  const navigate = useNavigate();
  const selectHostedEvent = useConveneEventSelection();
  const imageUrl = event.cover_image_url ?? null;
  const attendeeCount = event.event_attendees?.[0]?.count ?? 0;

  const isVirtual = event.format === 'virtual';
  const isHybrid = event.format === 'hybrid';
  const formatLabel = isVirtual ? 'Virtual' : isHybrid ? 'Hybrid' : 'In Person';
  const place = formatEventPlace(event, 'full');

  const handleClick = () => {
    if (selectHostedEvent) {
      selectHostedEvent(event.slug || event.id);
    } else {
      navigate(`/dna/convene/events/${event.slug || event.id}`);
    }
  };

  const { user } = useAuth();
  const hasManagementRole = useEventManagementRole(event.id, user?.id);

  // The primary action always just navigates to the event page — no inline
  // RSVP flow here — so it shares one action word resolved from the ticket
  // types, same as ConveneEventCard and CuratedEventCard. Except for the
  // event's own organizer/team (BD591): they get "Manage" instead, since
  // "I'm going" makes no sense on your own hosted event.
  const actionLabel = hasManagementRole
    ? 'Manage'
    : EVENT_ACTION_LABELS[resolveEventAction(event.event_ticket_types ?? [])];

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
        className="flex flex-col gap-3 md:grid md:gap-4"
        style={{ padding: CARD_PADDING, gridTemplateColumns: `${HERO_IMAGE_COLUMN} 1fr` }}
      >
        {/* Image — a fixed 176px band above the content below 768 (S93); a
            locked 3:2 crop in a fixed HERO_IMAGE_COLUMN-wide track from 768
            up (S92 ratio, S95 fixed-width track), so the image holds
            280x187 at any card width and never scales with it — growth on a
            wider card goes entirely into the 1fr text column. No explicit
            height below md and no aspect-ratio above it — either one
            decouples the band from the image's own intrinsic ratio, which is
            the fix: a wrapper with neither lets CSS Grid derive row height
            from the image's natural size. */}
        <div className="relative h-hero-cover-mobile w-full overflow-hidden rounded-lg md:aspect-hero-cover md:h-auto">
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
            <EventPlate
              event={{
                id: event.id,
                event_type: event.event_type,
                organizer_name: event.is_curated ? null : event.organizer?.full_name || null,
                curated_source: event.curated_source,
                curated_source_url: event.curated_source_url,
                location_city: event.location_city,
              }}
            />
          )}
        </div>

        {/* Fact — every field a real slot; the context pill leads. */}
        <div className="flex min-w-0 flex-col gap-3">
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

          {/* Going — its own row from 768 up. Below 768, folded into the row
              with price instead (S93's field order), so it's hidden here. */}
          <p className="hidden items-center gap-1.5 text-meta md:flex">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {attendeeCount > 0 ? (
              <span className="font-semibold text-foreground">{attendeeCount} going</span>
            ) : (
              <span className="text-muted-foreground">No Members yet. Be the first.</span>
            )}
          </p>

          {/* Going + price, one row — mobile only (S93). Same fields as the
              desktop going row and the desktop price slot below; only the
              grouping changes. */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <p className="flex items-center gap-1.5 text-meta">
              <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {attendeeCount > 0 ? (
                <span className="font-semibold text-foreground">{attendeeCount} going</span>
              ) : (
                <span className="text-muted-foreground">No Members yet. Be the first.</span>
              )}
            </p>
            <EventPriceMeta
              ticketTypes={event.event_ticket_types}
              currency={event.currency}
              className="text-h3 text-foreground"
            />
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
            <EventPriceMeta
              ticketTypes={event.event_ticket_types}
              currency={event.currency}
              className="hidden text-h3 text-foreground md:block"
            />
            <Button
              size="hero"
              className="w-full md:w-auto"
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
