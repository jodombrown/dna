
import React from 'react';
import { Event } from '@/types/search';

interface EventAboutSectionProps {
  event: Event;
}

const EventAboutSection: React.FC<EventAboutSectionProps> = ({ event }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">About Event</h3>
      <p className="text-gray-600 leading-relaxed">
        {event.description || "Join us for an incredible event that brings together the best minds in the African diaspora. This is your opportunity to network, learn, and contribute to meaningful conversations that shape our future."}
      </p>
      
      {event.title === "African Tech Summit 2024" && (
        <div className="space-y-3 text-gray-600">
          <p>
            The premier technology conference bringing together African innovators, entrepreneurs, and tech leaders from around the world. 
            Experience three days of inspiring keynotes, interactive workshops, and unparalleled networking opportunities.
          </p>
          <p>
            Whether you're a startup founder, seasoned tech executive, or aspiring innovator, this summit offers valuable insights 
            into the latest trends, emerging technologies, and investment opportunities across the African tech ecosystem.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventAboutSection;
