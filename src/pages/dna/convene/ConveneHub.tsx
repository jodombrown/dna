import React from 'react';
import FullCanvasLayout from '@/layouts/FullCanvasLayout';
import { ConveneLeftNav } from '@/components/convene/ConveneLeftNav';
import { WelcomeStrip } from '@/components/convene/WelcomeStrip';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { FlagshipEventsSection } from '@/components/convene/FlagshipEventsSection';
import EventCategoriesSection from '@/components/connect/EventCategoriesSection';

const ConveneHub = () => {
  return (
    <FullCanvasLayout
      sidebar={<ConveneLeftNav />}
      sidebarWidth="20%"
      collapsible={true}
      content={
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Welcome Strip & Quick Actions */}
          <WelcomeStrip />

          {/* For You – Suggested Events (AI/ADIN) */}
          <EventRecommendations />

          {/* Your Upcoming Events (Hosting & Attending) */}
          <UpcomingEventsSection />

          {/* Flagship DNA Events */}
          <FlagshipEventsSection />

          {/* Browse by Format & Theme */}
          <EventCategoriesSection />
        </div>
      }
    />
  );
};

export default ConveneHub;
