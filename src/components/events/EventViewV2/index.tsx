import React from 'react';
import { Event } from '@/types/eventTypes';
import { useMobile } from '@/hooks/useMobile';
import EventHero from './EventHero';
import EventDetails from './EventDetails';
import EventTicketPicker from './EventTicketPicker';
import EventSocialProof from './EventSocialProof';

interface EventViewV2Props {
  event: Event;
}

const EventViewV2: React.FC<EventViewV2Props> = ({ event }) => {
  const { isMobile, isTablet } = useMobile();
  
  // Force single column under 768px
  const forceColumn = isMobile || isTablet || window.innerWidth < 768;
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <EventHero event={event} />
      
      <div className="container mx-auto px-4 py-8">
        {forceColumn ? (
          // Single column layout for mobile/small devices
          <div className="w-full space-y-6">
            <EventTicketPicker event={event} />
            <EventDetails event={event} />
            <EventSocialProof event={event} />
          </div>
        ) : (
          // Multi-column layout for desktop
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <EventDetails event={event} />
              <EventSocialProof event={event} />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <EventTicketPicker event={event} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventViewV2;