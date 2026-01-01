/**
 * UpcomingEventCard
 *
 * Displays an upcoming event from the community
 * for the Zero State discovery experience.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UpcomingEvent } from '@/types/zero-state';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface UpcomingEventCardProps {
  event: UpcomingEvent;
}

export function UpcomingEventCard({ event }: UpcomingEventCardProps) {
  const eventDate = event.start_date ? new Date(event.start_date) : null;
  const formattedDate = eventDate
    ? format(eventDate, 'MMM d, yyyy')
    : 'Date TBD';
  const formattedTime = eventDate
    ? format(eventDate, 'h:mm a')
    : '';

  const eventTypeLabel = event.event_type
    ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1).replace(/_/g, ' ')
    : 'Event';

  return (
    <Link to={`/dna/convene/${event.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
        {/* Cover Image */}
        {event.cover_image && (
          <div className="h-32 md:h-40 overflow-hidden bg-muted">
            <img
              src={event.cover_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Event Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-dna-purple/10 text-dna-purple border-0">
              <Calendar className="w-3 h-3 mr-1" />
              {eventTypeLabel}
            </Badge>
          </div>

          {/* Title */}
          <h3 className={`${TYPOGRAPHY.h5} text-foreground line-clamp-2 mb-3`}>
            {event.title}
          </h3>

          {/* Date & Location */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {formattedDate}
                {formattedTime && ` at ${formattedTime}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Attendees & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{event.attendee_count} attending</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
