// src/pages/dna/convene/ConveneDiscovery.tsx
// Redesigned Convene Hub — Luma-inspired, location-aware, content-dense discovery

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar, Plus, Search, Map, List, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Autoplay from 'embla-carousel-autoplay';

import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import { CuratedEventCard } from '@/components/convene/CuratedEventCard';
import { ConveneLocationSelector } from '@/components/convene/ConveneLocationSelector';
import { ConveneCategoryChips } from '@/components/convene/ConveneCategoryChips';
import { ConveneCitiesSection } from '@/components/convene/ConveneCitiesSection';
import { ConveneEventBadge } from '@/components/convene/ConveneEventBadge';
import { useConveneCities, useUserCity } from '@/hooks/convene/useConveneCities';
import { getEventStatus } from '@/utils/convene/getEventStatus';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { ConveneDIADiscoveryCard } from '@/components/convene/ConveneDIADiscoveryCard';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { logger } from '@/lib/logger';
import { ConveneSearchOverlay } from '@/components/convene/ConveneSearchOverlay';
import { cn } from '@/lib/utils';
import type { MapEventData } from '@/components/convene/ConveneEventPin';

const LazyMapView = lazy(() => import('@/components/convene/ConveneMapView'));

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state from URL ────────────────────────────
  const selectedCity = searchParams.get('city');
  const activeCategory = searchParams.get('category') || 'all';
  const viewMode = (searchParams.get('view') as 'list' | 'map') || 'list';
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Data hooks ───────────────────────────────────────
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

  // ── Featured Events Query ────────────────────────────
  const { data: featuredEvents = [] } = useQuery({
    queryKey: ['convene-featured-events', selectedCity],
    queryFn: async () => {
      try {
        let query = supabase
          .from('events')
          .select(`
            id, title, slug, start_time, end_time, location_name, location_city,
            location_lat, location_lng, description, short_description,
            cover_image_url, event_type, format, is_cancelled, max_attendees,
            organizer_id, is_curated, curated_source, curated_source_url,
            event_attendees(count)
          `)
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .eq('is_published', true)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(8);

        if (selectedCity) {
          query = query.ilike('location_city', selectedCity);
        }

        const { data, error } = await query;
        if (error) {
          logger.warn('ConveneDiscovery', 'Failed to fetch featured events:', error);
          return [];
        }

        // Fetch organizer profiles separately
        const organizerIds = [...new Set((data || []).map((e: Record<string, unknown>) => e.organizer_id).filter(Boolean))] as string[];
        let organizerMap: Record<string, { id: string; full_name: string; avatar_url: string | null; username: string | null }> = {};
        if (organizerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username')
            .in('id', organizerIds);
          if (profiles) {
            organizerMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
          }
        }

        return (data || []).map((e: Record<string, unknown>) => ({
          ...e,
          organizer: organizerMap[e.organizer_id as string] ?? null,
        }));
      } catch (error) {
        logger.warn('ConveneDiscovery', 'Error fetching featured events:', error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // ── All Upcoming Events Query (list view) ────────────
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['convene-upcoming-list', selectedCity, activeCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from('events')
          .select(`
            id, title, slug, start_time, end_time, location_name, location_city,
            location_lat, location_lng, description, short_description,
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

        if (selectedCity) {
          query = query.ilike('location_city', selectedCity);
        }
        if (activeCategory !== 'all') {
          query = query.eq('event_type', activeCategory as 'conference' | 'meetup' | 'networking' | 'other' | 'social' | 'webinar' | 'workshop');
        }

        const { data, error } = await query;
        if (error) return [];

        // Fetch organizer profiles separately
        const organizerIds = [...new Set((data || []).map((e: Record<string, unknown>) => e.organizer_id).filter(Boolean))] as string[];
        let organizerMap: Record<string, { id: string; full_name: string; avatar_url: string | null; username: string | null }> = {};
        if (organizerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username')
            .in('id', organizerIds);
          if (profiles) {
            organizerMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
          }
        }

        return (data || []).map((e: Record<string, unknown>) => ({
          ...e,
          organizer: organizerMap[e.organizer_id as string] ?? null,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  // ── Category Counts Query ────────────────────────────
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['convene-category-counts', selectedCity],
    queryFn: async () => {
      try {
        let query = supabase
          .from('events')
          .select('event_type')
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .eq('is_published', true)
          .gte('start_time', new Date().toISOString());

        if (selectedCity) {
          query = query.ilike('location_city', selectedCity);
        }

        const { data, error } = await query;
        if (error) return {};
        const counts: Record<string, number> = {};
        (data || []).forEach((e: { event_type: string | null }) => {
          const type = e.event_type || 'other';
          counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
      } catch {
        return {};
      }
    },
    staleTime: 120000,
  });

  // ── Map events (combine featured + upcoming, deduplicate) ──
  const mapEvents = useMemo((): MapEventData[] => {
    const seen = new Set<string>();
    const result: MapEventData[] = [];
    const allEvents = [...featuredEvents, ...upcomingEvents];
    for (const e of allEvents) {
      const event = e as Record<string, unknown>;
      const id = event.id as string;
      if (seen.has(id)) continue;
      seen.add(id);
      const lat = event.location_lat as number | null;
      const lng = event.location_lng as number | null;
      if (lat == null || lng == null) continue;
      const attendeesArr = event.event_attendees as Array<{ count: number }> | undefined;
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
        attendee_count: attendeesArr?.[0]?.count || 0,
      });
    }
    return result;
  }, [featuredEvents, upcomingEvents]);

  // ── Section heading ──────────────────────────────────
  const sectionHeading = useMemo(() => {
    if (selectedCity) return `Popular in ${selectedCity}`;
    if (userLocation?.city) return `Popular in ${userLocation.city}`;
    return 'Popular Events';
  }, [selectedCity, userLocation?.city]);

  return (
    <div className="w-full min-h-screen bg-background pb-bottom-nav md:pb-0">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════
            HEADER: Location selector + actions
            ═══════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Location selector */}
          <ConveneLocationSelector
            selectedCity={selectedCity}
            userCity={userLocation?.city ?? null}
            cities={cities}
            onCityChange={(city) => updateFilters({ city })}
          />

          {/* Right: Action icons */}
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
              aria-label={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
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

        {/* ═══════════════════════════════════════════════════
            CATEGORY CHIPS
            ═══════════════════════════════════════════════════ */}
        <ConveneCategoryChips
          activeCategory={activeCategory}
          onSelect={(cat) => updateFilters({ category: cat === 'all' ? null : cat })}
          counts={categoryCounts}
        />

        {/* ═══════════════════════════════════════════════════
            DIA DISCOVERY CARD — between chips and events
            ═══════════════════════════════════════════════════ */}
        <ConveneDIADiscoveryCard
          selectedCity={selectedCity}
          eventCount={featuredEvents.length}
          onOpenComposer={() => composer.open('event')}
          onSetCategory={(cat) => updateFilters({ category: cat })}
        />

        {/* ═══════════════════════════════════════════════════
            MAP VIEW (lazy loaded) or LIST VIEW
            ═══════════════════════════════════════════════════ */}
        {viewMode === 'map' ? (
          <Suspense fallback={<div className="h-[500px] md:h-[600px] animate-pulse bg-muted rounded-xl" />}>
            <LazyMapView
              events={mapEvents}
              selectedCity={selectedCity}
              onEventSelect={() => {}}
            />
          </Suspense>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════
                HAPPENING NOW
                ═══════════════════════════════════════════════ */}
            <HappeningNowSection />

            {/* ═══════════════════════════════════════════════
                FEATURED EVENTS CAROUSEL
                ═══════════════════════════════════════════════ */}
            {featuredEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Featured Events</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[hsl(var(--module-convene))] hover:text-[hsl(var(--module-convene-dark))] -mr-2"
                    onClick={() => navigate('/dna/convene/events')}
                  >
                    View All <ArrowRight className="ml-1 w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="relative px-0 sm:px-12">
                  <Carousel
                    className="w-full"
                    plugins={[
                      WheelGesturesPlugin(),
                      ...(prefersReducedMotion
                        ? []
                        : [
                            Autoplay({
                              delay: 5000,
                              stopOnInteraction: true,
                              stopOnMouseEnter: true,
                              playOnInit: true,
                            }),
                          ]),
                    ]}
                    opts={{ align: 'start', loop: true, dragFree: false }}
                    setApi={(api) => {
                      if (api) {
                        api.on('select', () => setActiveSlide(api.selectedScrollSnap()));
                      }
                    }}
                  >
                    <CarouselContent className="-ml-4">
                      {featuredEvents.map((event: Record<string, unknown>) => {
                        const attendeesArr = event.event_attendees as Array<{ count: number }> | undefined;
                        const status = getEventStatus(
                          {
                            start_time: event.start_time as string | undefined,
                            end_time: event.end_time as string | undefined,
                            max_attendees: event.max_attendees as number | undefined,
                            is_cancelled: event.is_cancelled as boolean | undefined,
                          },
                          attendeesArr?.[0]?.count || 0,
                        );
                        return (
                          <CarouselItem key={event.id as string} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                            <div className="h-[420px] relative">
                              {status && status.type !== 'free' && !event.is_curated && (
                                <div className="absolute top-3 right-3 z-10">
                                  <ConveneEventBadge status={status} />
                                </div>
                              )}
                              {event.is_curated ? (
                                <CuratedEventCard
                                  event={{
                                    id: event.id as string,
                                    title: event.title as string,
                                    description: event.description as string | undefined,
                                    short_description: event.short_description as string | undefined,
                                    start_time: event.start_time as string,
                                    end_time: event.end_time as string | undefined,
                                    location_city: event.location_city as string | undefined,
                                    cover_image_url: event.cover_image_url as string | undefined,
                                    format: event.format as string | undefined,
                                    slug: event.slug as string | undefined,
                                    curated_source: event.curated_source as string | undefined,
                                    curated_source_url: event.curated_source_url as string | undefined,
                                  }}
                                  variant="full"
                                />
                              ) : (
                                <ConveneEventCard
                                  event={{
                                    id: event.id as string,
                                    title: event.title as string,
                                    start_time: event.start_time as string,
                                    end_time: event.end_time as string | undefined,
                                    location_name: event.location_name as string | undefined,
                                    location_city: event.location_city as string | undefined,
                                    cover_image_url: event.cover_image_url as string | undefined,
                                    event_type: event.event_type as string | undefined,
                                    format: event.format as string | undefined,
                                    is_cancelled: event.is_cancelled as boolean | undefined,
                                    slug: event.slug as string | undefined,
                                    max_attendees: event.max_attendees as number | undefined,
                                    organizer: event.organizer as { id: string; full_name: string; avatar_url?: string; username?: string } | undefined,
                                    event_attendees: event.event_attendees as Array<{ count: number }> | undefined,
                                  }}
                                  variant="full"
                                  showOrganizer
                                  showMutualAttendees
                                />
                              )}
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-background shadow-lg border-2 hover:bg-[hsl(var(--module-convene))] hover:text-white hover:border-[hsl(var(--module-convene))] transition-all" />
                    <CarouselNext className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-background shadow-lg border-2 hover:bg-[hsl(var(--module-convene))] hover:text-white hover:border-[hsl(var(--module-convene))] transition-all" />
                  </Carousel>

                  {featuredEvents.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-4">
                      {featuredEvents.map((_: unknown, index: number) => (
                        <button
                          key={index}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            index === activeSlide
                              ? 'w-6 bg-[hsl(var(--module-convene))]'
                              : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                          )}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                UPCOMING EVENTS — Compact list cards
                ═══════════════════════════════════════════════ */}
            <div id="convene-upcoming-events" className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Upcoming Events</h3>

              {upcomingEvents.length === 0 ? (
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
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event: Record<string, unknown>) => (
                    event.is_curated ? (
                      <CuratedEventCard
                        key={event.id as string}
                        event={{
                          id: event.id as string,
                          title: event.title as string,
                          description: event.description as string | undefined,
                          short_description: event.short_description as string | undefined,
                          start_time: event.start_time as string,
                          end_time: event.end_time as string | undefined,
                          location_city: event.location_city as string | undefined,
                          cover_image_url: event.cover_image_url as string | undefined,
                          format: event.format as string | undefined,
                          slug: event.slug as string | undefined,
                          curated_source: event.curated_source as string | undefined,
                          curated_source_url: event.curated_source_url as string | undefined,
                        }}
                        variant="compact"
                      />
                    ) : (
                      <ConveneEventCard
                        key={event.id as string}
                        event={{
                          id: event.id as string,
                          title: event.title as string,
                          start_time: event.start_time as string,
                          end_time: event.end_time as string | undefined,
                          location_name: event.location_name as string | undefined,
                          location_city: event.location_city as string | undefined,
                          cover_image_url: event.cover_image_url as string | undefined,
                          event_type: event.event_type as string | undefined,
                          format: event.format as string | undefined,
                          is_cancelled: event.is_cancelled as boolean | undefined,
                          slug: event.slug as string | undefined,
                          max_attendees: event.max_attendees as number | undefined,
                          organizer: event.organizer as { id: string; full_name: string; avatar_url?: string | null; username?: string } | undefined,
                          event_attendees: event.event_attendees as Array<{ count: number }> | undefined,
                        }}
                        variant="compact"
                        showMutualAttendees
                      />
                    )
                  ))}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════
                EXPLORE CITIES
                ═══════════════════════════════════════════════ */}
            <ConveneCitiesSection
              cities={cities}
              onCitySelect={(city) => updateFilters({ city })}
              activeCity={selectedCity}
            />

            {/* ═══════════════════════════════════════════════
                YOUR UPCOMING + DIA SIDEBAR (desktop layout)
                ═══════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div className="space-y-8">
                <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
              </div>
              <div className="space-y-6">
                <DIAHubSection surface="convene_hub" limit={2} />
              </div>
            </div>
          </>
        )}
      </div>

      <ConveneSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileBottomNav />
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
