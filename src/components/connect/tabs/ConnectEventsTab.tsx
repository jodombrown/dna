
import React from 'react';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
import PopularEventsSection from '../PopularEventsSection';
import EventCategoriesSection from '../EventCategoriesSection';
import FeaturedCalendarsSection from '../FeaturedCalendarsSection';
import LocalEventsSection from '../LocalEventsSection';
import { Event } from '@/types/search';

interface ConnectEventsTabProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onRegisterEvent: (event: Event) => void;
  onCreatorClick: (creatorId: string) => void;
  onViewAll: () => void;
}

const ConnectEventsTab: React.FC<ConnectEventsTabProps> = ({
  events,
  onEventClick,
  onRegisterEvent,
  onCreatorClick,
  onViewAll
}) => {
  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in">
      {/* Header with mobile-optimized spacing */}
      <div className="text-center px-4 sm:px-0">
        <ResponsiveHeading level={2} className="mb-3 sm:mb-4">
          Discover Events
        </ResponsiveHeading>
        <ResponsiveText size="lg" className="max-w-2xl mx-auto">
          Explore, share, and create events near you, building meaningful connections through 
          gatherings that matter
        </ResponsiveText>
      </div>

      {/* Popular Events with horizontal scrolling restored */}
      <PopularEventsSection 
        events={events}
        onEventClick={onEventClick}
        onRegisterEvent={onRegisterEvent}
        onCreatorClick={onCreatorClick}
        onViewAll={onViewAll}
      />

      {/* Event Categories - Luma-inspired design */}
      <EventCategoriesSection />

      {/* Featured Calendars */}
      <FeaturedCalendarsSection />

      {/* Local Events by Region */}
      <LocalEventsSection />
    </div>
  );
};

export default ConnectEventsTab;
