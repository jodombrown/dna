import React from 'react';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import { Event } from '@/types/search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TYPOGRAPHY } from '@/lib/typography.config';
import { cn } from '@/lib/utils';

interface EventListPanelProps {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  onEventClick: (event: Event) => void;
  onCreateEvent: () => void;
}

/**
 * EventListPanel - Left column event list for CONVENE_MODE
 * Displays scrollable list of upcoming events with selection state
 */
const EventListPanel: React.FC<EventListPanelProps> = ({
  events,
  selectedEvent,
  isLoading,
  onEventClick,
  onCreateEvent,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>Loading events...</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-12 px-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className={`${TYPOGRAPHY.h4} mb-2`}>No upcoming events</h3>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground mb-4`}>
            Be the first to host an event
          </p>
          <Button 
            variant="default"
            onClick={onCreateEvent} 
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Host an Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4">
        <div>
          <h2 className={TYPOGRAPHY.h3}>
            Upcoming Events ({events.length})
          </h2>
          <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground`}>
            Discover and join events in your network
          </p>
        </div>
        <Button 
          size="sm"
          onClick={onCreateEvent}
          className="bg-dna-emerald hover:bg-dna-forest text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Host
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-3 overflow-y-auto pr-2">
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          const eventDate = new Date(event.date_time);
          
          return (
            <Card 
              key={event.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-dna-emerald shadow-lg"
              )}
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Event Image/Icon */}
                  <div className="flex-shrink-0">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-dna-emerald to-dna-forest flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className={`${TYPOGRAPHY.h5} line-clamp-1`}>
                        {event.title}
                      </h4>
                      <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground line-clamp-2`}>
                        {event.description}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      {event.is_virtual && (
                        <Badge className="bg-dna-emerald text-white text-xs">
                          Virtual
                        </Badge>
                      )}
                    </div>

                    <div className={`${TYPOGRAPHY.caption} text-muted-foreground space-y-1`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {eventDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{event.attendee_count || 0} attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EventListPanel;
