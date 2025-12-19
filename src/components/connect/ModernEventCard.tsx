
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types/search';

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
  const getEventLogo = (eventTitle: string, eventType: string) => {
    if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop&crop=face';
    }
    if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop&crop=face';
    }
    if (eventTitle.toLowerCase().includes('health')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop&crop=face';
    }
    if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('leadership')) {
      return 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=face';
    }
    if (eventTitle.toLowerCase().includes('climate') || eventTitle.toLowerCase().includes('environment')) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&h=120&fit=crop&crop=face';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop&crop=face';
  };

  const getEventBanner = (eventTitle: string, eventType: string) => {
    if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
      return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=200&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('networking')) {
      return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=200&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('climate') || eventTitle.toLowerCase().includes('environment')) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=200&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
  };

  const eventLogo = getEventLogo(event.title, event.type || '');
  const eventBanner = event.banner_url || getEventBanner(event.title, event.type || '');
  const creatorImage = event.creator_profile?.avatar_url;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl hover:-translate-y-1 w-full h-full flex flex-col"
          onClick={() => onEventClick(event)}>
      <div className="relative">
        <img
          src={eventBanner}
          alt={event.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
          }}
        />
        
        {/* Creator on banner - top right */}
        {event.creator_profile && (
          <button
            className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-md hover:bg-dna-emerald/90 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium z-20"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick?.(event.creator_profile.id);
            }}
          >
            <Avatar className="w-5 h-5">
              <AvatarImage src={creatorImage} alt={event.creator_profile.full_name} />
              <AvatarFallback className="bg-dna-copper text-white text-xs">
                {(event.creator_profile.full_name || 'DN').split(' ').map(n => n[0]).join('') || 'DN'}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[60px] truncate">{event.creator_profile.full_name}</span>
          </button>
        )}

        {/* Event logo - bottom left overlap */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-xl border-3 border-white shadow-lg overflow-hidden bg-white">
            <img
              src={eventLogo}
              alt={`${event.title} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop&crop=face';
              }}
            />
          </div>
        </div>

        {/* Virtual badge */}
        {event.is_virtual && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-dna-emerald/90 text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5">
              Virtual
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="pt-8 pb-4 px-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {/* Title and Type */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-gray-900 truncate group-hover:text-dna-emerald transition-colors flex-1">
                {event.title}
              </h3>
              <Badge variant="outline" className="font-medium text-xs shrink-0">
                {event.type}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>
          
          {/* Event Details */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{event.attendee_count ?? 0} attending</span>
            </div>
          </div>
        </div>

        {/* Register Button - Always at bottom */}
        <Button 
          className="w-full bg-dna-emerald hover:bg-dna-forest text-white font-medium py-2 rounded-lg transition-all text-sm mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onRegisterEvent();
          }}
        >
          Click to Learn More
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModernEventCard;
