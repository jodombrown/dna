/**
 * DNA | CONVENE — My Event Card (Hosting Tab)
 *
 * A thin composition over the `EventListRow` primitive. It owns the real
 * organizer logic — the draft / cancelled / past action branching, the share
 * and copy-link handlers, and the trailing `PastEventDiaNudge` — which is why
 * it stays a component rather than migrating into the page. Geometry belongs to
 * the primitive; this file only maps a hosted event onto the row's slots.
 *
 * BD176: the old four-thick left spine in the superseded Convene gold is gone.
 * A row is not a card; the list owns a hairline divider, and the date box (now
 * in the `--bevel-event` Convene copper) carries the C identity.
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Share2, Copy, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { EventTime } from '@/components/events/EventTime';
import { eventStartMs } from '@/lib/events/eventTime';
import { isEventCompleted } from '@/lib/events/lifecycle';
import { cn } from '@/lib/utils';
import { ConveneEventBadge } from './ConveneEventBadge';
import { getEventStatus } from '@/utils/convene/getEventStatus';
import { PastEventDiaNudge } from './PastEventDiaNudge';
import { EventListRow } from '@/components/cards/EventListRow';
import { EventPriceMeta } from '@/components/cards/EventPriceMeta';
import type { EventPriceTicketType } from '@/components/cards/resolveEventPrice';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useMobile';

interface MyEventCardEvent {
  id: string;
  title: string;
  slug?: string | null;
  start_time: string | null;
  time_confirmed?: boolean | null;
  date_confirmed?: boolean | null;
  end_time?: string | null;
  status?: string | null;
  max_attendees?: number | null;
  cover_image_url?: string | null;
  event_type?: string;
  format?: string;
  event_attendees?: Array<{ count: number }>;
  currency?: string | null;
  event_ticket_types?: EventPriceTicketType[];
}

interface MyEventCardProps {
  event: MyEventCardEvent;
  isPast?: boolean;
  className?: string;
  // Hosting cards select into the desktop third column instead of
  // navigating; attending cards always navigate. Defaults to 'hosting' —
  // the only lens this card is used from today.
  variant?: 'hosting' | 'attending';
}

export function MyEventCard({ event, isPast = false, className, variant = 'hosting' }: MyEventCardProps) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const attendeeCount = event.event_attendees?.[0]?.count ?? 0;
  // Canonical event state: `status` is the source of truth; the legacy
  // boolean mirror columns are trigger-derived and must not be read here.
  const eventStatus = event.status ?? 'published';
  const isCancelled = eventStatus === 'cancelled';
  const isDraft = eventStatus === 'draft';
  const isCompleted = isEventCompleted(event);
  const liveStatus =
    isCancelled || isDraft || isCompleted ? null : getEventStatus(event, attendeeCount);

  const startMs = eventStartMs(event);
  const startDate = startMs !== null ? new Date(startMs) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBA';
  const dayNumber = startDate ? format(startDate, 'd') : '·';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dna/convene/events/${event.slug || event.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Event link copied!');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dna/convene/events/${event.slug || event.id}`;
    if (navigator.share) {
      navigator.share({ title: event.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const navigateTo = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(path);
  };

  const eventPath = `/dna/convene/events/${event.slug || event.id}`;

  // Hosting, desktop: open in the third column instead of leaving the page.
  // Attending cards, and hosting on mobile, keep navigating to the full page.
  const selectOrNavigate = () => {
    if (variant === 'hosting' && !isMobile) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('event', event.id);
        return next;
      });
    } else {
      navigate(eventPath);
    }
  };

  const handleSelectOrNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectOrNavigate();
  };

  const registrationLabel = event.max_attendees
    ? `${attendeeCount}/${event.max_attendees} registered`
    : `${attendeeCount} registered`;

  // ── leading — the date box, the row's Convene anchor ─────────────
  const leading = (
    <div className="w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center">
      <span className="text-micro text-bevel-event uppercase leading-none">{monthAbbrev}</span>
      <span className="text-h2 leading-none mt-0.5">{dayNumber}</span>
    </div>
  );

  // ── titleTrailing — the lifecycle status badge ───────────────────
  const statusBadge = isCancelled ? (
    <Badge variant="destructive">Cancelled</Badge>
  ) : isCompleted ? (
    <Badge variant="secondary">Completed</Badge>
  ) : isDraft ? (
    <Badge variant="outline">Draft</Badge>
  ) : (
    liveStatus && <ConveneEventBadge status={liveStatus} />
  );

  // ── meta — the organizer's own card, so no Notify-me ─────────────
  const meta = (
    <div className="flex items-center justify-between gap-2">
      <p className="text-meta text-muted-foreground">
        <EventTime
          event={{
            start_time: event.start_time,
            time_confirmed: event.time_confirmed,
            date_confirmed: event.date_confirmed,
          }}
          variant="datetime"
          notifyAction={false}
        />
      </p>
      <EventPriceMeta
        ticketTypes={event.event_ticket_types}
        currency={event.currency}
        className="font-serif text-meta text-foreground shrink-0"
      />
    </div>
  );

  // ── body — registration count, then contextual actions ───────────
  const body = (
    <>
      <p className="text-meta text-muted-foreground mt-1">{registrationLabel}</p>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {isPast ? (
          <>
            <Button variant="outline" size="sm" onClick={navigateTo(eventPath)}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Recap
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share Recap
            </Button>
          </>
        ) : isCancelled ? (
          <Button variant="outline" size="sm" onClick={navigateTo('/dna/convene/events/new')}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Duplicate
          </Button>
        ) : isDraft ? (
          <Button variant="outline" size="sm" onClick={navigateTo(eventPath)}>
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit Draft
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleSelectOrNavigate}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Manage
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Link
            </Button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className={cn('space-y-2', className)}>
      <EventListRow
        onClick={selectOrNavigate}
        leading={leading}
        title={<h3 className="text-h3 line-clamp-1 text-foreground">{event.title}</h3>}
        titleTrailing={statusBadge}
        meta={meta}
        body={body}
      />

      {/* CONVENE → CONVEY nudge for past events */}
      {isPast && !isCancelled && (
        <PastEventDiaNudge eventId={event.id} eventTitle={event.title} variant="share_story" />
      )}
    </div>
  );
}
