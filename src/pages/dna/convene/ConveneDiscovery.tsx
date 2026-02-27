// src/pages/dna/convene/ConveneDiscovery.tsx
// Redesigned Convene Hub — Luma-inspired, location-aware, content-dense discovery

import React, { useState, useMemo } from 'react';
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
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import { ConveneLocationSelector } from '@/components/convene/ConveneLocationSelector';
import { ConveneCategoryChips } from '@/components/convene/ConveneCategoryChips';
import { ConveneCitiesSection } from '@/components/convene/ConveneCitiesSection';
import { ConveneEventBadge } from '@/components/convene/ConveneEventBadge';
import { useConveneCities, useUserCity } from '@/hooks/convene/useConveneCities';
import { getEventStatus } from '@/utils/convene/getEventStatus';
import { formatEventTime } from '@/utils/convene/formatEventTime';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { MutualAttendeesLine } from '@/components/convene/MutualAttendeesLine';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const composer = useUniversalComposer();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state from URL ────────────────────────────
  const selectedCity = searchParams.get('city');
  const activeCategory = searchParams.get('category') || 'all';
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeSlide, setActiveSlide] = useState(0);

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
            cover_image_url, event_type, format, is_cancelled, max_attendees,
            organizer_id,
            event_attendees(count)
          `)
          .eq('is_cancelled', false)
          .eq('is_public', true)
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
            cover_image_url, event_type, format, is_cancelled, max_attendees,
            organizer_id,
            event_attendees(count)
          `)
          .eq('is_cancelled', false)
          .eq('is_public', true)
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

  // ── Section heading ──────────────────────────────────
  const sectionHeading = useMemo(() => {
    if (selectedCity) return `Popular in ${selectedCity}`;
    if (userLocation?.city) return `Popular in ${userLocation.city}`;
    return 'Popular Events';
  }, [selectedCity, userLocation?.city]);

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-0">
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
              onClick={() => navigate('/dna/convene/events')}
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
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
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
            HAPPENING NOW
            ═══════════════════════════════════════════════════ */}
        <HappeningNowSection />

        {/* ═══════════════════════════════════════════════════
            FEATURED EVENTS CAROUSEL
            ═══════════════════════════════════════════════════ */}
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
                  {featuredEvents.map((event: Record<string, unknown>) => (
                    <CarouselItem key={event.id as string} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div className="h-[420px]">
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
                      </div>
                    </CarouselItem>
                  ))}
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

        {/* ═══════════════════════════════════════════════════
            UPCOMING EVENTS — Compact list cards
            ═══════════════════════════════════════════════════ */}
        <div className="space-y-4">
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
              {upcomingEvents.map((event: Record<string, unknown>) => {
                const attendeeCount = (event.event_attendees as Array<{ count: number }>)?.[0]?.count ?? 0;
                const status = getEventStatus(
                  {
                    start_time: event.start_time as string | undefined,
                    end_time: event.end_time as string | undefined,
                    is_cancelled: event.is_cancelled as boolean | undefined,
                    max_attendees: event.max_attendees as number | undefined,
                  },
                  attendeeCount,
                );
                const organizer = event.organizer as { id?: string; full_name: string; avatar_url?: string | null; username?: string } | undefined;

                return (
                  <div
                    key={event.id as string}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-[hsl(var(--module-convene)/0.3)] bg-card hover:bg-accent/30 cursor-pointer transition-all group"
                    onClick={() => navigate(`/dna/convene/events/${(event.slug as string) || (event.id as string)}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/dna/convene/events/${(event.slug as string) || (event.id as string)}`);
                      }
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="w-[60px] h-[60px] rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--module-convene)/0.1)]">
                      {(event.cover_image_url as string) ? (
                        <img
                          src={event.cover_image_url as string}
                          alt={event.title as string}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[hsl(var(--module-convene)/0.5)]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm leading-tight line-clamp-1 text-foreground group-hover:text-[hsl(var(--module-convene))] transition-colors">
                        {event.title as string}
                      </h4>

                      {/* Organizer */}
                      {organizer && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {organizer.full_name}
                        </p>
                      )}

                      {/* Time + Location */}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatEventTime(event.start_time as string | undefined, event.end_time as string | undefined)}
                        {(event.location_city as string) && (
                          <> · {event.location_city as string}</>
                        )}
                        {!(event.location_city as string) && (event.format as string) === 'virtual' && (
                          <> · Virtual</>
                        )}
                      </p>

                      {/* Mutual attendees */}
                      <MutualAttendeesLine eventId={event.id as string} />
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0 pt-0.5">
                      {status && <ConveneEventBadge status={status} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            EXPLORE CITIES
            ═══════════════════════════════════════════════════ */}
        <ConveneCitiesSection
          cities={cities}
          onCitySelect={(city) => updateFilters({ city })}
          activeCity={selectedCity}
        />

        {/* ═══════════════════════════════════════════════════
            YOUR UPCOMING + DIA SIDEBAR (desktop layout)
            ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
          </div>
          <div className="space-y-6">
            <DIAHubSection surface="convene_hub" limit={2} />
          </div>
        </div>
      </div>

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
