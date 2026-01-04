// src/pages/dna/convene/ConveneDiscovery.tsx
// Discovery mode for Convene hub - full events experience with PRD hub pattern

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Plus, Search, Users, CalendarDays, Sparkles } from 'lucide-react';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

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

export function ConveneDiscovery() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['convene-hub-stats', user?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all counts in parallel
      const [upcomingResult, myRsvpsResult, myHostingResult, thisWeekResult] = await Promise.all([
        // Upcoming events (public, not cancelled)
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .gte('start_time', now),
        
        // My RSVPs
        user?.id
          ? supabase
              .from('event_attendees')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'going')
          : Promise.resolve({ count: 0 }),
        
        // Events I'm hosting
        user?.id
          ? supabase
              .from('events')
              .select('*', { count: 'exact', head: true })
              .eq('organizer_id', user.id)
              .eq('is_cancelled', false)
          : Promise.resolve({ count: 0 }),
        
        // This week
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('is_cancelled', false)
          .eq('is_public', true)
          .gte('start_time', now)
          .lte('start_time', weekFromNow),
      ]);

      return {
        upcoming: upcomingResult.count || 0,
        myRsvps: myRsvpsResult.count || 0,
        hosting: myHostingResult.count || 0,
        thisWeek: thisWeekResult.count || 0,
      };
    },
    staleTime: 60000,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['convene-recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, start_time, location_name, cover_image_url')
        .eq('is_cancelled', false)
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    staleTime: 60000,
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
      onClick: () => navigate('/dna/convene/events/new'),
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
    onClick: () => navigate(`/dna/convene/events/${event.id}`),
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
        {/* Hero Section */}
        <HubHero
          hub="convene"
          icon={Calendar}
          title="CONVENE"
          tagline="Where the Diaspora Gathers"
          primaryAction={{
            label: 'Create Event',
            icon: Plus,
            onClick: () => navigate('/dna/convene/events/new'),
          }}
          secondaryAction={{
            label: 'Browse Events',
            icon: Search,
            onClick: () => navigate('/dna/convene/events'),
          }}
        />

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
            <UpcomingEventsSection />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
    </div>
  );
}

export default ConveneDiscovery;
