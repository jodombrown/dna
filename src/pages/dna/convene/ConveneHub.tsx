import React from 'react';
import { WelcomeStrip } from '@/components/convene/WelcomeStrip';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { YourCommunitiesSection } from '@/components/convene/YourCommunitiesSection';
import { EventsNearYouSection } from '@/components/convene/EventsNearYouSection';
import { FlagshipEventsSection } from '@/components/convene/FlagshipEventsSection';
import EventCategoriesSection from '@/components/connect/EventCategoriesSection';

const ConveneHub = () => {
  return (
    <div className="w-full h-full overflow-auto p-6">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Strip & Quick Actions */}
        <WelcomeStrip />

        {/* For You – Suggested Events (AI/ADIN) */}
        <EventRecommendations />

        {/* Your Upcoming Events (Hosting & Attending) */}
        <UpcomingEventsSection />

        {/* Your Communities & Their Upcoming Events */}
        <YourCommunitiesSection />

        {/* Events Near You */}
        <EventsNearYouSection />

        {/* Flagship DNA Events */}
        <FlagshipEventsSection />

        {/* Browse by Format & Theme */}
        <EventCategoriesSection />
      </div>
    </div>
  );
};

export default ConveneHub;
