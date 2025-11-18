import React from 'react';
import { WelcomeStrip } from '@/components/convene/WelcomeStrip';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import { UpcomingEventsSection } from '@/components/convene/UpcomingEventsSection';
import { YourCommunitiesSection } from '@/components/convene/YourCommunitiesSection';
import { EventsNearYouSection } from '@/components/convene/EventsNearYouSection';
import { FlagshipEventsSection } from '@/components/convene/FlagshipEventsSection';
import { ConveneContextWidgets } from '@/components/convene/ConveneContextWidgets';
import EventCategoriesSection from '@/components/connect/EventCategoriesSection';
import { CreateLeadSection } from '@/components/convene/CreateLeadSection';

const ConveneHub = () => {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content Column */}
          <div className="space-y-8 min-w-0">
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

            {/* Create & Lead - Empty State Leadership Nudges */}
            <CreateLeadSection />
          </div>

          {/* Context Widgets Column (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block min-w-0">
            <div className="sticky top-6">
              <ConveneContextWidgets />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConveneHub;
