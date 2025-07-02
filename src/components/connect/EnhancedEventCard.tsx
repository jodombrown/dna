
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { Calendar, MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types/search';

interface EnhancedEventCardProps {
  event: Event;
  onRegister: () => void;
  onEventClick: () => void;
  onCreatorClick?: (creatorId: string) => void;
}

const EnhancedEventCard: React.FC<EnhancedEventCardProps> = ({ 
  event, 
  onRegister, 
  onEventClick,
  onCreatorClick 
}) => {
  const getEventBanner = (eventTitle: string) => {
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

  const getCreatorImage = (creatorId: string) => {
    const images = [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1594736797933-d0c1ac17e5d3?w=100&h=100&fit=crop&crop=face'
    ];
    const index = parseInt(creatorId.substring(0, 2), 16) % images.length;
    return images[index];
  };

  const eventBanner = getEventBanner(event.title);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white border-0 shadow-md hover:-translate-y-1 w-full max-w-sm animate-fade-in"
          onClick={onEventClick}>
      <div className="relative">
        <img
          src={eventBanner}
          alt={event.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Creator on banner - top right */}
        {event.creator_profile && (
          <TouchFriendlyButton
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm hover:bg-dna-emerald hover:text-white transition-all p-1 h-auto min-h-0 border-white/50"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick?.(event.creator_profile.id);
            }}
          >
            <Avatar className="w-5 h-5 mr-1">
              <AvatarImage 
                src={getCreatorImage(event.creator_profile.id)} 
                alt={event.creator_profile.full_name}
                className="object-cover"
              />
              <AvatarFallback className="bg-dna-copper text-white text-xs">
                {event.creator_profile.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate max-w-[60px]">
              {event.creator_profile.full_name.split(' ')[0]}
            </span>
          </TouchFriendlyButton>
        )}

        {/* Virtual badge */}
        {event.is_virtual && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-dna-emerald/90 hover:bg-dna-emerald text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5 transition-colors">
              Virtual
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Type */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-dna-emerald transition-colors flex-1">
                {event.title}
              </h3>
              <Badge 
                variant="outline" 
                className="font-medium text-xs shrink-0 hover:bg-dna-mint hover:text-dna-forest hover:border-dna-mint transition-all"
              >
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
              <Calendar className="w-3.5 h-3.5 text-dna-copper" />
              <span>{event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-dna-emerald" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5 text-dna-gold" />
              <span>{event.attendee_count ?? 0} attending</span>
            </div>
          </div>

          {/* Register Button */}
          <TouchFriendlyButton 
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white font-medium py-2 rounded-lg transition-all text-sm mt-3 border-0"
            onClick={(e) => {
              e.stopPropagation();
              onRegister();
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Register for Event
          </TouchFriendlyButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedEventCard;
