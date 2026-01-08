import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Video, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface EventData {
  id: string;
  title: string;
  date_time?: string | null;
  start_time?: string | null;
  location?: string | null;
  location_name?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  is_virtual?: boolean;
  format?: 'in_person' | 'virtual' | 'hybrid';
  attendee_count?: number;
  cover_image_url?: string;
}

interface EventCardProps {
  event: EventData;
  showInFeed?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showInFeed = false }) => {
  const eventDate = event.start_time || event.date_time;
  const parsedDate = eventDate ? new Date(eventDate) : null;
  const monthAbbrev = parsedDate ? format(parsedDate, 'MMM').toUpperCase() : '';
  const dayNumber = parsedDate ? format(parsedDate, 'd') : '';
  const dayOfWeek = parsedDate ? format(parsedDate, 'EEEE') : '';
  const fullDate = parsedDate ? format(parsedDate, 'MMMM d, yyyy') : '';
  const timeStr = parsedDate ? format(parsedDate, 'h:mm a') : '';

  const attendeeCount = event.attendee_count ?? 0;
  
  // Get location info - hide if not available
  const getLocationInfo = () => {
    const isVirtual = event.is_virtual || event.format === 'virtual';
    const isHybrid = event.format === 'hybrid';
    
    if (isVirtual) {
      return { icon: Video, text: 'Virtual Event' };
    }
    if (isHybrid) {
      const location = event.location || event.location_name || event.location_city;
      return { icon: Globe, text: location ? `Hybrid · ${location}` : 'Hybrid Event' };
    }
    
    // Build location string from available fields
    const locationParts = [
      event.location,
      event.location_name,
      event.location_city,
      event.location_country
    ].filter(Boolean);
    
    if (locationParts.length === 0) {
      return null; // Don't show location section at all
    }
    
    // Use the most specific location available
    const displayLocation = event.location || event.location_name || 
      [event.location_city, event.location_country].filter(Boolean).join(', ');
    
    return { icon: MapPin, text: displayLocation };
  };

  const locationInfo = getLocationInfo();

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer overflow-hidden group rounded-xl border-2" style={{ borderColor: 'hsl(38 92% 50%)' }}>
      {/* Cover Image - 2:1 aspect ratio */}
      {event.cover_image_url ? (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gradient-to-br from-amber-500/60 via-amber-600 to-amber-700/80 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-white/20" />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Event Title */}
        <h3 className="font-bold text-xl leading-tight mb-4 line-clamp-2 text-foreground">
          {event.title}
        </h3>

        {/* Date & Time - Luma-style */}
        {parsedDate && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold text-primary uppercase leading-none">
                {monthAbbrev}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">
                {dayNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{dayOfWeek}, {fullDate}</p>
              <p className="text-sm text-muted-foreground">{timeStr}</p>
            </div>
          </div>
        )}

        {/* Location - Only show if available */}
        {locationInfo && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex items-center justify-center">
              <locationInfo.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {locationInfo.text}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Attendees */}
        <div className="flex items-center pt-2">
          {attendeeCount > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeeCount} going</span>
            </div>
          ) : (
            <span className="text-sm text-primary font-medium">Be the first to register</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;