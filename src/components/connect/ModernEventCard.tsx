import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Video, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types/search';
import { format } from 'date-fns';

interface ModernEventCardProps {
  event: Event;
  onEventClick: (event: Event) => void;
  onRegisterEvent: () => void;
  onCreatorClick?: (creatorId: string) => void;
}

const ModernEventCard: React.FC<ModernEventCardProps> = ({ 
  event, 
  onEventClick, 
  onRegisterEvent,
  onCreatorClick 
}) => {
  // Use cover_image_url or generate placeholder
  const eventBanner = event.cover_image_url || event.banner_url || 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
  
  const creatorImage = event.creator_profile?.avatar_url;

  // Parse date from start_time (database) or date_time (legacy)
  const eventDate = event.start_time || event.date_time;
  const parsedDate = eventDate ? new Date(eventDate) : null;
  
  // Format location
  const getLocation = () => {
    if (event.format === 'virtual' || event.is_virtual) return 'Virtual Event';
    if (event.location_city && event.location_country) {
      return `${event.location_city}, ${event.location_country}`;
    }
    return event.location || event.location_name || 'Location TBA';
  };

  // Format icon
  const getFormatIcon = () => {
    const eventFormat = event.format;
    if (eventFormat === 'virtual' || event.is_virtual) return <Video className="w-3.5 h-3.5" />;
    if (eventFormat === 'hybrid') return <Globe className="w-3.5 h-3.5" />;
    return <MapPin className="w-3.5 h-3.5" />;
  };

  const getFormatLabel = () => {
    const eventFormat = event.format;
    if (eventFormat === 'virtual' || event.is_virtual) return 'Virtual';
    if (eventFormat === 'hybrid') return 'Hybrid';
    return 'In-Person';
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden bg-card hover:-translate-y-0.5 transition-all duration-300 w-full h-full flex flex-col"
      style={{ 
        border: '2px solid hsl(38, 92%, 50%)', 
        borderRadius: '12px' 
      }}
      onClick={() => onEventClick(event)}
    >
      {/* Cover Image with Date Badge */}
      <div className="relative">
        <img
          src={eventBanner}
          alt={event.title}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
          }}
        />
        
        {/* Date Badge Overlay - Bottom Left */}
        {parsedDate && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow-lg px-3 py-2 text-center min-w-[52px]">
            <div className="text-xs font-bold uppercase text-red-500">
              {format(parsedDate, 'MMM')}
            </div>
            <div className="text-xl font-bold text-foreground leading-tight">
              {format(parsedDate, 'd')}
            </div>
          </div>
        )}

        {/* Format Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className="bg-white/95 backdrop-blur-sm text-foreground border-0 shadow-sm text-xs px-2 py-1 gap-1"
          >
            {getFormatIcon()}
            {getFormatLabel()}
          </Badge>
        </div>
        
        {/* Creator on banner - top left */}
        {event.creator_profile && (
          <button
            className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-md hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5 text-xs font-medium z-20"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick?.(event.creator_profile.id);
            }}
          >
            <Avatar className="w-5 h-5">
              <AvatarImage src={creatorImage} alt={event.creator_profile.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(event.creator_profile.full_name || 'DN').split(' ').map(n => n[0]).join('') || 'DN'}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[80px] truncate">{event.creator_profile.full_name}</span>
          </button>
        )}
      </div>
      
      <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {/* Title and Type */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {event.title}
              </h3>
            </div>
            {event.type && (
              <Badge variant="outline" className="text-xs capitalize">
                {event.event_type || event.type}
              </Badge>
            )}
          </div>
          
          {/* Event Details */}
          <div className="space-y-1.5">
            {parsedDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {format(parsedDate, 'EEE, MMM d')} at {format(parsedDate, 'h:mm a')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{getLocation()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{event.attendee_count ?? 0} attending</span>
            </div>
          </div>
        </div>

        {/* RSVP Button - Amber */}
        <Button 
          className="w-full font-medium py-2 rounded-lg transition-all text-sm mt-4"
          style={{ 
            backgroundColor: 'hsl(38, 92%, 50%)', 
            color: 'white' 
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRegisterEvent();
          }}
        >
          RSVP Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModernEventCard;
