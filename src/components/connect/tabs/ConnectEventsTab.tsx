
import React from 'react';
import { Event } from '@/types/eventTypes';
import PopularEventsSection from '../PopularEventsSection';
import EventCategoriesSection from '../EventCategoriesSection';
import FeaturedCalendarsSection from '../FeaturedCalendarsSection';
import LocalEventsSection from '../LocalEventsSection';
import { useFeaturedEvents } from '@/hooks/useLiveEvents';

interface ConnectEventsTabProps {
  events?: Event[];
  onEventClick?: (event: Event) => void;
  onRegisterEvent?: (event: Event) => void;
  onCreatorClick?: (creatorId: string) => void;
  onViewAll?: () => void;
}

const ConnectEventsTab: React.FC<ConnectEventsTabProps> = ({
  events: propEvents,
  onEventClick = () => {},
  onRegisterEvent = () => {},
  onCreatorClick = () => {},
  onViewAll = () => {}
}) => {
  // Use prop events if provided, otherwise fetch from database
  const { data: fetchedEvents = [], isLoading } = useFeaturedEvents();
  const events = propEvents || fetchedEvents;

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explore, share, and create events near you, building meaningful connections through gatherings that matter
        </p>
      </div>

      {/* Popular Events Section */}
      <PopularEventsSection
        events={events}
        onEventClick={onEventClick}
        onRegisterEvent={onRegisterEvent}
        onCreatorClick={onCreatorClick}
        onViewAll={onViewAll}
      />

      {/* Browse by Category */}
      <EventCategoriesSection />

      {/* Featured Calendars */}
      <FeaturedCalendarsSection />

      {/* Explore Local Events */}
      <LocalEventsSection />
    </div>
  );
};

export default ConnectEventsTab;
