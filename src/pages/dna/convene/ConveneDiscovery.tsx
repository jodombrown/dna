// src/pages/dna/convene/ConveneDiscovery.tsx
// Discovery mode for Convene hub - full events experience with PRD hub pattern

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Plus, Search, Users, CalendarDays, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { CulturalPattern } from '@/components/shared/CulturalPattern';
import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';

// New Hub Components
import {
  HubHero,
  HubStatsBar,
  HubQuickActions,
  HubDIAPanel,
  HubActivityFeed,
  HubSubNav,
  type HubStat,
  type QuickAction,
  type DIARecommendation,
  type ActivityItem,
  type SubNavTab,
} from '@/components/hubs/shared';

// Existing sections
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';

// DIA Card System (Sprint 4A)
import { DIAHubSection } from '@/components/dia/DIAHubSection';
import { logger } from '@/lib/logger';

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const composer = useUniversalComposer();

  // Fetch featured events (upcoming, with cover images, most registrations)
  const { data: featuredEvents = [] } = useQuery({
    queryKey: ['convene-featured-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, title, slug, start_time, end_time, location_name,
            cover_image_url, event_type, format, is_cancelled,
            organizer_id, profiles!events_organizer_id_fkey(id, full_name, avatar_url, username)
          `)
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .not('cover_image_url', 'is', null)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dna/convene/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fetch stats with error handling
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['convene-hub-stats', user?.id],
    queryFn: async () => {
      try {
        const now = new Date().toISOString();
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch all counts in parallel with individual error handling
        const [upcomingResult, myRsvpsResult, myHostingResult, thisWeekResult] = await Promise.all([
          // Upcoming events (public, not cancelled)
          supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('is_cancelled', false)
            .eq('is_public', true)
            .gte('start_time', now)
            .then(r => ({ count: r.error ? 0 : r.count })),
          
          // My RSVPs
          user?.id
            ? supabase
                .from('event_attendees')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'going')
                .then(r => ({ count: r.error ? 0 : r.count }))
            : Promise.resolve({ count: 0 }),
          
          // Events I'm hosting
          user?.id
            ? supabase
                .from('events')
                .select('id', { count: 'exact', head: true })
                .eq('organizer_id', user.id)
                .eq('is_cancelled', false)
                .then(r => ({ count: r.error ? 0 : r.count }))
            : Promise.resolve({ count: 0 }),
          
          // This week
          supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('is_cancelled', false)
            .eq('is_public', true)
            .gte('start_time', now)
            .lte('start_time', weekFromNow)
            .then(r => ({ count: r.error ? 0 : r.count })),
        ]);

        return {
          upcoming: upcomingResult.count || 0,
          myRsvps: myRsvpsResult.count || 0,
          hosting: myHostingResult.count || 0,
          thisWeek: thisWeekResult.count || 0,
        };
      } catch (error) {
        logger.warn('ConveneDiscovery', 'Failed to fetch stats:', error);
        return { upcoming: 0, myRsvps: 0, hosting: 0, thisWeek: 0 };
      }
    },
    staleTime: 60000,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch recent activity with error handling
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['convene-recent-activity'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, slug, title, start_time, location_name, cover_image_url')
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .gte('start_time', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          logger.warn('ConveneDiscovery', 'Failed to fetch recent activity:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        logger.warn('ConveneDiscovery', 'Error fetching recent activity:', error);
        return [];
      }
    },
    staleTime: 60000,
    retry: 1,
  });

  // Hub Stats
  const hubStats: HubStat[] = [
    {
      label: 'Upcoming Events',
      value: stats?.upcoming || 0,
      icon: Calendar,
      onClick: () => navigate('/dna/convene/events'),
    },
    {
      label: 'My RSVPs',
      value: stats?.myRsvps || 0,
      icon: Users,
      onClick: () => navigate('/dna/convene/events?filter=attending'),
    },
    {
      label: 'Hosting',
      value: stats?.hosting || 0,
      icon: Sparkles,
      onClick: () => navigate('/dna/convene/my-events'),
    },
    {
      label: 'This Week',
      value: stats?.thisWeek || 0,
      icon: CalendarDays,
      onClick: () => navigate('/dna/convene/events?range=week'),
    },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      label: 'Create Event',
      description: 'Host your own gathering',
      icon: Plus,
      onClick: () => composer.open('event'),
      variant: 'primary',
    },
    {
      label: 'Browse Events',
      description: 'Discover what\'s happening',
      icon: Search,
      onClick: () => navigate('/dna/convene/events'),
    },
    {
      label: 'My Calendar',
      description: 'View your schedule',
      icon: CalendarDays,
      onClick: () => navigate('/dna/convene/my-events'),
    },
    {
      label: 'My Events',
      description: 'Manage hosted events',
      icon: Users,
      onClick: () => navigate('/dna/convene/my-events'),
    },
  ];

  // DIA Recommendations
  const diaRecommendations: DIARecommendation[] = [
    {
      id: 'connections-attending',
      title: 'Events your connections are attending',
      description: 'See what events people in your network have RSVP\'d to',
      reason: 'Based on your network activity and event interests',
      icon: Users,
      onClick: () => navigate('/dna/convene/events?filter=network'),
    },
    {
      id: 'matching-interests',
      title: 'Events matching your interests',
      description: 'Events aligned with your profile tags and past attendance',
      reason: 'Based on your expertise and interest areas',
      icon: Sparkles,
      onClick: () => navigate('/dna/convene/events'),
    },
    {
      id: 'your-region',
      title: 'Events in your region',
      description: 'Local and virtual events focused on your area',
      reason: 'Based on your location settings',
      icon: Calendar,
      onClick: () => navigate('/dna/convene/events?filter=region'),
    },
  ];

  // Activity Feed items
  const activityItems: ActivityItem[] = (recentActivity || []).map(event => ({
    id: event.id,
    type: 'event',
    title: event.title,
    description: event.location_name || 'Virtual Event',
    timestamp: event.start_time,
    avatar: event.cover_image_url,
    icon: Calendar,
    onClick: () => navigate(`/dna/convene/events/${event.slug || event.id}`),
  }));

  // Sub Navigation Tabs
  const subNavTabs: SubNavTab[] = [
    { label: 'All Events', path: '/dna/convene/events' },
    { label: 'Attending', path: '/dna/convene/events?filter=attending' },
    { label: 'My Events', path: '/dna/convene/my-events' },
    { label: 'Groups', path: '/dna/convene/groups' },
  ];

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">
        {/* Hero Section with Kente pattern */}
        <div className="relative overflow-hidden rounded-xl">
          <CulturalPattern pattern="kente" opacity={0.06} />
          <HubHero
            hub="convene"
            icon={Calendar}
            title="CONVENE"
            tagline="Where the Diaspora Gathers"
            primaryAction={{
              label: 'Create Event',
              icon: Plus,
              onClick: () => composer.open('event'),
            }}
            secondaryAction={{
              label: 'Browse Events',
              icon: Search,
              onClick: () => navigate('/dna/convene/events'),
            }}
          />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by name, location, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border"
          />
        </form>

        {/* Featured Events (only if we have events with cover images) */}
        {featuredEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredEvents.map((event: Record<string, unknown>) => (
                <ConveneEventCard
                  key={event.id as string}
                  event={{
                    id: event.id as string,
                    title: event.title as string,
                    start_time: event.start_time as string,
                    end_time: event.end_time as string | undefined,
                    location_name: event.location_name as string | undefined,
                    cover_image_url: event.cover_image_url as string | undefined,
                    event_type: event.event_type as string | undefined,
                    format: event.format as string | undefined,
                    is_cancelled: event.is_cancelled as boolean | undefined,
                    slug: event.slug as string | undefined,
                    organizer: event.organizer as { id: string; full_name: string; avatar_url?: string; username?: string } | undefined,
                  }}
                  variant="full"
                  showOrganizer
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <HubStatsBar stats={hubStats} loading={statsLoading} />

        {/* Sub Navigation */}
        <HubSubNav tabs={subNavTabs} basePath="/dna/convene" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <HubQuickActions actions={quickActions} />

            {/* For You – DIA-powered recommendations */}
            <EventRecommendations />

            {/* Upcoming Events */}
            <UpcomingEventsSection onCreateEvent={() => composer.open('event')} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* DIA Intelligence Cards */}
            <DIAHubSection surface="convene_hub" limit={2} />

            {/* DIA Panel */}
            <HubDIAPanel
              hub="convene"
              recommendations={diaRecommendations}
              onAskDIA={() => navigate('/dna/dia?context=convene')}
            />

            {/* Recent Activity */}
            <HubActivityFeed
              title="Latest Events"
              items={activityItems}
              loading={activityLoading}
              onViewAll={() => navigate('/dna/convene/events')}
              emptyMessage="No upcoming events yet"
            />
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
