import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon } from 'lucide-react';
import { Event } from '@/types/eventTypes';
import { format } from 'date-fns';

interface EventDetailsProps {
  event: Event;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const eventDate = new Date(event.date_time);

  return (
    <div className="space-y-6">
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About this event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(eventDate, 'EEEE, MMMM do, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(eventDate, 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {event.is_virtual ? 'Virtual Event' : event.location}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Organized by</p>
                <p className="text-sm text-muted-foreground">
                  {event.creator_profile?.full_name || event.creator_profile?.email || 'Unknown'}
                </p>
              </div>
            </div>
            
            <Badge variant="outline">{event.type}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agenda/Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5" />
            <span>Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample schedule - in real implementation, this would come from event data */}
            <div className="flex space-x-4">
              <div className="text-sm font-medium text-muted-foreground w-20">
                {format(eventDate, 'h:mm a')}
              </div>
              <div className="flex-1">
                <p className="font-medium">Event begins</p>
                <p className="text-sm text-muted-foreground">Welcome and introductions</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-center text-sm text-muted-foreground py-4">
              Detailed schedule will be shared with registered attendees
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetails;