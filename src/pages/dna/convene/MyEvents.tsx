import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, BarChart3, List, CalendarDays, Pencil, CircleSlash, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { AppShell } from '@/layouts/AppShell';
import { ViewSwitch } from '@/components/shell/ViewSwitch';
import { LensRail } from '@/components/shell/LensRail';
import { MyEventsChromeBar } from '@/components/convene/MyEventsChromeBar';
import { EventCalendarView } from '@/components/convene/EventCalendarView';
import { ConveneEventRow } from '@/components/convene/ConveneEventRow';
import { MyEventCard } from '@/components/convene/MyEventCard';
import { ManagingEventRow, DraftedEventRow, CancelledEventRow } from '@/components/convene/MyEventsStateRows';
import { LensEmpty } from '@/components/hubs/shared/LensEmpty';
import { EventOverviewPanel } from '@/components/convene/EventOverviewPanel';
import { EventListRow } from '@/components/cards/EventListRow';
import { EventPriceMeta } from '@/components/cards/EventPriceMeta';
import type { EventPriceTicketType } from '@/components/cards/resolveEventPrice';
import { EventRowList } from '@/components/convene/EventRowList';
import { MyEventsStatsHeader } from '@/components/convene/MyEventsStatsHeader';
import { PastEventDiaNudge } from '@/components/convene/PastEventDiaNudge';
import { MutualAttendeesLine } from '@/components/convene/MutualAttendeesLine';
import { CulturalPattern } from '@/components/shared/CulturalPattern';
import { useOrganizerStats } from '@/hooks/convene/useOrganizerStats';
import { EventTime } from '@/components/events/EventTime';
import { eventStartMs } from '@/lib/events/eventTime';
import { isEventCompleted } from '@/lib/events/lifecycle';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

// A managing-lens row: an event_roles record for the current user, joined to
// its event. `events` is null only if the row's event was deleted out from
// under it (a dangling FK is filtered before render, never rendered raw).
type ManagingRow = {
  role: string;
  event_id: string;
  events:
    | (Database['public']['Tables']['events']['Row'] & {
        event_attendees: Array<{ count: number }>;
        event_ticket_types: EventPriceTicketType[];
      })
    | null;
};

// The ticket-type columns resolveEventPrice needs — joined in the SAME
// select as the events, the way event_attendees(count) already is (BD111).
// One query per lens, never one per card.
const TICKET_TYPES_SELECT =
  'event_ticket_types(hidden, sales_start, sales_end, payment_type, price_cents, min_price_cents)';

// The list-row date box — the same 44×44 Convene anchor MyEventCard and
// ConveneEventRow carry (BD226). Dated → month abbrev over day number;
// undated → "TBA" over a middot in the SAME box, never an omitted box and
// never an invented date. The month/day gap rides on the flex parent, not a
// child margin, so the page layout gate stays green while the box still
// matches the reference rhythm.
function eventDateBox(event: Parameters<typeof eventStartMs>[0]) {
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

const MyEvents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const queryClient = useQueryClient();
  const { isDesktop } = useMobile();
  // View (list/calendar) and lens (attending/hosting) both live in the URL —
  // ViewSwitch owns ?view=, LensBar/LensRail own ?lens=. The page only reads.
  const viewMode = (searchParams.get('view') as 'list' | 'calendar') || 'list';
  const activeTab = searchParams.get('lens') || 'attending';
  // AppShell's related rail: a hosting card sets ?event= instead of
  // navigating away, same as MyEventCard's existing desktop-only wiring
  // (BD226). Gated on isDesktop, matching ConveneDiscovery's own hosted-detail
  // gate, so a stale/shared ?event= link on a phone still renders the plain
  // list — AppShell would otherwise fold `related` beneath `children` there.
  const selectedEventId = searchParams.get('event');
  const showEventPanel = isDesktop && !!selectedEventId;
  const [pastHostingOpen, setPastHostingOpen] = useState(false);
  const [cancelledHostingOpen, setCancelledHostingOpen] = useState(false);
  const [pastAttendingOpen, setPastAttendingOpen] = useState(false);

  // ── Organizer stats ──────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useOrganizerStats();

  // ── Hosting events ───────────────────────────────────
  const { data: hostingEvents = [], isLoading: hostingLoading } = useQuery({
    queryKey: ['hosting-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_attendees(count), ${TICKET_TYPES_SELECT}`)
        .eq('organizer_id', user.id)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Attending events ─────────────────────────────────
  const { data: attendingEvents = [], isLoading: attendingLoading } = useQuery({
    queryKey: ['attending-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id, status')
        .eq('user_id', user.id)
        .in('status', ['going', 'maybe']);
      if (attendeeError) throw attendeeError;
      if (!attendeeData || attendeeData.length === 0) return [];

      const eventIds = attendeeData.map((a) => a.event_id);
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`*, event_attendees(count), ${TICKET_TYPES_SELECT}`)
        .in('id', eventIds)
        .order('start_time', { ascending: true });
      if (eventsError) throw eventsError;

      return (
        events?.map((event) => ({
          ...event,
          rsvp_status: attendeeData.find((a) => a.event_id === event.id)?.status,
        })) || []
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Managing events ──────────────────────────────────
  // event_roles rows for the current user where they hold a role but are NOT
  // the organizer (the organizer already sees the event under Hosting).
  // event_roles has zero rows live, so this renders empty for everyone at
  // ship, that is correct, not a bug (BD455).
  const { data: managingRows = [], isLoading: managingLoading } = useQuery({
    queryKey: ['managing-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('event_roles')
        .select(`role, event_id, events(*, event_attendees(count), ${TICKET_TYPES_SELECT})`)
        .eq('user_id', user.id);
      if (error) throw error;
      const rows = (data || []) as unknown as ManagingRow[];
      return rows.filter(
        (row): row is ManagingRow & { events: NonNullable<ManagingRow['events']> } =>
          !!row.events && row.events.organizer_id !== user.id
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Drafted events ───────────────────────────────────
  // organizer_id = auth user AND lifecycle_state = 'draft': the canonical
  // column, not the trigger-mirrored `status`.
  const { data: draftedEvents = [], isLoading: draftedLoading } = useQuery({
    queryKey: ['drafted-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_attendees(count), ${TICKET_TYPES_SELECT}`)
        .eq('organizer_id', user.id)
        .eq('lifecycle_state', 'draft')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Cancelled events ─────────────────────────────────
  // organizer_id = auth user AND lifecycle_state = 'cancelled'.
  const { data: cancelledEvents = [], isLoading: cancelledLoading } = useQuery({
    queryKey: ['cancelled-lens-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_attendees(count), ${TICKET_TYPES_SELECT}`)
        .eq('organizer_id', user.id)
        .eq('lifecycle_state', 'cancelled')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Cancel RSVP mutation ─────────────────────────────
  const cancelRsvp = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attending-events'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-stats'] });
      toast.success('RSVP cancelled');
    },
  });

  // ── Derived data ─────────────────────────────────────
  // Hosting groups keyed on canonical `status` (the source of truth — the
  // legacy boolean mirrors are not read here). Order on the page: Drafts,
  // Published, Past/Completed, Cancelled.
  // All clock math is null-safe: an undated event (start_time null or
  // date_confirmed false) has NO place on a timeline — it gets its own
  // "Dates TBA" lane instead of sorting to 1970 and reading as "past".
  // Completed is DERIVED (isEventCompleted) — no scheduler ever writes
  // status='completed', so the clock is the source of truth.
  const now = new Date();
  const statusOf = (e: { status?: string | null }) => e.status ?? 'published';
  const byStartDesc = (a: { start_time?: string | null }, b: { start_time?: string | null }) =>
    (eventStartMs(b) ?? 0) - (eventStartMs(a) ?? 0);
  const draftHosting = useMemo(
    () => hostingEvents.filter((e) => statusOf(e) === 'draft'),
    [hostingEvents]
  );
  const publishedHosting = useMemo(
    () =>
      hostingEvents.filter((e) => {
        const start = eventStartMs(e);
        return statusOf(e) === 'published' && start !== null && start > now.getTime();
      }),
    [hostingEvents]
  );
  const undatedHosting = useMemo(
    () =>
      hostingEvents.filter((e) => statusOf(e) === 'published' && eventStartMs(e) === null),
    [hostingEvents]
  );
  const pastHosting = useMemo(
    () =>
      hostingEvents
        .filter((e) => {
          if (statusOf(e) === 'cancelled' || statusOf(e) === 'draft') return false;
          const start = eventStartMs(e);
          return (
            isEventCompleted(e, now) ||
            (statusOf(e) === 'published' && start !== null && start <= now.getTime())
          );
        })
        .sort(byStartDesc),
    [hostingEvents]
  );
  const cancelledHosting = useMemo(
    () => hostingEvents.filter((e) => statusOf(e) === 'cancelled'),
    [hostingEvents]
  );
  const upcomingAttending = useMemo(
    () =>
      attendingEvents.filter((e) => {
        const start = eventStartMs(e);
        return start !== null && start > now.getTime();
      }),
    [attendingEvents]
  );
  const undatedAttending = useMemo(
    () => attendingEvents.filter((e) => eventStartMs(e) === null && statusOf(e) !== 'cancelled'),
    [attendingEvents]
  );
  const pastAttending = useMemo(
    () =>
      attendingEvents
        .filter((e) => {
          const start = eventStartMs(e);
          return start !== null && start <= now.getTime();
        })
        .sort(byStartDesc),
    [attendingEvents]
  );

  return (
    // Chrome (DNA header, composer bubble, bell, avatar, tabs) and the
    // three-column frame (lens rail / content / hosted detail) come from
    // AppShell, the same pattern ConveneDiscovery established: this page
    // supplies the four slots and renders body only.
    <AppShell
      bubble={{
        kind: 'composer',
        placeholder: 'Host or find an event...',
        onClick: () => composer.open('event'),
      }}
      tabs={<MyEventsChromeBar />}
      context={
        <LensRail
          ariaLabel="My events"
          lenses={[
            { id: 'attending', label: 'Attending', icon: Calendar, count: attendingEvents.length },
            { id: 'hosting', label: 'Hosting', icon: BarChart3, count: hostingEvents.length },
            { id: 'managing', label: 'Managing', icon: Shield, count: managingRows.length },
            { id: 'drafted', label: 'Drafted', icon: Pencil, count: draftedEvents.length },
            { id: 'cancelled', label: 'Cancelled', icon: CircleSlash, count: cancelledEvents.length },
          ]}
        />
      }
      related={showEventPanel ? <EventOverviewPanel eventId={selectedEventId!} /> : undefined}
    >
      <div className="space-y-4 md:space-y-5">
          {/* ── Page Header ────────────────────────── */}
          <div className="hidden md:flex items-start sm:items-center justify-between gap-4 relative overflow-hidden rounded-xl p-5">
            <CulturalPattern pattern="kente" opacity={0.05} />
            <div className="relative z-10 flex flex-col gap-1">
              <h1 className="text-h1 font-display">My Events</h1>
              <p className="text-muted-foreground text-body">
                Manage events you're hosting and attending
              </p>
            </div>
            {/* Desktop view switch — trailing end of the header. Mobile uses
                the MyEventsChromeBar (AppShell's tabs slot) instead. */}
            <div className="relative z-10">
              <ViewSwitch
                ariaLabel="View"
                options={[
                  { id: 'list', label: 'List', icon: List },
                  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
                ]}
              />
            </div>
          </div>

          {/* ── Calendar View ──────────────────────── */}
          {viewMode === 'calendar' && (
            <EventCalendarView
              events={[...hostingEvents, ...attendingEvents]}
              onCreateEvent={() => composer.open('event')}
            />
          )}

          {/* ── List View ──────────────────────────── */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {/* ═══ HOSTING ═══ */}
              {activeTab === 'hosting' && (
                <div className="space-y-5">
                {/* Stats Header */}
                {(statsLoading || (stats && stats.eventsHosted > 0)) && (
                  <MyEventsStatsHeader stats={stats ?? { eventsHosted: 0, totalAttendees: 0, upcoming: 0 }} isLoading={statsLoading} />
                )}

                {/* Quick Actions — event creation lives in the header composer */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => navigate('/dna/convene/analytics')}>
                    <BarChart3 className="h-4 w-4 mr-1.5" />
                    Analytics
                  </Button>
                </div>

                {hostingLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading events...</p>
                ) : hostingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No events yet</p>
                      <p className="text-muted-foreground mb-4">
                        Host your first event and bring the diaspora together!
                      </p>
                      {/* dna-copper, not module-convene: white on the convene
                          gold is near-invisible, and copper is the CTA color
                          the contrast guard in index.css actually covers. */}
                      <Button
                        className="bg-dna-copper hover:bg-dna-copper-dark text-white"
                        onClick={() => composer.open('event')}
                      >
                        Create Your First Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Drafts — loudest group, these need the organizer */}
                    {draftHosting.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold">Drafts</h2>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-dna-warning/15 text-dna-warning border-dna-warning/30 font-semibold"
                          >
                            {draftHosting.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Not published yet — only you can see these.
                        </p>
                        <div className="divide-y divide-border">
                          {draftHosting.map((event) => (
                            <MyEventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Published (upcoming) */}
                    {publishedHosting.length > 0 && (
                      <section>
                        <h2 className="text-lg font-bold mb-3">
                          Published ({publishedHosting.length})
                        </h2>
                        <div className="divide-y divide-border">
                          {publishedHosting.map((event) => (
                            <MyEventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Dates TBA — undated events hold their own lane,
                        never sorted into the timeline above or below */}
                    {undatedHosting.length > 0 && (
                      <section>
                        <h2 className="text-lg font-bold mb-3">
                          Dates TBA ({undatedHosting.length})
                        </h2>
                        <div className="divide-y divide-border">
                          {undatedHosting.map((event) => (
                            <MyEventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Past/Completed (collapsible on mobile) */}
                    {pastHosting.length > 0 && (
                      <Collapsible open={pastHostingOpen} onOpenChange={setPastHostingOpen}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-2 w-full text-left group">
                            <h2 className="text-lg font-bold">Past ({pastHosting.length})</h2>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                pastHostingOpen && 'rotate-180'
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <EventRowList>
                            {pastHosting.map((event) => (
                              <MyEventCard key={event.id} event={event} isPast />
                            ))}
                          </EventRowList>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Cancelled (collapsible) */}
                    {cancelledHosting.length > 0 && (
                      <Collapsible open={cancelledHostingOpen} onOpenChange={setCancelledHostingOpen}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-2 w-full text-left group">
                            <h2 className="text-lg font-bold">
                              Cancelled ({cancelledHosting.length})
                            </h2>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                cancelledHostingOpen && 'rotate-180'
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <EventRowList>
                            {cancelledHosting.map((event) => (
                              <MyEventCard key={event.id} event={event} />
                            ))}
                          </EventRowList>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                )}
                </div>
              )}

              {/* ═══ ATTENDING ═══ */}
              {activeTab === 'attending' && (
                <div className="space-y-5">
                {attendingLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading events...</p>
                ) : attendingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No events yet</p>
                      <p className="text-muted-foreground mb-4">
                        You're not registered for any events yet.
                      </p>
                      <Button onClick={() => navigate('/dna/convene')}>Discover Events</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Upcoming attending */}
                    {upcomingAttending.length > 0 && (
                      <section>
                        <h2 className="text-lg font-bold mb-3">
                          Upcoming ({upcomingAttending.length})
                        </h2>
                        <div className="divide-y divide-border">
                          {upcomingAttending.map((event) => (
                            <EventListRow
                              key={event.id}
                              leading={eventDateBox(event)}
                              onClick={() =>
                                navigate(`/dna/convene/events/${event.slug || event.id}`)
                              }
                              title={
                                <h3 className="text-h3 line-clamp-1 text-foreground">
                                  {event.title}
                                </h3>
                              }
                              titleTrailing={
                                <EventTime
                                  event={event}
                                  variant="compact"
                                  notifyAction={false}
                                  className="text-meta text-muted-foreground"
                                />
                              }
                              meta={
                                <EventPriceMeta
                                  ticketTypes={event.event_ticket_types}
                                  currency={event.currency}
                                  className="block text-right font-display text-meta text-foreground"
                                />
                              }
                              body={
                                <div className="flex flex-col gap-3">
                                  <MutualAttendeesLine eventId={event.id} />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/dna/convene/events/${event.slug || event.id}`
                                        );
                                      }}
                                    >
                                      View Details
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelRsvp.mutate(event.id);
                                      }}
                                    >
                                      Cancel RSVP
                                    </Button>
                                  </div>
                                </div>
                              }
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Dates TBA — attending events whose dates aren't
                        announced yet; Notify me rides on the card */}
                    {undatedAttending.length > 0 && (
                      <section>
                        <h2 className="text-lg font-bold mb-3">
                          Dates TBA ({undatedAttending.length})
                        </h2>
                        <div className="divide-y divide-border">
                          {undatedAttending.map((event) => (
                            <ConveneEventRow
                              key={event.id}
                              event={event}
                              showMutualAttendees={false}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Past attending */}
                    {pastAttending.length > 0 && (
                      <Collapsible open={pastAttendingOpen} onOpenChange={setPastAttendingOpen}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-2 w-full text-left">
                            <h2 className="text-lg font-bold">Past ({pastAttending.length})</h2>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                pastAttendingOpen && 'rotate-180'
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <EventRowList>
                            {pastAttending.map((event) => (
                            <div key={event.id} className="space-y-2">
                              <EventListRow
                                leading={eventDateBox(event)}
                                onClick={() =>
                                  navigate(`/dna/convene/events/${event.slug || event.id}`)
                                }
                                title={
                                  <h3 className="text-h3 line-clamp-1 text-foreground">
                                    {event.title}
                                  </h3>
                                }
                                titleTrailing={
                                  <EventTime
                                    event={event}
                                    variant="compact"
                                    notifyAction={false}
                                    className="text-meta text-muted-foreground"
                                  />
                                }
                                meta={
                                  <EventPriceMeta
                                    ticketTypes={event.event_ticket_types}
                                    currency={event.currency}
                                    className="block text-right font-display text-meta text-foreground"
                                  />
                                }
                              />
                              <PastEventDiaNudge
                                eventId={event.id}
                                eventTitle={event.title}
                                variant="share_story"
                              />
                            </div>
                            ))}
                          </EventRowList>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                )}
                </div>
              )}

              {/* ═══ MANAGING ═══ */}
              {activeTab === 'managing' && (
                <div className="space-y-5">
                  {managingLoading ? (
                    <p className="text-center text-muted-foreground">Loading events...</p>
                  ) : managingRows.length === 0 ? (
                    <LensEmpty
                      icon={List}
                      title="No events to manage yet"
                      body="When an organizer adds you to their event's team, it shows up here."
                    />
                  ) : (
                    <div className="divide-y divide-border">
                      {managingRows.map((row) => (
                        <ManagingEventRow key={row.event_id} event={row.events} role={row.role} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ DRAFTED ═══ */}
              {activeTab === 'drafted' && (
                <div className="space-y-5">
                  {draftedLoading ? (
                    <p className="text-center text-muted-foreground">Loading events...</p>
                  ) : draftedEvents.length === 0 ? (
                    <LensEmpty
                      icon={Pencil}
                      title="No drafts"
                      body="Events you start but haven't published yet land here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {draftedEvents.map((event) => (
                        <DraftedEventRow key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ CANCELLED ═══ */}
              {activeTab === 'cancelled' && (
                <div className="space-y-5">
                  {cancelledLoading ? (
                    <p className="text-center text-muted-foreground">Loading events...</p>
                  ) : cancelledEvents.length === 0 ? (
                    <LensEmpty
                      icon={CircleSlash}
                      title="No cancelled events"
                      body="Events you cancel as organizer are kept here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {cancelledEvents.map((event) => (
                        <CancelledEventRow key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
      </div>
    </AppShell>
  );
};

export default MyEvents;
