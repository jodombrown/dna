/**
 * DNA | CONVENE: My Events state rows (BD455).
 *
 * The row treatments for the three lenses added alongside Attending/Hosting:
 * Managing, Drafted, Cancelled. Each is a thin composition over the
 * `EventListRow` primitive, matching the pattern MyEventCard and
 * ConveneEventRow already use: geometry lives in the primitive, these files
 * only map a row's state onto its slots.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Share2, Copy, MoreHorizontal } from 'lucide-react';
import { EventListRow } from '@/components/cards/EventListRow';
import { EventPriceMeta } from '@/components/cards/EventPriceMeta';
import type { EventPriceTicketType } from '@/components/cards/resolveEventPrice';
import { EventTime } from '@/components/events/EventTime';
import { eventStartMs } from '@/lib/events/eventTime';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';

// The list-row date box, the same 44×44 Convene anchor MyEventCard,
// ConveneEventRow and the page's own list carry (BD226).
function stateDateBox(event: Parameters<typeof eventStartMs>[0]) {
  const startMs = eventStartMs(event);
  const startDate = startMs !== null ? new Date(startMs) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBA';
  const dayNumber = startDate ? format(startDate, 'd') : '·';
  return (
    <div className="w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center gap-0.5">
      <span className="text-micro text-bevel-event uppercase leading-none">{monthAbbrev}</span>
      <span className="text-h2 leading-none">{dayNumber}</span>
    </div>
  );
}

interface StateRowEvent {
  id: string;
  slug?: string | null;
  title: string;
  start_time: string | null;
  time_confirmed?: boolean | null;
  date_confirmed?: boolean | null;
  currency?: string | null;
  event_ticket_types?: EventPriceTicketType[];
}

// ── Managing ────────────────────────────────────────────────────────────
// event_roles rows for the current user where they are not the organizer.
// One primary action ("Manage") at a 44px minimum target; everything else
// (view, share, copy link) goes to overflow so the primary stays unambiguous.
interface ManagingEventRowProps {
  event: StateRowEvent;
  role: string;
}

export function ManagingEventRow({ event, role }: ManagingEventRowProps) {
  const navigate = useNavigate();
  const eventPath = `/dna/convene/events/${event.slug || event.id}`;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${eventPath}`;
    if (navigator.share) {
      navigator.share({ title: event.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}${eventPath}`);
    toast.success('Event link copied!');
  };

  return (
    <EventListRow
      onClick={() => navigate(ROUTES.convene.eventManage(event.id))}
      leading={stateDateBox(event)}
      title={<h3 className="text-h3 line-clamp-1 text-foreground">{event.title}</h3>}
      titleTrailing={
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
      }
      meta={
        <div className="flex items-center justify-between gap-2">
          <EventTime
            event={{
              start_time: event.start_time,
              time_confirmed: event.time_confirmed,
              date_confirmed: event.date_confirmed,
            }}
            variant="datetime"
            notifyAction={false}
            className="text-meta text-muted-foreground"
          />
          <EventPriceMeta
            ticketTypes={event.event_ticket_types}
            currency={event.currency}
            className="font-serif text-meta text-foreground shrink-0"
          />
        </div>
      }
      body={
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.convene.eventManage(event.id));
            }}
          >
            Manage
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate(eventPath)}>
                <Eye className="h-4 w-4 mr-2" />
                View event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
}

// ── Drafted ─────────────────────────────────────────────────────────────
// organizer_id = auth user AND lifecycle_state = 'draft'. No date renders
// when there is none: no placeholder, no em dash, no "TBA". The progress
// line names which fields are actually empty, read straight off the row.
interface DraftedEventRowProps {
  event: StateRowEvent & {
    description?: string | null;
    cover_image_url?: string | null;
    location_name?: string | null;
    location_address?: string | null;
  };
}

export function DraftedEventRow({ event }: DraftedEventRowProps) {
  const navigate = useNavigate();
  const eventPath = `/dna/convene/events/${event.slug || event.id}`;
  const startMs = eventStartMs(event);

  const missing: string[] = [];
  if (startMs === null) missing.push('date');
  if (!event.description) missing.push('description');
  if (!event.cover_image_url) missing.push('cover image');
  if (!event.location_name && !event.location_address) missing.push('location');

  return (
    <div
      onClick={() => navigate(ROUTES.convene.eventEdit(event.id))}
      className="rounded-xl border-dashed border-bevel border-bevel-event/50 bg-card cursor-pointer"
    >
      <EventListRow
        leading={
          startMs !== null ? (
            stateDateBox(event)
          ) : (
            <div className="w-11 h-11 border border-dashed border-bevel-event/50 rounded-lg bg-background" />
          )
        }
        title={<h3 className="text-h3 line-clamp-1 text-foreground">{event.title}</h3>}
        titleTrailing={<Badge variant="outline">Draft</Badge>}
        meta={
          startMs !== null || event.event_ticket_types?.length ? (
            <div className="flex items-center justify-between gap-2">
              {startMs !== null && (
                <EventTime
                  event={{
                    start_time: event.start_time,
                    time_confirmed: event.time_confirmed,
                    date_confirmed: event.date_confirmed,
                  }}
                  variant="datetime"
                  notifyAction={false}
                  className="text-meta text-muted-foreground"
                />
              )}
              <EventPriceMeta
                ticketTypes={event.event_ticket_types}
                currency={event.currency}
                className="font-serif text-meta text-foreground shrink-0 ml-auto"
              />
            </div>
          ) : null
        }
        body={
          <div className="mt-3 space-y-3">
            {missing.length > 0 && (
              <p className="text-meta text-muted-foreground">Missing: {missing.join(', ')}</p>
            )}
            <Button
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.convene.eventEdit(event.id));
              }}
            >
              Finish it
            </Button>
          </div>
        }
      />
    </div>
  );
}

// ── Cancelled ───────────────────────────────────────────────────────────
// organizer_id = auth user AND lifecycle_state = 'cancelled'. Neutral bevel,
// recessed fill, muted type, no action at all, and no notification claim:
// no trigger on events or event_attendees notifies anyone, so a line saying
// attendees were told would be false.
interface CancelledEventRowProps {
  event: StateRowEvent;
}

export function CancelledEventRow({ event }: CancelledEventRowProps) {
  return (
    <div className="rounded-xl border-bevel border-border bg-muted/40">
      <EventListRow
        leading={
          eventStartMs(event) !== null ? (
            <div className="w-11 h-11 border border-border rounded-lg bg-muted flex flex-col items-center justify-center gap-0.5">
              <span className="text-micro text-muted-foreground uppercase leading-none">
                {format(new Date(eventStartMs(event) as number), 'MMM').toUpperCase()}
              </span>
              <span className="text-h2 leading-none text-muted-foreground">
                {format(new Date(eventStartMs(event) as number), 'd')}
              </span>
            </div>
          ) : (
            // A cancelled event has nothing to announce, so TBA is false
            // here (unlike the live-event BD226 convention): a neutral empty
            // box, DraftedEventRow's treatment for a missing date.
            <div className="w-11 h-11 border border-dashed border-bevel-event/50 rounded-lg bg-background" />
          )
        }
        title={<h3 className="text-h3 line-clamp-1 text-muted-foreground">{event.title}</h3>}
        titleTrailing={<Badge variant="secondary">Cancelled</Badge>}
        meta={
          <EventTime
            event={{
              start_time: event.start_time,
              time_confirmed: event.time_confirmed,
              date_confirmed: event.date_confirmed,
            }}
            variant="datetime"
            notifyAction={false}
            className="text-meta text-muted-foreground"
          />
        }
      />
    </div>
  );
}
