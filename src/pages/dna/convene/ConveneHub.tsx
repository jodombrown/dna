import React from 'react';
import LayoutController from '@/components/LayoutController';
import { ConveneLeftNav } from '@/components/convene/ConveneLeftNav';
import { ConveneRightWidgets } from '@/components/convene/ConveneRightWidgets';
import { WelcomeStrip } from '@/components/convene/WelcomeStrip';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { FlagshipEventsSection } from '@/components/convene/FlagshipEventsSection';
import EventCategoriesSection from '@/components/connect/EventCategoriesSection';

const ConveneHub = () => {
  return (
    <LayoutController
      leftColumn={<ConveneLeftNav />}
      rightColumn={<ConveneRightWidgets />}
    >
      <div className="space-y-8">
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
    </LayoutController>
  );
};

export default ConveneHub;
