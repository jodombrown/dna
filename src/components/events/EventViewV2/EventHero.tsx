import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, UsersIcon, VideoIcon } from 'lucide-react';
import { Event } from '@/types/eventTypes';
import { format } from 'date-fns';

interface EventHeroProps {
  event: Event;
}

const EventHero: React.FC<EventHeroProps> = ({ event }) => {
  const eventDate = new Date(event.date_time);

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="h-[400px] bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={`${event.title} banner image`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content */}
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="text-white space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {event.type}
                </Badge>
                {event.is_featured && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-lg">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{format(eventDate, 'PPP p')}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {event.is_virtual ? (
                    <>
                      <VideoIcon className="w-5 h-5" />
                      <span>Virtual Event</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="w-5 h-5" />
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <UsersIcon className="w-5 h-5" />
                  <span>
                    {event.attendee_count} registered
                    {event.max_attendees && ` of ${event.max_attendees}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Image Overlay */}
      {event.image_url && !event.banner_url && (
        <Card className="absolute -bottom-16 left-8 w-32 h-32 overflow-hidden">
          <img
            src={event.image_url}
            alt={`${event.title} image`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Card>
      )}
    </div>
  );
};

export default EventHero;
