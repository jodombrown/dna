
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/hooks/useSearch';

interface EventsResultsProps {
  events: Event[];
}

const EventsResults: React.FC<EventsResultsProps> = ({
  events
}) => {
  if (events.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Events</h3>
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {event.type && (
                    <Badge variant="outline">{event.type}</Badge>
                  )}
                  {event.location && (
                    <span className="text-sm text-gray-500">
                      {event.location}
                    </span>
                  )}
                  {event.date_time && (
                    <span className="text-sm text-gray-500">
                      {new Date(event.date_time).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsResults;
