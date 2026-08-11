import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Video, Globe, Users, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MutualAttendeesLine } from './MutualAttendeesLine';
import { formatEventPlace, type EventPlaceInput } from '@/lib/events/formatPlace';
import { EventTime } from '@/components/events/EventTime';
import { eventStartMs } from '@/lib/events/eventTime';
import { Nkonsonkonson } from '@/components/icons/adinkra';
import { EventCardFrame } from '@/components/cards/EventCardFrame';
import { EventPlate } from '@/components/cards/EventPlate';
import type { EventPriceTicketType } from '@/components/cards/resolveEventPrice';
import { resolveEventAction, EVENT_ACTION_LABELS } from '@/components/cards/resolveEventAction';

// The card-padding token steps with the viewport (16 / 14 / 12); it has no
// Tailwind utility, so the identity band applies it inline — the one certified
// way to read this token, matching CuratedEventCard.
const CARD_PADDING = 'var(--card-padding)';

export interface ConveneEventCardProps {
  event: EventPlaceInput & {
    id: string;
    title: string;
    start_time?: string | null;
    date_time?: string;
    end_time?: string | null;
    time_confirmed?: boolean | null;
    date_confirmed?: boolean | null;
    location?: string | null;
    cover_image_url?: string | null;
    banner_url?: string | null;
    image_url?: string | null;
    event_type?: string;
    format?: string;
    is_cancelled?: boolean;
    is_virtual?: boolean;
    slug?: string | null;
    max_attendees?: number | null;
    meeting_url?: string | null;
    organizer_id?: string;
    creator_profile?: {
      id?: string;
      full_name: string;
      avatar_url?: string;
      username?: string;
    } | null;
    organizer?: {
      id?: string;
      full_name: string;
      avatar_url?: string | null;
      username?: string;
    } | null;
    organizer_full_name?: string;
    organizer_avatar_url?: string | null;
    organizer_username?: string;
    is_curated?: boolean;
    curated_source?: string | null;
    curated_source_url?: string | null;
    attendee_count?: number;
    event_attendees?: Array<{ count: number }>;
    rsvp_status?: string | null;
    user_rsvp_status?: string | null;
    currency?: string | null;
    event_ticket_types?: EventPriceTicketType[];
  };
  showRsvp?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  onRsvp?: (status: string) => void;
  showOrganizer?: boolean;
  showActions?: boolean;
  isOrganizer?: boolean;
  onClick?: () => void;
  showMutualAttendees?: boolean;
  className?: string;
  /**
   * Distance from the viewer's near-me anchor, e.g. "1.2 km". Shown when set.
   * BD218: Feature-A-owned contract. The near-me sort is the ONLY caller, so a
   * frame/Plate port that drops the meta row below regresses invisibly in every
   * other view. Preserve it, and keep ConveneEventCard.distanceLabel.test.tsx
   * green — that test is the only guard that will go red.
   */
  distanceLabel?: string;
  /** BD230: the undated lane already says "Dates not yet announced" — pass
   *  true there so the card's date slot stays empty instead of repeating it. */
  suppressDateTbc?: boolean;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function ConveneEventCard({
  event,
  showRsvp = false,
  rsvpStatus: rsvpStatusProp,
  onRsvp,
  showOrganizer = true,
  showActions = false,
  isOrganizer = false,
  onClick,
  showMutualAttendees = true,
  className,
  distanceLabel,
  suppressDateTbc,
}: ConveneEventCardProps) {
  const navigate = useNavigate();

  // Normalize data
  const rsvpStatus = rsvpStatusProp ?? event.rsvp_status ?? event.user_rsvp_status ?? null;
  const attendeeCount =
    event.attendee_count ?? event.event_attendees?.[0]?.count ?? 0;
  const organizerName =
    event.organizer?.full_name ?? event.creator_profile?.full_name ?? event.organizer_full_name ?? '';
  const organizerAvatar =
    event.organizer?.avatar_url ?? event.creator_profile?.avatar_url ?? event.organizer_avatar_url ?? undefined;
  const organizerUsername =
    event.organizer?.username ?? event.creator_profile?.username ?? event.organizer_username;

  // Dates — null-safe: an undated event (date_confirmed === false or no
  // start_time) has no calendar position, no urgency, and is never "past".
  const rawDate = event.start_time || event.date_time;
  const startMs = eventStartMs({ start_time: rawDate, date_confirmed: event.date_confirmed });
  const startDate = startMs !== null ? new Date(startMs) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBA';
  const dayNumber = startDate ? format(startDate, 'd') : '·';
  const isPast = startDate ? startDate < new Date() : false;

  // Location
  const getLocationInfo = () => {
    const isVirtual = event.is_virtual || event.format === 'virtual';
    const isHybrid = event.format === 'hybrid';
    const text = formatEventPlace(event, 'compact') || event.location_name;
    if (!text) return null;
    return {
      icon: isVirtual ? Video : isHybrid ? Globe : MapPin,
      text,
      pill: isVirtual || isHybrid,
    };
  };
  const locationInfo = getLocationInfo();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/dna/convene/events/${event.slug || event.id}`);
    }
  };

  const handleOrganizerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (organizerUsername) navigate(`/dna/${organizerUsername}`);
  };

  const imageUrl = event.cover_image_url || event.banner_url || event.image_url;

  // Both the RSVP branch and the fallback branch below just navigate to the
  // event page — neither submits an RSVP inline — so they share one action
  // word resolved from the same ticket types.
  const actionLabel = EVENT_ACTION_LABELS[resolveEventAction(event.event_ticket_types ?? [])];

  // ── Composes the shared four-band frame (BD190) ───────────────────────
  // Byte-identical in shape to CuratedEventCard and every other event surface:
  // Identity / Image / Fact / Action, geometry owned by EventCardFrame. The old
  // cinematic chassis (floating footer, rounded-lg, shadow-lg, gradient cover)
  // is gone — the frame's copper bevel is the edge (BD176), the plate is the
  // imageless cover (BD191/BD192), and the action band is fixed at 56px.
  const timeInput = {
    start_time: rawDate,
    end_time: event.end_time,
    time_confirmed: event.time_confirmed,
    date_confirmed: event.date_confirmed,
  };

  // Band 1 — provenance leading, compact time trailing. Each sits on a
  // token-card ground so it reads over a photo or a coloured plate alike.
  const provenance = event.is_curated ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border/60 bg-card/90 px-2 py-0.5 text-micro uppercase text-foreground backdrop-blur-sm">
      <Nkonsonkonson className="h-2.5 w-2.5" />
      Curated by DNA
    </span>
  ) : isOrganizer ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border/60 bg-card/90 px-2 py-0.5 text-micro uppercase text-foreground backdrop-blur-sm">
      You&apos;re hosting
    </span>
  ) : showOrganizer && organizerName ? (
    <button
      className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/90 px-2 py-0.5 backdrop-blur-sm transition-opacity hover:opacity-80"
      onClick={handleOrganizerClick}
    >
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={organizerAvatar} alt={organizerName} />
        <AvatarFallback className="bg-muted text-micro text-muted-foreground">
          {getInitials(organizerName)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-micro text-foreground">{organizerName}</span>
    </button>
  ) : (
    <span />
  );

  const identity = (
    <div
      className="flex w-full items-center justify-between gap-2"
      style={{ paddingLeft: CARD_PADDING, paddingRight: CARD_PADDING }}
    >
      {provenance}
      <EventTime
        event={timeInput}
        eventId={event.id}
        variant="compact"
        notifyAction={false}
        suppressDateTbc={suppressDateTbc}
        className="inline-flex shrink-0 items-center rounded-full border border-border/60 bg-card/90 px-2 py-0.5 text-micro text-foreground backdrop-blur-sm"
      />
    </div>
  );

  // Band 2 — the cover when there is one, else the generative plate. A member
  // event resolves its host from the profile join (organizerName); a curated
  // event resolves from curatedHostName inside the plate, which refuses that
  // join (BD214) and forwards curated_source so both provenance legs are read.
  const image = imageUrl ? (
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
        organizer_name: event.is_curated ? null : organizerName || null,
        curated_source: event.curated_source,
        curated_source_url: event.curated_source_url,
        location_city: event.location_city,
      }}
    />
  );

  // Band 3 — title, place, the near-me distance (BD218), then the DNA layer
  // pinned to the bottom. distanceLabel renders in the fact band alongside the
  // place line: it is location meta, so it belongs with location.
  const fact = (
    <div className="flex h-full flex-col gap-2">
      <h3 className="line-clamp-2 text-h3 text-foreground">{event.title}</h3>
      {locationInfo && (
        <p className="flex items-center gap-1.5 text-meta text-muted-foreground">
          <locationInfo.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationInfo.text}</span>
        </p>
      )}
      {distanceLabel && (
        <p className="flex items-center gap-1.5 text-meta font-medium text-dna-copper">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {distanceLabel} away
        </p>
      )}
      {showMutualAttendees && <MutualAttendeesLine eventId={event.id} />}
      <p className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0 text-meta">
        <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {attendeeCount > 0 ? (
          <span className="font-semibold text-foreground">{attendeeCount} going</span>
        ) : (
          <span className="text-muted-foreground">No Members yet. Be the first.</span>
        )}
      </p>
    </div>
  );

  // Band 4 — two actions max (BD193). The going/maybe state is a confirmed
  // indicator, inert on click; the RSVP, Manage and curated primaries carry the
  // one action. Curated adds a Source ↗ secondary — a clean handoff.
  const primaryAction =
    rsvpStatus === 'going' ? (
      <Button
        variant="default"
        size="sm"
        className="flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Going
      </Button>
    ) : rsvpStatus === 'maybe' ? (
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <HelpCircle className="mr-1 h-3.5 w-3.5" /> Maybe
      </Button>
    ) : showRsvp && onRsvp ? (
      <Button
        variant="default"
        size="sm"
        className="flex-1"
        onClick={(e) => {
          e.stopPropagation();
          onRsvp('going');
        }}
      >
        {actionLabel}
      </Button>
    ) : showActions && isOrganizer ? (
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dna/convene/events/${event.slug || event.id}/edit`);
        }}
      >
        Manage
      </Button>
    ) : (
      <Button
        variant="default"
        size="sm"
        className="flex-1"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {actionLabel}
      </Button>
    );

  const secondaryAction =
    event.is_curated && event.curated_source_url ? (
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          window.open(event.curated_source_url!, '_blank', 'noopener,noreferrer');
        }}
      >
        Source
        <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
    ) : null;

  const action = (
    <div className="flex w-full items-center gap-2">
      {primaryAction}
      {secondaryAction}
    </div>
  );

  return (
    <div
      className={cn(
        'group block h-full w-full cursor-pointer',
        event.is_cancelled && 'opacity-60',
        className,
      )}
      onClick={handleClick}
    >
      <EventCardFrame
        bevelToken="event"
        identity={identity}
        image={image}
        fact={fact}
        action={action}
        className="h-full transition-colors"
      />
    </div>
  );
}

export default ConveneEventCard;
