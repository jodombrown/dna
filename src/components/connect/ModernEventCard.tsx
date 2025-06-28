
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Event } from '@/types/search';
import { useNavigate } from "react-router-dom";

interface ModernEventCardProps {
  event: Event;
  onEventClick: (event: Event) => void;
  onRegisterEvent: () => void;
}

const ModernEventCard: React.FC<ModernEventCardProps> = ({ event, onEventClick, onRegisterEvent }) => {
  const navigate = useNavigate();

  const getEventLogo = (eventTitle: string, eventType: string) => {
    if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('health')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('leadership')) {
      return 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('climate') || eventTitle.toLowerCase().includes('environment')) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&h=120&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop';
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
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl hover:-translate-y-1"
          onClick={() => onEventClick(event)}>
      <div className="relative">
        <img
          src={eventBanner}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Creator on banner - top right */}
        {event.creator_profile && (
          <button
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md hover:bg-dna-emerald/90 hover:text-white transition-all flex items-center gap-2 text-sm font-medium z-20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${event.creator_profile.id}`);
            }}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage src={creatorImage} alt={event.creator_profile.full_name} />
              <AvatarFallback className="bg-dna-copper text-white text-xs">
                {event.creator_profile.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[80px] truncate">{event.creator_profile.full_name}</span>
          </button>
        )}

        {/* Event logo - bottom left overlap */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
            <img
              src={eventLogo}
              alt={`${event.title} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Virtual badge */}
        {event.is_virtual && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-dna-emerald/90 text-white border-0 backdrop-blur-sm">
              Virtual
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="pt-12 pb-6 px-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-dna-emerald transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {event.type}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{event.attendee_count ?? 0} attending</span>
            </div>
          </div>

          <Button 
            className="w-full mt-4 bg-dna-emerald hover:bg-dna-forest text-white font-medium py-2.5 rounded-xl transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onRegisterEvent();
            }}
          >
            Register for Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernEventCard;
