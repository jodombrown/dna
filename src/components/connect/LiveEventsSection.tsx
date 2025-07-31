import React from 'react';
import { Loader2, Calendar, MapPin } from 'lucide-react';
import { useFeaturedEvents } from '@/hooks/useLiveEvents';
import ModernEventCard from './ModernEventCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { Event } from '@/types/search';

interface LiveEventsSectionProps {
  onEventClick?: (event: Event) => void;
  onRegisterEvent?: (event: Event) => void;
  onCreatorClick?: (creatorId: string) => void;
  onViewAll?: () => void;
}

const LiveEventsSection: React.FC<LiveEventsSectionProps> = ({
  onEventClick = () => {},
  onRegisterEvent = () => {},
  onCreatorClick = () => {},
  onViewAll = () => {}
}) => {
  const { data: events = [], isLoading, error } = useFeaturedEvents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-dna-forest" />
        <span className="ml-2 text-gray-600">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load events. Please try again later.</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
        <p className="text-gray-600">Check back soon for upcoming events in your area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Upcoming Events ({events.length})
          </h3>
          <p className="text-gray-600">Connect with your community through meaningful events</p>
        </div>
        <Button 
          variant="ghost" 
          className="text-dna-emerald hover:text-dna-forest"
          onClick={onViewAll}
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="relative px-12">
        <Carousel 
          className="w-full"
          plugins={[WheelGesturesPlugin()]}
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {events.map((event) => (
              <CarouselItem key={event.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                <div className="h-[420px]">
                  <ModernEventCard 
                    event={event} 
                    onEventClick={onEventClick}
                    onRegisterEvent={() => onRegisterEvent(event)}
                    onCreatorClick={onCreatorClick}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
        </Carousel>
      </div>
    </div>
  );
};

export default LiveEventsSection;