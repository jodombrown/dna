/**
 * DNA | CONVENE: Discovery Hub (Redesigned)
 * Editorial discovery experience with Arrival Energy.
 * Hero → Pill Filter Bar → Named Discovery Lanes → Explore Cities
 *
 * Mobile-first: single column, horizontal-scroll lanes.
 * Desktop: AppShell's three-column frame: facets (context, 280) / lanes or
 * list (content) / Upcoming + DIA (related, 340). The shell fills the
 * viewport (no cap); the flat paginated list uses grid-cols-cards (BD333)
 * so its column count tracks the content column's own width, not the
 * viewport's - the viewport minus the rails is not the viewport.
 */

import React, { useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CalendarCheck, Plus, Search, Map, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import { ConveneEventSelectionContext } from '@/contexts/convene/ConveneEventSelectionContext';

import { AppShell } from '@/layouts/AppShell';
import { ConveneLocationSelector } from '@/components/convene/ConveneLocationSelector';
import { ConveneCitiesSection } from '@/components/convene/ConveneCitiesSection';
import { ConveneHeroEvent } from '@/components/convene/ConveneHeroEvent';
import { DiscoveryLane } from '@/components/convene/DiscoveryLane';
import { DiscoveryLaneRows } from '@/components/convene/DiscoveryLaneRows';
import { EventRowList } from '@/components/convene/EventRowList';
import { ConveneEventRow } from '@/components/convene/ConveneEventRow';
import { NearMeEventsLane } from '@/components/convene/NearMeEventsLane';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { ConveneDIADiscoveryCard } from '@/components/convene/ConveneDIADiscoveryCard';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { CONVENE_LENSES, ConveneTabStrip } from '@/components/convene/ConveneShell';
import { ConveneFacetRail } from '@/components/convene/ConveneFacetRail';
import { ConveneFacetRailCollapsed } from '@/components/convene/ConveneFacetRailCollapsed';
import { ConveneNarrowSheet } from '@/components/convene/ConveneNarrowSheet';
import { ConveneDiscoveryHeaderRow } from '@/components/convene/ConveneDiscoveryHeaderRow';
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
const LazyEventDetail = lazy(() => import('@/pages/dna/convene/EventDetail'));

/* ──────────────────────────────────────────────
   Section Divider: thin Copper line
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
  const { isMobile, isDesktop } = useMobile();

  const selectedCity = searchParams.get('city');
  // Host-agnostic EventDetail (BD-EventDetail-host-agnostic): selecting a card
  // writes ?event= instead of navigating away, and the related slot renders
  // EventDetail hosted, in place, beside the still-mounted list. Only wired at
  // desktop width (1024+, matching AppShell's own related-rail threshold) —
  // below that the context stays null so every card falls through to its
  // normal standalone-route navigate, and mobile stays pixel-for-pixel
  // unchanged even if ?event= is present on the URL (e.g. a stale/shared link).
  const selectedEventId = searchParams.get('event');
  // Route-driven lens (BD332b): the hub filters off ?lens=, the same param
  // the Lens bar writes at every width via ConveneTabStrip, mounted in
  // AppShell's `tabs` slot.
  const activePill = searchParams.get('lens') || 'all';
  const viewMode = (searchParams.get('view') as 'list' | 'map' | 'search') || 'list';
  // Search is a third view swapped into the content column (not a modal), so
  // its back affordance needs to know which view to return to. Tracked
  // outside the URL: refreshing mid-search has no "prior" view to recover,
  // so it falls back to list, same as landing on ?view=search cold.
  const lastContentViewRef = useRef<'list' | 'map'>(viewMode === 'map' ? 'map' : 'list');
  useEffect(() => {
    if (viewMode !== 'search') {
      lastContentViewRef.current = viewMode;
    }
  }, [viewMode]);

  // The six Browse facets (when/where/format/type/category/price), each one
  // lowercase snake_case URL key, folded from the old events index's filter set.
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
  // announced") lane, so the city picker draws from that same scope:
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

  // Selecting an event is a real navigation (a history entry, so back/forward
  // work), unlike a filter edit — so this writes ?event= directly rather than
  // going through updateFilters' replace:true.
  const selectHostedEvent = (slugOrId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('event', slugOrId);
    setSearchParams(next);
  };

  const handleFacetChange = (key: ConveneFacetKey, value: string) => {
    updateFilters({ [key]: value || null });
  };

  // Search is a history entry (push), matching selectHostedEvent, so a
  // browser back also lands where closeSearch would take it. Closing returns
  // to whichever of list/map was active before search opened.
  const openSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'search');
    setSearchParams(next);
  };
  const closeSearch = () => {
    updateFilters({ view: lastContentViewRef.current === 'map' ? 'map' : null });
  };

  // Lens and facet compose: a lens with a facet equivalent (this_week,
  // online) also writes the matching facet key on selection, so the member
  // can see and clear the narrowing from the Rail/Narrow sheet without
  // losing the lens's meaning. LensBar owns the ?lens= write itself (it is
  // shared across every C-surface), so this reacts to the transition rather
    // than intercepting the click, and never overwrites a facet the member
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
      // still holds exactly that value. If the member changed it since,
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
      // Online has no facet equivalent — it composes format IN ('virtual',
      // 'hybrid'), and two values can't collapse into one facet write — so,
      // like Curated by DNA and Network, it writes nothing here.
      if (activePill === 'this_week' && !currentValues.when) {
        updates.when = 'this_week';
      }

      if (Object.keys(updates).length > 0) {
        updateFilters(updates);
      }

      // Step 3: remember what this lens wrote (or null).
      if (activePill === 'this_week' && updates.when === 'this_week') {
        lensWroteRef.current = { key: 'when', value: 'this_week' };
      } else {
        lensWroteRef.current = null;
      }

      prevPillRef.current = activePill;
    }
    // Deliberately reacting to `activePill` alone: `searchParams` and
    // `updateFilters` change on every facet edit too, and re-running this
    // body then would just re-check the same guard and no-op, but listing
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

  // "Happening Near You" lane's events: diasporaEvents narrowed to the
  // member's own city. Shared between the card and row renderings of the
  // lane, so both stay in sync with the same set.
  const nearYouEvents = useMemo(
    () =>
      userLocation?.city
        ? diasporaEvents.filter(
            (e) =>
              e.location_city
                ?.toLowerCase()
                .includes(userLocation.city?.toLowerCase() ?? '') ?? false,
          )
        : [],
    [diasporaEvents, userLocation?.city],
  );

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
      //
      // BD480: virtual events ARE excluded here, outright — an event with no
      // physical location cannot be "near" anyone, so it never enters the Near
      // Me set in the first place, ahead of the distance call.
      if (activePill === 'near_me') query = query.neq('format', 'virtual');

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

  // Browse's flat, paginated list: every lens other than "all" with no
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

  // Below 1024, AppShell folds `related` beneath the list instead of dropping
  // it (Shell 03) — the one path that could put a hosted detail panel where
  // mobile has never had one. Gate on width here too, not just on the
  // entry-point context, so a stale/shared ?event= link on a phone still
  // renders today's Upcoming+DIA sidebar exactly as before (Exit gate 7).
  const showHostedDetail = isDesktop && !!selectedEventId;

  return (
    // Chrome (DNA header, composer bubble, bell, avatar, tabs) and the
    // three-column frame (facets / content / Upcoming+DIA) come from
    // AppShell: this page supplies the four slots and renders body only.
    <ConveneEventSelectionContext.Provider value={isDesktop ? selectHostedEvent : null}>
    <AppShell
      bubble={{
        kind: 'composer',
        placeholder: 'Host or find an event...',
        onClick: () => composer.open('event'),
      }}
      tabs={<ConveneTabStrip />}
      hostedDetail={showHostedDetail}
      context={
        showHostedDetail ? (
          <ConveneFacetRailCollapsed
            values={facetValues}
            onChange={handleFacetChange}
            countries={countries}
            categories={categoryTags}
          />
        ) : (
          <ConveneFacetRail
            values={facetValues}
            onChange={handleFacetChange}
            countries={countries}
            categories={categoryTags}
          />
        )
      }
      related={
        showHostedDetail ? (
          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
            <LazyEventDetail eventId={selectedEventId!} hosted />
          </Suspense>
        ) : (
          <div className="space-y-6">
            <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
            <DIAHubSection surface="convene_hub" limit={2} />
          </div>
        )
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
            <ConveneDiscoveryHeaderRow>
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
                  onClick={openSearch}
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
                    updateFilters({ view: viewMode === 'map' ? null : 'map' })
                  }
                  aria-label={viewMode === 'map' ? 'List view' : 'Map view'}
                >
                  {viewMode === 'map' ? (
                    <List className="w-4.5 h-4.5" />
                  ) : (
                    <Map className="w-4.5 h-4.5" />
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
              </div>
            </ConveneDiscoveryHeaderRow>

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
              onBackToList={() => updateFilters({ view: null })}
            />
          </Suspense>
        ) : viewMode === 'search' ? (
          /* SEARCH VIEW: swapped into the content column, same as list/map —
             never a fixed-position modal. Back returns to list or map. */
          <ConveneSearchOverlay onBack={closeSearch} />
        ) : (
          /* AppShell's content column: lanes (lens=all, no facets) or the
             flat, paginated list, plus Explore Cities. Facets and the
             Upcoming/DIA sidebar are AppShell's context and related rails. */
          <div className="space-y-4 md:space-y-6 min-w-0">
            {showDiscoveryLanes ? (
                /* ═══════════════════════════════════
                   DISCOVERY LANES: the resting state
                   ═══════════════════════════════════ */
                <>
                  {/* Happening Now: live pulse */}
                  <HappeningNowSection />

                  {/* HERO: Single commanding featured event */}
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
                      {showHostedDetail ? (
                        <DiscoveryLaneRows
                          title="Happening Near You"
                          events={nearYouEvents}
                          emptyMessage={`No events near ${userLocation.city} yet`}
                          onEventClick={(event) => selectHostedEvent(event.slug || event.id)}
                        />
                      ) : (
                        <DiscoveryLane
                          title="Happening Near You"
                          events={nearYouEvents}
                          emptyMessage={`No events near ${userLocation.city} yet`}
                          onSeeAll={() =>
                            navigate(
                              `/dna/convene/events?city=${userLocation.city}`,
                            )
                          }
                        />
                      )}
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: Your Network Is Going */}
                  {networkEvents.length > 0 && (
                    <>
                      {showHostedDetail ? (
                        <DiscoveryLaneRows
                          title="Your Network Is Going"
                          events={networkEvents}
                          onEventClick={(event) => selectHostedEvent(event.slug || event.id)}
                        />
                      ) : (
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
                      )}
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: This Weekend */}
                  {weekendEvents.length > 0 && (
                    <>
                      {showHostedDetail ? (
                        <DiscoveryLaneRows
                          title="This Weekend"
                          events={weekendEvents}
                          onEventClick={(event) => selectHostedEvent(event.slug || event.id)}
                        />
                      ) : (
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
                      )}
                      <CopperDivider />
                    </>
                  )}

                  {/* Lane: Across the Diaspora */}
                  {showHostedDetail ? (
                    <DiscoveryLaneRows
                      title="Across the Diaspora"
                      events={diasporaEvents}
                      emptyMessage="No upcoming events yet. Be the first to host one!"
                      onEventClick={(event) => selectHostedEvent(event.slug || event.id)}
                    />
                  ) : (
                    <DiscoveryLane
                      title="Across the Diaspora"
                      events={diasporaEvents}
                      onSeeAll={() => navigate('/dna/convene')}
                      emptyMessage="No upcoming events yet. Be the first to host one!"
                    />
                  )}

                  {/* Lane: Dates not yet announced: undated events live here,
                      never sorted into the timeline lanes above */}
                  {undatedEvents.length > 0 && (
                    <>
                      <CopperDivider />
                      {showHostedDetail ? (
                        <DiscoveryLaneRows
                          title="Dates not yet announced"
                          events={undatedEvents}
                          suppressDateTbc
                          onEventClick={(event) => selectHostedEvent(event.slug || event.id)}
                        />
                      ) : (
                        <DiscoveryLane
                          title="Dates not yet announced"
                          events={undatedEvents}
                          suppressDateTbc
                        />
                      )}
                    </>
                  )}

                  {/* Empty state: absolutely nothing */}
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
                   EVERY OTHER LENS + EVERY FACET:
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
                          {showHostedDetail ? (
                            /* A detail is hosted beside this column: rows,
                               same primitive as the lane sections above, so
                               the list never wraps against the panel. */
                            <EventRowList>
                              {browseList.events.map((event) => (
                                <ConveneEventRow
                                  key={event.id}
                                  event={event}
                                  onClick={() => selectHostedEvent(event.slug || event.id)}
                                />
                              ))}
                            </EventRowList>
                          ) : (
                            /* BD333: column count tracks the content column's own
                                width, not the viewport's; the column sits between
                                280px and 340px rails, so viewport breakpoints run
                                optimistic by however much the rails take. auto-fill
                                with a 280px content floor (grid-cols-cards,
                                tailwind.config.ts) fills whatever the column
                                actually measures. */
                            <div className="grid grid-cols-cards gap-4">
                              {browseList.events.map((event) => (
                                <ConveneEventCard
                                  key={event.id}
                                  event={event}
                                  showRsvp={!isEventCompleted(event)}
                                  onRsvp={() =>
                                    isDesktop
                                      ? selectHostedEvent(event.slug || event.id)
                                      : navigate(`/dna/convene/events/${event.slug || event.id}`)
                                  }
                                  onClick={() =>
                                    isDesktop
                                      ? selectHostedEvent(event.slug || event.id)
                                      : navigate(`/dna/convene/events/${event.slug || event.id}`)
                                  }
                                />
                              ))}
                            </div>
                          )}
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
                </>
              )}
          </div>
        )}
      </div>
    </AppShell>
    </ConveneEventSelectionContext.Provider>
  );
}

export default ConveneDiscovery;
