
import React from 'react';
import LiveEventsSection from '../LiveEventsSection';
import { Event } from '@/types/search';

interface ConnectEventsTabProps {
  onEventClick?: (event: Event) => void;
  onRegisterEvent?: (event: Event) => void;
  onCreatorClick?: (creatorId: string) => void;
  onViewAll?: () => void;
}

const ConnectEventsTab: React.FC<ConnectEventsTabProps> = ({
  onEventClick = () => {},
  onRegisterEvent = () => {},
  onCreatorClick = () => {},
  onViewAll = () => {}
}) => {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Connect with your community through live events and real-time networking opportunities
        </p>
      </div>

      <LiveEventsSection 
        onEventClick={onEventClick}
        onRegisterEvent={onRegisterEvent}
        onCreatorClick={onCreatorClick}
        onViewAll={onViewAll}
      />
    </div>
  );
};

export default ConnectEventsTab;
