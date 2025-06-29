
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/search';

interface EventRegistrationHeaderProps {
  event: Event;
}

const EventRegistrationHeader: React.FC<EventRegistrationHeaderProps> = ({ event }) => {
  const getEventBanner = (eventTitle: string) => {
    if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
      return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('networking')) {
      return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
  };

  const eventBanner = event.banner_url || getEventBanner(event.title);

  return (
    <div className="relative">
      <img
        src={eventBanner}
        alt={event.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      {/* Virtual badge */}
      {event.is_virtual && (
        <div className="absolute top-4 left-4">
          <Badge className="bg-dna-emerald text-white border-0">
            Virtual
          </Badge>
        </div>
      )}
      
      {/* Title overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
        <div className="flex items-center gap-2 text-white/90">
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
            {event.type}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationHeader;
