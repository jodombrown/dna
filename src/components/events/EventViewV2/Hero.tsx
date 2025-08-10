import React from 'react';
import { Event } from '@/types/eventTypes';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

interface EventHeroProps {
  event: Event;
}

const EventHero: React.FC<EventHeroProps> = ({ event }) => {
  const eventDate = new Date(event.date_time);
  const isVirtual = event.is_virtual;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
      {event.banner_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${event.banner_url})` }}
        />
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{event.type}</Badge>
            {isVirtual && <Badge variant="outline">Virtual Event</Badge>}
            {event.is_featured && <Badge variant="default">Featured</Badge>}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {event.title}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <div>
                <div className="font-medium text-foreground">
                  {format(eventDate, 'MMM d, yyyy')}
                </div>
                <div className="text-sm">
                  {format(eventDate, 'h:mm a')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5" />
              <div>
                <div className="font-medium text-foreground">
                  {isVirtual ? 'Virtual Event' : 'In Person'}
                </div>
                <div className="text-sm">
                  {isVirtual ? 'Online' : event.location || 'Location TBD'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5" />
              <div>
                <div className="font-medium text-foreground">
                  {event.attendee_count} attending
                </div>
                <div className="text-sm">
                  {event.max_attendees ? `of ${event.max_attendees} spots` : 'Unlimited spots'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <div>
                <div className="font-medium text-foreground">
                  2 hours
                </div>
                <div className="text-sm">
                  Duration
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;