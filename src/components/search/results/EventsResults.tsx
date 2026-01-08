import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { Event } from '@/hooks/useSearch';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface EventsResultsProps {
  events: Event[];
}

const EventsResults: React.FC<EventsResultsProps> = ({ events }) => {
  const navigate = useNavigate();

  if (events.length === 0) return null;

  const getLocationInfo = (event: Event) => {
    if (event.is_virtual) {
      return { icon: Video, text: 'Virtual Event' };
    }
    if (event.location) {
      return { icon: MapPin, text: event.location };
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Events</h3>
      {events.map((event) => {
        const eventDate = event.date_time;
        const parsedDate = eventDate ? new Date(eventDate) : null;
        const monthAbbrev = parsedDate ? format(parsedDate, 'MMM').toUpperCase() : '';
        const dayNumber = parsedDate ? format(parsedDate, 'd') : '';
        const fullDate = parsedDate ? format(parsedDate, 'MMMM d, yyyy') : '';
        const locationInfo = getLocationInfo(event);

        return (
          <Card 
            key={event.id} 
            className="hover:shadow-lg transition-all cursor-pointer overflow-hidden rounded-xl border-2"
            style={{ borderColor: 'hsl(38 92% 50%)' }}
            onClick={() => navigate(`/dna/convene/events/${event.id}`)}
          >
            <div className="flex">
              {/* Date Box */}
              {parsedDate && (
                <div className="flex-shrink-0 w-16 bg-muted flex flex-col items-center justify-center py-4">
                  <span className="text-xs font-semibold text-primary uppercase">
                    {monthAbbrev}
                  </span>
                  <span className="text-2xl font-bold">
                    {dayNumber}
                  </span>
                </div>
              )}
              
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                      {event.title}
                    </h3>
                    
                    {event.description && (
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center flex-wrap gap-3 mt-2">
                      {event.type && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      )}
                      
                      {locationInfo && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <locationInfo.icon className="h-3.5 w-3.5" />
                          <span>{locationInfo.text}</span>
                        </div>
                      )}
                      
                      {parsedDate && (
                        <span className="text-sm text-muted-foreground">
                          {fullDate}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dna/convene/events/${event.id}`);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsResults;