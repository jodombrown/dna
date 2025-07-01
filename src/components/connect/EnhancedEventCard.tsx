
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, Video, ExternalLink } from 'lucide-react';
import { Event } from '@/types/search';
import { format } from 'date-fns';

interface EnhancedEventCardProps {
  event: Event;
  onRegister: () => void;
  onEventClick: () => void;
  onCreatorClick: (creatorId: string) => void;
}

const EnhancedEventCard: React.FC<EnhancedEventCardProps> = ({
  event,
  onRegister,
  onEventClick,
  onCreatorClick
}) => {
  const eventDate = new Date(event.date_time);
  const isUpcoming = eventDate > new Date();
  
  const getEventTypeColor = (type: string) => {
    const colors = {
      'Conference': 'bg-blue-500',
      'Workshop': 'bg-green-500',
      'Webinar': 'bg-purple-500',
      'Meetup': 'bg-orange-500',
      'Investment Forum': 'bg-yellow-500',
      'Cultural Event': 'bg-pink-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md relative overflow-hidden cursor-pointer" onClick={onEventClick}>
      {/* Event banner */}
      {event.banner_url && (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={event.banner_url} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Event type badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getEventTypeColor(event.type || '')} text-white shadow-md`}>
              {event.type}
            </Badge>
          </div>
          
          {/* Featured badge */}
          {event.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-dna-gold text-white shadow-md">
                Featured
              </Badge>
            </div>
          )}

          {/* Virtual indicator */}
          {event.is_virtual && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-dna-emerald text-white shadow-md">
                <Video className="w-3 h-3 mr-1" />
                Virtual
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-dna-forest transition-colors line-clamp-2">
            {event.title}
          </h3>
          
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
            {event.description}
          </p>
        </div>

        {/* Event details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-dna-emerald flex-shrink-0" />
            <span>{format(eventDate, 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-dna-copper flex-shrink-0" />
            <span>{format(eventDate, 'h:mm a')}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-dna-gold flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-dna-mint flex-shrink-0" />
            <span>{event.attendee_count} attending</span>
            {event.max_attendees && (
              <span className="text-gray-400"> / {event.max_attendees} max</span>
            )}
          </div>
        </div>

        {/* Event creator */}
        {event.creator_profile && (
          <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8 mr-3">
              <AvatarImage src={event.creator_profile.avatar_url} alt={event.creator_profile.full_name} />
              <AvatarFallback className="bg-dna-copper text-white text-xs">
                {event.creator_profile.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Hosted by {event.creator_profile.full_name}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreatorClick(event.creator_profile!.id);
              }}
              className="text-dna-emerald hover:text-dna-forest transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action button */}
        <EnhancedButton
          onClick={(e) => {
            e.stopPropagation();
            onRegister();
          }}
          variant={isUpcoming ? "dna" : "outline"}
          disabled={!isUpcoming}
          className="w-full"
        >
          {isUpcoming ? 'Register Now' : 'Event Ended'}
        </EnhancedButton>
      </CardContent>
    </Card>
  );
};

export default EnhancedEventCard;
