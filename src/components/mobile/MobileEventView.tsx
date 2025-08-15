import React from 'react';
import { Event } from '@/types/eventTypes';
import { useMobile } from '@/hooks/useMobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface MobileEventViewProps {
  event: Event;
}

const MobileEventView: React.FC<MobileEventViewProps> = ({ event }) => {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return null; // Only render on mobile
  }

  return (
    <div className="w-full space-y-4 overflow-x-hidden p-4">
      {/* Event Header */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <p className="text-gray-600">{event.description}</p>
            </div>
            
            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-dna-copper" />
                <span className="text-sm">{new Date(event.date_time).toLocaleDateString()}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-dna-copper" />
                  <span className="text-sm">{event.location}</span>
                </div>
              )}
              
              {event.max_attendees && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-dna-copper" />
                  <span className="text-sm">Max {event.max_attendees} attendees</span>
                </div>
              )}
            </div>
            
            {/* Event Type Badge */}
            <Badge variant="secondary" className="bg-dna-mint text-dna-forest">
              {event.type || 'Event'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Registration Action */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Join this event</h3>
            <Button 
              className="w-full bg-dna-copper hover:bg-dna-gold text-white"
              size="lg"
            >
              Register Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      {event.description && event.description.length > 100 && (
        <Card className="w-full">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">Event Details</h3>
            <div className="text-sm text-gray-600">
              <p>{event.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileEventView;