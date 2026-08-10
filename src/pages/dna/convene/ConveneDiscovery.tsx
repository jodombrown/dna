/**
 * DNA | CONVENE — Discovery Hub (Redesigned)
 * Editorial discovery experience with Arrival Energy.
 * Hero → Pill Filter Bar → Named Discovery Lanes → Explore Cities
 *
 * Mobile-first: single column, horizontal-scroll lanes.
 * Desktop: AppShell's three-column frame — facets (context, 280) / lanes or
 * list (content) / Upcoming + DIA (related, 340). The shell fills the
 * viewport (no cap); the flat paginated list uses grid-cols-cards (BD333)
 * so its column count tracks the content column's own width, not the
 * viewport's — the viewport minus the rails is not the viewport.
 */

import React, { useState, useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CalendarCheck, Plus, Search, Map, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMobile';

import { AppShell } from '@/layouts/AppShell';
import { ConveneLocationSelector } from '@/components/convene/ConveneLocationSelector';
import { ConveneCitiesSection } from '@/components/convene/ConveneCitiesSection';
import { ConveneHeroEvent } from '@/components/convene/ConveneHeroEvent';
import { DiscoveryLane } from '@/components/convene/DiscoveryLane';
import { NearMeEventsLane } from '@/components/convene/NearMeEventsLane';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { ConveneDIADiscoveryCard } from '@/components/convene/ConveneDIADiscoveryCard';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { CONVENE_LENSES, ConveneTabStrip } from '@/components/convene/ConveneShell';
import { ConveneFacetRail } from '@/components/convene/ConveneFacetRail';
import { ConveneNarrowSheet } from '@/components/convene/ConveneNarrowSheet';
import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import type { ConveneFacetKey, ConveneFacetValues } from '@/components/convene/ConveneFacetControls';
import { useConveneCities, useUserCity } from '@/hooks/convene/useConveneCities';
import { useConveneEventTags } from '@/hooks/convene/useConveneEventTags';
import { useConveneBrowseList } from '@/hooks/convene/useConveneBrowseList';
import {
  useHeroEvent,
  useWeekendEvents,
  useNetworkEvents,
  useDiasporaEvents,
  useUndatedEvents,
} from '@/hooks/convene/useConveneDiscoveryLanes';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { ConveneSearchOverlay } from '@/components/convene/ConveneSearchOverlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_PLACE_SELECT, pickEventPlace } from '@/lib/events/formatPlace';
import { EVENT_TIME_SELECT } from '@/lib/events/eventTime';
import { isEventCompleted } from '@/lib/events/lifecycle';
import type { MapEventData } from '@/components/convene/mapEventData';
import { ROUTES } from '@/config/routes';

const LazyMapView = lazy(() => import('@/components/convene/ConveneMapView'));

/* ──────────────────────────────────────────────
   Section Divider — thin Copper line
   ────────────────────────────────────────────── */
function CopperDivider() {
  return <div className="h-px bg-dna-copper/20" />;
}

/* ══════════════════════════════════════════════
   CONVENE DISCOVERY HUB
   ══════════════════════════════════════════════ */
export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const selectedCity = searchParams.get('city');
  // Route-driven lens (BD332b): the hub filters off ?lens=, the same param
  // the Lens bar writes at every width via ConveneTabStrip, mounted in
  // AppShell's `tabs` slot.
  const activePill = searchParams.get('lens') || 'all';
  const viewMode = (searchParams.get('view') as 'list' | 'map') || 'list';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // The six Browse facets — when/where/format/type/category/price — each one
  // lowercase snake_case URL key, folded from EventsIndex's filter set.
  const facetValues: ConveneFacetValues = {
    when: searchParams.get('when') || '',
    where: searchParams.get('where') || '',
    format: searchParams.get('format') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    price: searchParams.get('price') || '',
  };
  const hasActiveFacets = Object.values(facetValues).some(Boolean);

  // Discovery shows upcoming lanes plus the undated ("Dates not yet
  // announced") lane, so the city picker draws from that same scope —
  // an undated Accra event still puts Accra in the picker.
  const { data: cities = [] } = useConveneCities('upcoming');
  const { data: userLocation } = useUserCity();
  const { data: categoryTags = [] } = useConveneEventTags();

  const countries = useMemo(
    () => Array.from(new Set(cities.map((c) => c.country).filter((c): c is string => !!c))).sort(),
    [cities],
  );

  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace: true });
  };

  const handleFacetChange = (key: ConveneFacetKey, value: string) => {
    updateFilters({ [key]: value || null });
  };

  // Lens and facet compose: a lens with a facet equivalent (this_week,
  // online) also writes the matching facet key on selection, so the member
  // can see and clear the narrowing from the Rail/Narrow sheet without
  // losing the lens's meaning. LensBar owns the ?lens= write itself (it is
  // shared across every C-surface), so this reacts to the transition rather
  // than intercepting the click — and never overwrites a facet the member
  // has already set independently.
  const prevPillRef = useRef(activePill);
  // Tracks the {key, value} the CURRENT lens wrote via this effect, or null
  // if it wrote nothing (either it has no facet equivalent, or the member
  // already held that key). Used on the next transition to decide whether
  // this lens's writing is still "owned" by the lens (safe to clear) or the
  // member has since changed it (leave it alone).
  const lensWroteRef = useRef<{ key: ConveneFacetKey; value: string } | null>(null);
  useEffect(() => {
    if (prevPillRef.current !== activePill) {
      // Step 1: clear what the previous lens wrote, but only if the URL
      // still holds exactly that value — if the member changed it since,
      // leave it. Track the resulting value per key so step 2 sees it even
      // though `searchParams` itself won't update until the write below.
      const written = lensWroteRef.current;
      const updates: Record<string, string | null> = {};
      const currentValues: Record<string, string> = {
        when: searchParams.get('when') || '',
        format: searchParams.get('format') || '',
      };
      if (written && currentValues[written.key] === written.value) {
        updates[written.key] = null;
        currentValues[written.key] = '';
      }

      // Step 2: apply the new lens's facet, but never over a member-set value.
      if (activePill === 'this_week' && !currentValues.when) {
        updates.when = 'this_week';
      } else if (activePill === 'online' && !currentValues.format) {
        updates.format = 'virtual';
      }

      if (Object.keys(updates).length > 0) {
        updateFilters(updates);
      }

      // Step 3: remember what this lens wrote (or null).
      if (activePill === 'this_week' && updates.when === 'this_week') {
        lensWroteRef.current = { key: 'when', value: 'this_week' };
      } else if (activePill === 'online' && updates.format === 'virtual') {
        lensWroteRef.current = { key: 'format', value: 'virtual' };
      } else {
        lensWroteRef.current = null;
      }

      prevPillRef.current = activePill;
    }
    // Deliberately reacting to `activePill` alone: `searchParams` and
    // `updateFilters` change on every facet edit too, and re-running this
    // body then would just re-check the same guard and no-op — but listing
    // them keeps the linter's exhaustive-deps check honest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePill]);

  // ── Discovery Lane Queries ──────────────────────
  const { data: heroEvent } = useHeroEvent(selectedCity);
  const { data: weekendEvents = [] } = useWeekendEvents(selectedCity);
  const { data: networkEvents = [] } = useNetworkEvents();

  const shownIds = useMemo(() => {
    const ids: string[] = [];
    if (heroEvent) ids.push(heroEvent.id);
    weekendEvents.forEach((e) => ids.push(e.id));
    networkEvents.forEach((e) => ids.push(e.id));
    return ids;
  }, [heroEvent, weekendEvents, networkEvents]);

  const { data: diasporaEvents = [] } = useDiasporaEvents(shownIds);
  const { data: undatedEvents = [] } = useUndatedEvents();

  const showDiscoveryLanes = activePill === 'all' && !hasActiveFacets;
  // Near Me keeps its real-distance sort (NearMeEventsLane) as long as no
  // facet has narrowed it further; any facet composes it into the generic
  // paginated list below instead, same as every other lens.
  const useNearMeLane = activePill === 'near_me' && !hasActiveFacets;

  // ── Filtered events for the Near Me lane ──
  const { data: filteredEvents = [] } = useQuery({
    queryKey: ['convene-pill-filtered', selectedCity, activePill],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          id, title, slug, ${EVENT_TIME_SELECT}, ${EVENT_PLACE_SELECT},
          description, short_description,
          cover_image_url, event_type, format, is_cancelled, max_attendees,
          organizer_id, is_curated, curated_source, curated_source_url,
          event_attendees(count)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (selectedCity) query = query.ilike('location_city', selectedCity);

      // No server-side "near me" filter: the loaded upcoming set is reordered
      // client-side by rpc_events_near (real distance), not narrowed to a
      // single city string. See NearMeEventsLane.

      const { data, error } = await query;
      if (error) return [];

      // Attach organizers
      const organizerIds = [
        ...new Set(
          (data || [])
            .map((e) => e.organizer_id)
            .filter((id): id is string => !!id),
        ),
      ];
      let organizerMap: Record<
        string,
        { id: string; full_name: string; avatar_url: string | null; username: string | null }
      > = {};
      if (organizerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in('id', organizerIds);
        if (profiles) {
          organizerMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }
      return (data || []).map((e) => ({
        ...e,
        organizer: organizerMap[e.organizer_id ?? ''] ?? null,
      }));
    },
    enabled: useNearMeLane,
    staleTime: 60_000,
  });

  // ── Browse's flat, paginated list — every lens other than "all" with no
  // facets, and every facet narrowing, resolves here instead of lanes.
  const browseList = useConveneBrowseList(
    {
      lens: activePill,
      ...facetValues,
      city: selectedCity,
    },
    !showDiscoveryLanes && !useNearMeLane && activePill !== 'network',
  );

  // ── Map events ─────────────────────────────────
  const mapEvents = useMemo((): MapEventData[] => {
    const seen = new Set<string>();
    const result: MapEventData[] = [];
    const allEvents = [
      ...(heroEvent ? [heroEvent] : []),
      ...weekendEvents,
      ...networkEvents,
      ...diasporaEvents,
    ];
    for (const e of allEvents) {
      const event = e as unknown as Record<string, unknown>;
      const id = event.id as string;
      if (seen.has(id)) continue;
      seen.add(id);
      const lat = event.location_lat as number | null;
      const lng = event.location_lng as number | null;
      if (lat == null || lng == null) continue;
      result.push({
        id,
        title: event.title as string,
        slug: (event.slug as string | null) ?? null,
        start_time: event.start_time as string | null,
        end_time: (event.end_time as string | null) ?? null,
        time_confirmed: (event.time_confirmed as boolean | null) ?? null,
        date_confirmed: (event.date_confirmed as boolean | null) ?? null,
        ...pickEventPlace(event),
        location_lat: lat,
        location_lng: lng,
        cover_image_url: (event.cover_image_url as string | null) ?? null,
        event_type: (event.event_type as string | null) ?? null,
        format: (event.format as string | null) ?? null,
        max_attendees: (event.max_attendees as number | null) ?? null,
        attendee_count:
          (event.event_attendees as Array<{ count: number }> | undefined)?.[0]
            ?.count || 0,
      });
    }
    return result;
  }, [heroEvent, weekendEvents, networkEvents, diasporaEvents]);

  const sectionHeading = useMemo(() => {
    if (selectedCity) return `Events in ${selectedCity}`;
    if (userLocation?.city) return `Events near ${userLocation.city}`;
    return 'Discover Events';
  }, [selectedCity, userLocation?.city]);

  const totalCount = showDiscoveryLanes
    ? (heroEvent ? 1 : 0) +
      weekendEvents.length +
      networkEvents.length +
      diasporaEvents.length
    : useNearMeLane
      ? filteredEvents.length
      : browseList.events.length;

  return (
    // Chrome (DNA header, composer bubble, bell, avatar, tabs) and the
    // three-column frame (facets / content / Upcoming+DIA) come from
    // AppShell — this page supplies the four slots and renders body only.
    <>
    <AppShell
      bubble={{
        kind: 'composer',
        placeholder: 'Host or find an event...',
        onClick: () => composer.open('event'),
      }}
      tabs={<ConveneTabStrip />}
      context={
        <ConveneFacetRail
          values={facetValues}
          onChange={handleFacetChange}
          countries={countries}
          categories={categoryTags}
        />
      }
      related={
        <div className="space-y-6">
          <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
          <DIAHubSection surface="convene_hub" limit={2} />
        </div>
      }
    >
      <div className="space-y-3 md:space-y-4 lg:space-y-5">
        {/* ═══════════════════════════════════════
            MOBILE: MY EVENTS DOOR
            The fixed mobile header has no room for it, and without this
            the organizer's own events are unreachable from Convene on a
            phone.
            ═══════════════════════════════════════ */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => navigate(ROUTES.convene.myEvents)}
            >
              <CalendarCheck className="w-4 h-4 mr-1.5" />
              My Events
            </Button>
            <ConveneNarrowSheet
              values={facetValues}
              onChange={handleFacetChange}
              countries={countries}
              categories={categoryTags}
              activeCount={Object.values(facetValues).filter(Boolean).length}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════
            DESKTOP HEADER: Location + Actions
            ═══════════════════════════════════════ */}
        {!isMobile && (
          <>
            <div className="flex items-center justify-between gap-3">
              <ConveneLocationSelector
                selectedCity={selectedCity}
                userCity={userLocation?.city ?? null}
                cities={cities}
                onCityChange={(city) => updateFilters({ city })}
              />
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search events"
                >
                  <Search className="w-4.5 h-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-full',
                    viewMode === 'map' &&
                      'bg-dna-copper/12 text-dna-copper',
                  )}
                  onClick={() =>
                    updateFilters({ view: viewMode === 'list' ? 'map' : null })
                  }
                  aria-label={viewMode === 'list' ? 'Map view' : 'List view'}
                >
                  {viewMode === 'list' ? (
                    <Map className="w-4.5 h-4.5" />
                  ) : (
                    <List className="w-4.5 h-4.5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 px-4"
                  onClick={() => navigate(ROUTES.convene.myEvents)}
                >
                  <CalendarCheck className="w-4 h-4 mr-1" />
                  My Events
                </Button>
                <Button
                  size="sm"
                  className="bg-dna-copper hover:bg-dna-copper-dark text-white rounded-full h-9 px-4"
                  onClick={() => composer.open('event')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Host</span>
                </Button>
              </div>
            </div>

            <CopperDivider />
          </>
        )}

        {/* ═══════════════════════════════════════
            MAP VIEW
            ═══════════════════════════════════════ */}
        {viewMode === 'map' ? (
          <Suspense
            fallback={
              <div className="h-[500px] md:h-[600px] animate-pulse bg-muted rounded-xl" />
            }
          >
            <LazyMapView
              events={mapEvents}
              selectedCity={selectedCity}
              onEventSelect={() => {}}
            />
          </Suspense>
        ) : (
          /* AppShell's content column: lanes (lens=all, no facets) or the
             flat, paginated list, plus Explore Cities. Facets and the
             Upcoming/DIA sidebar are AppShell's context and related rails. */
          <div className="space-y-4 md:space-y-6 min-w-0">
            {showDiscoveryLanes ? (
                /* ═══════════════════════════════════
                   DISCOVERY LANES — the resting state
                   ═══════════════════════════════════ */
                <>
                  {/* Happening Now — live pulse */}
                  <HappeningNowSection />

                  {/* HERO — Single commanding featured event */}
                  {heroEvent && <ConveneHeroEvent event={heroEvent} />}

                  {heroEvent && <CopperDivider />}

                  {/* DIA Discovery Card */}
                  <ConveneDIADiscoveryCard
                    selectedCity={selectedCity}
                    eventCount={totalCount}
                    onOpenComposer={() => composer.open('event')}
                    onSetCategory={(cat) => updateFilters({ category: cat })}
                  />

                  {/* Lane: Happening Near You */}
                  {userLocation?.city && (
                    <>
                      <DiscoveryLane
                        title="Happening Near You"
                        events={diasporaEvents.filter(
                          (e) =>
                            e.location_city
                              ?.toLowerCase()
                              .includes(userLocation.city?.toLowerCase() ?? '') ??
                            false,
                        )}
                        emptyMessage={`No events near ${userLocation.city} yet`}
                        onSeeAll={() =>
                          navigate(
                            `/dna/convene/events?city=${userLocation.city}`,
                          )
                        }
                      />
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: Your Network Is Going */}
                  {networkEvents.length > 0 && (
                    <>
                      <DiscoveryLane
                        title="Your Network Is Going"
                        events={networkEvents}
                        showMutualAttendees
                        onSeeAll={
                          networkEvents.length > 3
                            ? () => updateFilters({ lens: 'network' })
                            : undefined
                        }
                      />
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: This Weekend */}
                  {weekendEvents.length > 0 && (
                    <>
                      <DiscoveryLane
                        title="This Weekend"
                        events={weekendEvents}
                        onSeeAll={
                          weekendEvents.length > 3
                            ? () =>
                                navigate(
                                  '/dna/convene/events?filter=weekend',
                                )
                            : undefined
                        }
                      />
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: Across the Diaspora */}
                  <DiscoveryLane
                    title="Across the Diaspora"
                    events={diasporaEvents}
                    onSeeAll={() => navigate('/dna/convene/events')}
                    emptyMessage="No upcoming events yet. Be the first to host one!"
                  />

                  {/* Lane: Dates not yet announced — undated events live here,
                      never sorted into the timeline lanes above */}
                  {undatedEvents.length > 0 && (
                    <>
                      <CopperDivider />
                      <DiscoveryLane
                        title="Dates not yet announced"
                        events={undatedEvents}
                        suppressDateTbc
                      />
                    </>
                  )}

                  {/* Empty state — absolutely nothing */}
                  {!heroEvent &&
                    weekendEvents.length === 0 &&
                    networkEvents.length === 0 &&
                    diasporaEvents.length === 0 && (
                      <div className="text-center pb-12 space-y-3">
                        <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                        <p className="text-muted-foreground text-body">
                          {selectedCity
                            ? `No upcoming events in ${selectedCity} yet. Be the first to host one!`
                            : 'No upcoming events found. Be the first to host one!'}
                        </p>
                        <Button
                          size="sm"
                          className="bg-dna-copper hover:bg-dna-copper-dark text-white"
                          onClick={() => composer.open('event')}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Host an Event
                        </Button>
                      </div>
                    )}

                  <CopperDivider />

                  {/* Explore Cities */}
                  <ConveneCitiesSection
                    cities={cities}
                    onCitySelect={(city) => updateFilters({ city })}
                    activeCity={selectedCity}
                  />
                </>
              ) : (
                /* ═══════════════════════════════════
                   EVERY OTHER LENS + EVERY FACET —
                   resolves into the flat list, in place.
                   ═══════════════════════════════════ */
                <>
                  <HappeningNowSection />

                  {useNearMeLane ? (
                    <NearMeEventsLane events={filteredEvents} />
                  ) : activePill === 'network' ? (
                    <DiscoveryLane
                      title="Your Network Is Going"
                      events={networkEvents}
                      showMutualAttendees
                      emptyMessage="None of your connections have RSVP'd to upcoming events yet."
                    />
                  ) : (
                    <section className="space-y-3">
                      <h3 className="text-h2 text-dna-forest">
                        {CONVENE_LENSES.find((l) => l.id === activePill)?.label ?? 'Events'}
                      </h3>
                      <div className="h-px bg-dna-copper/20" />

                      {browseList.isLoading ? (
                        <div className="grid grid-cols-cards gap-4">
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
                          ))}
                        </div>
                      ) : browseList.events.length === 0 ? (
                        <p className="text-body text-muted-foreground text-center">
                          No events found for this filter. Try another or host one!
                        </p>
                      ) : (
                        <>
                          {/* BD333: column count tracks the content column's own
                              width, not the viewport's — the column sits between
                              280px and 340px rails, so viewport breakpoints run
                              optimistic by however much the rails take. auto-fill
                              with a 240px floor (grid-cols-cards, tailwind.config.ts)
                              fills whatever the column actually measures. */}
                          <div className="grid grid-cols-cards gap-4">
                            {browseList.events.map((event) => (
                              <ConveneEventCard
                                key={event.id}
                                event={event}
                                showRsvp={!isEventCompleted(event)}
                                onRsvp={() => navigate(`/dna/convene/events/${event.slug || event.id}`)}
                                onClick={() => navigate(`/dna/convene/events/${event.slug || event.id}`)}
                              />
                            ))}
                          </div>
                          {browseList.hasMore && (
                            <div className="flex justify-center pt-2">
                              <Button
                                variant="outline"
                                onClick={() => browseList.loadMore()}
                                disabled={browseList.isFetchingMore}
                              >
                                {browseList.isFetchingMore ? 'Loading…' : 'Show More'}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </section>
                  )}

                  <ConveneCitiesSection
                    cities={cities}
                    onCitySelect={(city) => updateFilters({ city })}
                    activeCity={selectedCity}
                  />
                </>
              )}
          </div>
        )}
      </div>
    </AppShell>

    <ConveneSearchOverlay
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
    />
    </>
  );
}

export default ConveneDiscovery;
