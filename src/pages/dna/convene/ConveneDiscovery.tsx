/**
 * DNA | CONVENE — Discovery Hub
 * Editorial discovery experience with Arrival Energy.
 * Hero → Filter Pills → Discovery Lanes → Explore Cities
 */

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar, Plus, Search, Map, List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ConveneLocationSelector } from '@/components/convene/ConveneLocationSelector';
import { ConveneCategoryChips } from '@/components/convene/ConveneCategoryChips';
import { ConveneCitiesSection } from '@/components/convene/ConveneCitiesSection';
import { ConveneHeroEvent } from '@/components/convene/ConveneHeroEvent';
import { DiscoveryLane } from '@/components/convene/DiscoveryLane';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { ConveneDIADiscoveryCard } from '@/components/convene/ConveneDIADiscoveryCard';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { useConveneCities, useUserCity } from '@/hooks/convene/useConveneCities';
import { useHeroEvent, useWeekendEvents, useNetworkEvents, useDiasporaEvents } from '@/hooks/convene/useConveneDiscoveryLanes';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { ConveneSearchOverlay } from '@/components/convene/ConveneSearchOverlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MapEventData } from '@/components/convene/ConveneEventPin';

const LazyMapView = lazy(() => import('@/components/convene/ConveneMapView'));

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCity = searchParams.get('city');
  const activeCategory = searchParams.get('category') || 'all';
  const viewMode = (searchParams.get('view') as 'list' | 'map') || 'list';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: cities = [] } = useConveneCities();
  const { data: userLocation } = useUserCity();

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

  // ── Discovery Lane Queries ─────────────────────────────
  const { data: heroEvent } = useHeroEvent(selectedCity);
  const { data: weekendEvents = [] } = useWeekendEvents(selectedCity);
  const { data: networkEvents = [] } = useNetworkEvents();

  // Collect IDs already shown to avoid duplication in "Across the Diaspora"
  const shownIds = useMemo(() => {
    const ids: string[] = [];
    if (heroEvent) ids.push(heroEvent.id);
    weekendEvents.forEach(e => ids.push(e.id));
    networkEvents.forEach(e => ids.push(e.id));
    return ids;
  }, [heroEvent, weekendEvents, networkEvents]);

  const { data: diasporaEvents = [] } = useDiasporaEvents(shownIds);

  // ── Category counts for chips ──────────────────────────
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['convene-category-counts', selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('event_type')
        .eq('is_cancelled', false)
        .eq('is_public', true)
        .eq('is_published', true)
        .gte('start_time', new Date().toISOString());
      if (selectedCity) query = query.ilike('location_city', selectedCity);
      const { data, error } = await query;
      if (error) return {};
      const counts: Record<string, number> = {};
      (data || []).forEach((e: { event_type: string | null }) => {
        const type = e.event_type || 'other';
        counts[type] = (counts[type] || 0) + 1;
      });
      return counts;
    },
    staleTime: 120_000,
  });

  // ── Filtered events for "all upcoming" when category filter is active ──
  const { data: filteredEvents = [] } = useQuery({
    queryKey: ['convene-filtered', selectedCity, activeCategory],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          id, title, slug, start_time, end_time, location_name, location_city,
          location_country, description, short_description,
          cover_image_url, event_type, format, is_cancelled, max_attendees,
          organizer_id, is_curated, curated_source, curated_source_url,
          event_attendees(count)
        `)
        .eq('is_cancelled', false)
        .eq('is_public', true)
        .eq('is_published', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (selectedCity) query = query.ilike('location_city', selectedCity);
      if (activeCategory !== 'all') {
        query = query.eq('event_type', activeCategory as 'conference' | 'meetup' | 'networking' | 'other' | 'social' | 'webinar' | 'workshop');
      }

      const { data, error } = await query;
      if (error) return [];

      // Attach organizers
      const organizerIds = [...new Set((data || []).map((e: Record<string, unknown>) => e.organizer_id).filter(Boolean))] as string[];
      let organizerMap: Record<string, { id: string; full_name: string; avatar_url: string | null; username: string | null }> = {};
      if (organizerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in('id', organizerIds);
        if (profiles) {
          organizerMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }
      return (data || []).map((e: Record<string, unknown>) => ({
        ...e,
        organizer: organizerMap[e.organizer_id as string] ?? null,
      }));
    },
    enabled: activeCategory !== 'all',
    staleTime: 60_000,
  });

  // ── Map events ─────────────────────────────────────────
  const mapEvents = useMemo((): MapEventData[] => {
    const seen = new Set<string>();
    const result: MapEventData[] = [];
    const allEvents = [...(heroEvent ? [heroEvent] : []), ...weekendEvents, ...networkEvents, ...diasporaEvents];
    for (const e of allEvents) {
      const event = e as Record<string, unknown>;
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
        start_time: event.start_time as string,
        end_time: (event.end_time as string | null) ?? null,
        location_name: (event.location_name as string | null) ?? null,
        location_city: (event.location_city as string | null) ?? null,
        location_lat: lat,
        location_lng: lng,
        cover_image_url: (event.cover_image_url as string | null) ?? null,
        event_type: (event.event_type as string | null) ?? null,
        format: (event.format as string | null) ?? null,
        max_attendees: (event.max_attendees as number | null) ?? null,
        attendee_count: (event.event_attendees as Array<{ count: number }> | undefined)?.[0]?.count || 0,
      });
    }
    return result;
  }, [heroEvent, weekendEvents, networkEvents, diasporaEvents]);

  const sectionHeading = useMemo(() => {
    if (selectedCity) return `Popular in ${selectedCity}`;
    if (userLocation?.city) return `Popular in ${userLocation.city}`;
    return 'Discover Events';
  }, [selectedCity, userLocation?.city]);

  // Whether to show discovery lanes (only in "all" category mode)
  const showDiscoveryLanes = activeCategory === 'all';

  return (
    <div className="w-full min-h-screen bg-background pb-bottom-nav md:pb-0">
      <div className="container max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-2 lg:py-6 space-y-5 lg:space-y-6">

        {/* ═══════════════════════════════════════════════
            HEADER: Location + Actions
            ═══════════════════════════════════════════════ */}
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
                viewMode === 'map' && 'bg-[hsl(var(--module-convene)/0.12)] text-[hsl(var(--module-convene))]',
              )}
              onClick={() => updateFilters({ view: viewMode === 'list' ? 'map' : null })}
              aria-label={viewMode === 'list' ? 'Map view' : 'List view'}
            >
              {viewMode === 'list' ? <Map className="w-4.5 h-4.5" /> : <List className="w-4.5 h-4.5" />}
            </Button>
            <Button
              size="sm"
              className="bg-[hsl(var(--module-convene))] hover:bg-[hsl(var(--module-convene-dark))] text-white rounded-full h-9 px-4"
              onClick={() => composer.open('event')}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Host</span>
            </Button>
          </div>
        </div>

        {/* Section heading */}
        <h2 className="text-xl font-bold text-foreground">{sectionHeading}</h2>

        {/* ═══════════════════════════════════════════════
            FILTER PILLS
            ═══════════════════════════════════════════════ */}
        <ConveneCategoryChips
          activeCategory={activeCategory}
          onSelect={(cat) => updateFilters({ category: cat === 'all' ? null : cat })}
          counts={categoryCounts}
        />

        {/* DIA Discovery Card */}
        <ConveneDIADiscoveryCard
          selectedCity={selectedCity}
          eventCount={
            showDiscoveryLanes
              ? (heroEvent ? 1 : 0) + weekendEvents.length + networkEvents.length + diasporaEvents.length
              : filteredEvents.length
          }
          onOpenComposer={() => composer.open('event')}
          onSetCategory={(cat) => updateFilters({ category: cat })}
        />

        {/* ═══════════════════════════════════════════════
            MAP VIEW or LIST/DISCOVERY VIEW
            ═══════════════════════════════════════════════ */}
        {viewMode === 'map' ? (
          <Suspense fallback={<div className="h-[500px] md:h-[600px] animate-pulse bg-muted rounded-xl" />}>
            <LazyMapView
              events={mapEvents}
              selectedCity={selectedCity}
              onEventSelect={() => {}}
            />
          </Suspense>
        ) : showDiscoveryLanes ? (
          /* ═══ DISCOVERY LANES MODE ═══ */
          <div className="space-y-8">
            {/* Happening Now */}
            <HappeningNowSection />

            {/* HERO — Single commanding featured event */}
            {heroEvent && <ConveneHeroEvent event={heroEvent} />}

            {/* Lane: Your Network Is Going */}
            <DiscoveryLane
              title="Your Network Is Going"
              events={networkEvents}
              showMutualAttendees
              onSeeAll={networkEvents.length > 3 ? () => navigate('/dna/convene/events?filter=network') : undefined}
            />

            {/* Lane: This Weekend */}
            <DiscoveryLane
              title="This Weekend"
              events={weekendEvents}
              onSeeAll={weekendEvents.length > 3 ? () => navigate('/dna/convene/events?filter=weekend') : undefined}
            />

            {/* Lane: Across the Diaspora */}
            <DiscoveryLane
              title="Across the Diaspora"
              events={diasporaEvents}
              onSeeAll={() => navigate('/dna/convene/events')}
            />

            {/* Empty state — no events at all */}
            {!heroEvent && weekendEvents.length === 0 && networkEvents.length === 0 && diasporaEvents.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  {selectedCity
                    ? `No upcoming events in ${selectedCity} yet. Be the first to host one!`
                    : 'No upcoming events found. Be the first to host one!'}
                </p>
                <Button
                  size="sm"
                  className="bg-[hsl(var(--module-convene))] hover:bg-[hsl(var(--module-convene-dark))] text-white"
                  onClick={() => composer.open('event')}
                >
                  <Plus className="w-4 h-4 mr-1" /> Host an Event
                </Button>
              </div>
            )}

            {/* Explore Cities */}
            <ConveneCitiesSection
              cities={cities}
              onCitySelect={(city) => updateFilters({ city })}
              activeCity={selectedCity}
            />

            {/* Your Upcoming + DIA sidebar (desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
              <div className="space-y-6">
                <DIAHubSection surface="convene_hub" limit={2} />
              </div>
            </div>
          </div>
        ) : (
          /* ═══ FILTERED CATEGORY MODE ═══ */
          <div className="space-y-6">
            <HappeningNowSection />

            <DiscoveryLane
              title={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Events`}
              events={filteredEvents as Record<string, unknown>[]}
              emptyMessage={`No ${activeCategory} events found. Try a different category or host one!`}
              onSeeAll={() => navigate(`/dna/convene/events?category=${activeCategory}`)}
            />

            <ConveneCitiesSection
              cities={cities}
              onCitySelect={(city) => updateFilters({ city })}
              activeCity={selectedCity}
            />
          </div>
        )}
      </div>

      <ConveneSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        successData={composer.successData}
        onSubmit={composer.submit}
        onDismissSuccess={composer.dismissSuccess}
      />
    </div>
  );
}

export default ConveneDiscovery;
