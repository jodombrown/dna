
import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types/search';

interface EventDetailsSectionProps {
  event: Event;
}

const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({ event }) => {
  // Update dates to July 2025 and beyond
  const getUpdatedEventDate = (eventTitle: string) => {
    if (eventTitle === "African Tech Summit 2024") {
      return new Date('2025-07-15T09:00:00');
    }
    if (eventTitle.toLowerCase().includes('investment')) {
      return new Date('2025-08-20T10:00:00');
    }
    if (eventTitle.toLowerCase().includes('women')) {
      return new Date('2025-09-12T14:00:00');
    }
    if (eventTitle.toLowerCase().includes('health')) {
      return new Date('2025-10-08T11:00:00');
    }
    return new Date('2025-07-25T15:00:00');
  };

  const eventDate = getUpdatedEventDate(event.title);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-gray-700">
        <Calendar className="w-5 h-5 text-dna-emerald" />
        <div>
          <div className="font-medium">
            {eventDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-500">
            {eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-700">
        <MapPin className="w-5 h-5 text-dna-emerald" />
        <div>
          <div className="font-medium">{event.location}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-700">
        <Users className="w-5 h-5 text-dna-emerald" />
        <div>
          <div className="font-medium">{event.attendee_count} attending</div>
          {event.max_attendees && (
            <div className="text-sm text-gray-500">
              {event.max_attendees - event.attendee_count} spots remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSection;
