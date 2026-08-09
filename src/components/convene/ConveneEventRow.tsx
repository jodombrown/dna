/**
 * DNA | CONVENE — ConveneEventRow
 *
 * The date-box-led event row. This is the old `ConveneEventCard variant='compact'`
 * branch, lifted out into a thin composition over the `EventListRow` primitive —
 * the same move `MyEventCard` makes, and the same discipline as `ConveneEventCard`
 * (full) composing `EventCardFrame`. Geometry lives in the primitive; this file
 * owns only the event → slot mapping (dates, urgency, location, RSVP, count).
 *
 * The two BD176 violations the compact branch carried are gone by construction:
 * no thick left spine (the list owns a hairline divider) and no superseded
 * Convene gold — the C identity is the date box, whose month now reads in
 * `--bevel-event` copper, the Convene token BD083 actually specifies.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Video, Globe, Users, Eye, Edit, BarChart3, CheckCircle2, HelpCircle } from 'lucide-react';
import { format, differenceInHours, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MutualAttendeesLine } from './MutualAttendeesLine';
import { formatEventPlace } from '@/lib/events/formatPlace';
import { EventTime } from '@/components/events/EventTime';
import { eventStartMs } from '@/lib/events/eventTime';
import { EventListRow } from '@/components/cards/EventListRow';
import { EventPriceMeta } from '@/components/cards/EventPriceMeta';
import type { ConveneEventCardProps } from './ConveneEventCard';

interface ConveneEventRowProps {
  event: ConveneEventCardProps['event'];
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  showActions?: boolean;
  isOrganizer?: boolean;
  onClick?: () => void;
  showMutualAttendees?: boolean;
  className?: string;
}

export function ConveneEventRow({
  event,
  rsvpStatus: rsvpStatusProp,
  showActions = false,
  isOrganizer = false,
  onClick,
  showMutualAttendees = true,
  className,
}: ConveneEventRowProps) {
  const navigate = useNavigate();

  const rsvpStatus = rsvpStatusProp ?? event.rsvp_status ?? event.user_rsvp_status ?? null;
  const attendeeCount = event.attendee_count ?? event.event_attendees?.[0]?.count ?? 0;

  // Dates — null-safe: an undated event (date_confirmed === false or no
  // start_time) has no calendar position, no urgency, and is never "past".
  const rawDate = event.start_time || event.date_time;
  const startMs = eventStartMs({ start_time: rawDate, date_confirmed: event.date_confirmed });
  const startDate = startMs !== null ? new Date(startMs) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBA';
  const dayNumber = startDate ? format(startDate, 'd') : '·';
  const isPast = startDate ? startDate < new Date() : false;

  const getUrgencyChip = () => {
    if (!startDate || isPast) return null;
    const now = new Date();
    const hoursAway = differenceInHours(startDate, now);
    const daysAway = differenceInDays(startDate, now);

    if (isToday(startDate)) return { label: 'Today', variant: 'today' as const, pulse: true };
    if (isTomorrow(startDate)) return { label: 'Tomorrow', variant: 'tomorrow' as const, pulse: false };
    if (hoursAway <= 48) return { label: `In ${hoursAway}h`, variant: 'urgent' as const, pulse: false };
    if (daysAway <= 7) return { label: `${daysAway} days away`, variant: 'soon' as const, pulse: false };
    return null;
  };
  const urgency = getUrgencyChip();

  const getLocationInfo = () => {
    const isVirtual = event.is_virtual || event.format === 'virtual';
    const isHybrid = event.format === 'hybrid';
    const text = formatEventPlace(event, 'compact') || event.location_name;
    if (!text) return null;
    return { icon: isVirtual ? Video : isHybrid ? Globe : MapPin, text };
  };
  const locationInfo = getLocationInfo();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/dna/convene/events/${event.slug || event.id}`);
  };

  const hasBadges = Boolean(event.event_type || urgency || isPast || event.is_cancelled);

  // ── leading — the date box, the row's Convene anchor ─────────────
  const leading = (
    <div className="w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center">
      <span className="text-micro text-bevel-event uppercase leading-none">{monthAbbrev}</span>
      <span className="text-h2 leading-none mt-0.5">{dayNumber}</span>
    </div>
  );

  // ── title — badge row stacked over the title line ────────────────
  const title = (
    <>
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {event.event_type && (
            <Badge variant="secondary" className="capitalize">
              {event.event_type}
            </Badge>
          )}
          {urgency && (
            <Badge
              className={cn(
                'border-0',
                urgency.variant === 'today' && 'bg-destructive text-destructive-foreground',
                urgency.variant === 'tomorrow' && 'bg-destructive/80 text-destructive-foreground',
                urgency.variant === 'urgent' && 'bg-dna-convene text-white',
                urgency.variant === 'soon' && 'bg-dna-convene/20 text-dna-convene-dark',
              )}
            >
              {urgency.pulse && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1" />}
              {urgency.label}
            </Badge>
          )}
          {isPast && <Badge variant="secondary">Past</Badge>}
          {event.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      )}
      <h3 className="text-h3 line-clamp-1 text-foreground">{event.title}</h3>
    </>
  );

  // ── meta — time + location ───────────────────────────────────────
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground">
      <EventTime
        event={{
          start_time: rawDate,
          end_time: event.end_time,
          time_confirmed: event.time_confirmed,
          date_confirmed: event.date_confirmed,
        }}
        eventId={event.id}
        variant="datetime"
      />
      {locationInfo && (
        <span className="flex items-center gap-1">
          <locationInfo.icon className="h-3 w-3" />
          {locationInfo.text}
        </span>
      )}
      <EventPriceMeta
        ticketTypes={event.event_ticket_types}
        currency={event.currency}
        className="ml-auto font-serif text-foreground"
      />
    </div>
  );

  // ── body — mutual attendees, then the RSVP indicator ─────────────
  const body = (
    <>
      {showMutualAttendees && <MutualAttendeesLine eventId={event.id} />}
      {rsvpStatus && (
        <Badge
          variant={rsvpStatus === 'going' ? 'default' : 'outline'}
          className={cn(
            'mt-2 capitalize',
            rsvpStatus === 'going' && 'bg-dna-copper text-white hover:bg-dna-copper-dark',
          )}
        >
          {rsvpStatus === 'going' && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {rsvpStatus === 'maybe' && <HelpCircle className="h-3 w-3 mr-1" />}
          {rsvpStatus === 'going' ? 'Going ✓' : rsvpStatus}
        </Badge>
      )}
    </>
  );

  // ── actions — host controls, or the attendee count ──────────────
  const actions = showActions ? (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dna/convene/events/${event.slug || event.id}`);
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {isOrganizer && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dna/convene/events/${event.slug || event.id}/analytics`);
            }}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          {!isPast && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dna/convene/events/${event.slug || event.id}/edit`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  ) : attendeeCount > 0 ? (
    <div className="flex items-center gap-1 text-meta text-muted-foreground">
      <Users className="h-3 w-3" />
      {attendeeCount}
    </div>
  ) : undefined;

  return (
    <EventListRow
      onClick={handleClick}
      className={cn(event.is_cancelled && 'opacity-60', className)}
      leading={leading}
      title={title}
      meta={meta}
      body={body}
      actions={actions}
    />
  );
}

export default ConveneEventRow;
