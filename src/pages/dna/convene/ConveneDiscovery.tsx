// src/pages/dna/convene/ConveneDiscovery.tsx
// Redesigned Convene Hub — matches marketing page visual quality with authenticated features

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar, Plus, Search, Users, CalendarDays, Sparkles,
  ArrowRight, MapPin, Video, Globe, Mic, Palette, Briefcase,
  GraduationCap, Heart, Leaf, Landmark, Lightbulb,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { CulturalPattern } from '@/components/shared/CulturalPattern';
import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { HappeningNowSection } from '@/components/convene/HappeningNowSection';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Category Data ──────────────────────────────────────
const EVENT_CATEGORIES = [
  { id: 'conference', name: 'Conferences', icon: Mic, description: 'Summits, panels & keynotes' },
  { id: 'workshop', name: 'Workshops', icon: Lightbulb, description: 'Hands-on learning sessions' },
  { id: 'networking', name: 'Networking', icon: Users, description: 'Connect with your community' },
  { id: 'meetup', name: 'Meetups', icon: MapPin, description: 'Local & casual gatherings' },
  { id: 'webinar', name: 'Virtual Events', icon: Video, description: 'Online talks & panels' },
  { id: 'social', name: 'Cultural', icon: Palette, description: 'Arts, music & celebration' },
  { id: 'other', name: 'Business', icon: Briefcase, description: 'Investment & trade' },
];

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const composer = useUniversalComposer();

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Featured Events Query ────────────────────────────
  const { data: featuredEvents = [] } = useQuery({
    queryKey: ['convene-featured-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, title, slug, start_time, end_time, location_name, location_city,
            cover_image_url, event_type, format, is_cancelled,
            organizer_id, profiles!events_organizer_id_fkey(id, full_name, avatar_url, username),
            event_attendees(count)
          `)
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(8);

        if (error) {
          logger.warn('ConveneDiscovery', 'Failed to fetch featured events:', error);
          return [];
        }
        return (data || []).map((e: Record<string, unknown>) => ({
          ...e,
          organizer: Array.isArray(e.profiles) ? e.profiles[0] : e.profiles,
        }));
      } catch (error) {
        logger.warn('ConveneDiscovery', 'Error fetching featured events:', error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // ── Category Counts Query ────────────────────────────
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['convene-category-counts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('event_type')
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .gte('start_time', new Date().toISOString());

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dna/convene/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-10">

        {/* ═══════════════════════════════════════════════════
            SECTION 1: Hero — Rich visual with Kente pattern
            ═══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--module-convene)/0.15)] via-[hsl(var(--module-convene)/0.08)] to-transparent border border-[hsl(var(--module-convene)/0.2)]">
          <CulturalPattern pattern="kente" opacity={0.06} />
          <div className="relative z-10 py-10 sm:py-14 px-6 sm:px-10 flex flex-col items-center text-center space-y-5">
            {/* Module badge */}
            <Badge
              className="bg-[hsl(var(--module-convene)/0.15)] text-[hsl(var(--module-convene))] border-[hsl(var(--module-convene)/0.3)] hover:bg-[hsl(var(--module-convene)/0.2)] text-sm px-4 py-1"
              variant="outline"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              CONVENE
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Where the Diaspora Gathers
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Discover, host, and attend events that bring the global African community together — conferences, workshops, meetups, and more.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by name, location, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-background/80 backdrop-blur-sm border-border rounded-xl text-base"
              />
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                size="lg"
                className="bg-[hsl(var(--module-convene))] hover:bg-[hsl(var(--module-convene-dark))] text-white rounded-xl"
                onClick={() => composer.open('event')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Host an Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-[hsl(var(--module-convene)/0.3)] text-[hsl(var(--module-convene))] hover:bg-[hsl(var(--module-convene)/0.08)]"
                onClick={() => navigate('/dna/convene/events')}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            SECTION 1.5: Happening Now — Live events
            ═══════════════════════════════════════════════════ */}
        <HappeningNowSection />

        {/* ═══════════════════════════════════════════════════
            SECTION 2: Featured Events — Carousel with cover images
            ═══════════════════════════════════════════════════ */}
        {featuredEvents.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Events</h2>
                <p className="text-muted-foreground text-sm mt-1">Upcoming events from the community</p>
              </div>
              <Button
                variant="ghost"
                className="text-[hsl(var(--module-convene))] hover:text-[hsl(var(--module-convene-dark))]"
                onClick={() => navigate('/dna/convene/events')}
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
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
                    api.on('select', () => {
                      setActiveSlide(api.selectedScrollSnap());
                    });
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

              {/* Dot Indicators */}
              {featuredEvents.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {featuredEvents.map((_: unknown, index: number) => (
                    <button
                      key={index}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === activeSlide
                          ? 'w-6 bg-[hsl(var(--module-convene))]'
                          : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
            SECTION 3: Event Categories — Visual grid
            ═══════════════════════════════════════════════════ */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
            <p className="text-muted-foreground text-sm mt-1">Find events that match your interests</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {EVENT_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-[hsl(var(--module-convene)/0.4)] relative overflow-hidden"
                  onClick={() => navigate(`/dna/convene/events?category=${cat.id}`)}
                >
                  {/* Mudcloth pattern on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <CulturalPattern pattern="mudcloth" opacity={0.04} />
                  </div>
                  <CardContent className="p-4 sm:p-5 text-center relative">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--module-convene)/0.12)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-6 h-6 text-[hsl(var(--module-convene))]" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                    {count > 0 && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {count} event{count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            SECTION 4 + 5 + 6: Two-column layout
            ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Column */}
          <div className="space-y-8">

            {/* Section 4: Your Upcoming Events (authenticated) */}
            <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />

            {/* Section 5: DIA Recommendations */}
            <div className="relative overflow-hidden rounded-xl">
              <EventRecommendations />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* DIA Intelligence Cards with Adinkra pattern */}
            <div className="relative overflow-hidden rounded-xl">
              <CulturalPattern pattern="adinkra" opacity={0.06} />
              <div className="relative">
                <DIAHubSection surface="convene_hub" limit={2} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Quick Actions</h3>
              {[
                { label: 'Host an Event', icon: Plus, onClick: () => composer.open('event'), primary: true },
                { label: 'Browse Events', icon: Search, onClick: () => navigate('/dna/convene/events') },
                { label: 'My Events', icon: CalendarDays, onClick: () => navigate('/dna/convene/my-events') },
                { label: 'Groups', icon: Users, onClick: () => navigate('/dna/convene/groups') },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant={action.primary ? 'default' : 'outline'}
                  className={cn(
                    'w-full justify-start rounded-xl',
                    action.primary && 'bg-[hsl(var(--module-convene))] hover:bg-[hsl(var(--module-convene-dark))] text-white',
                  )}
                  onClick={action.onClick}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
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
