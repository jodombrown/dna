
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Event } from '@/types/search';
import ModernEventCard from './ModernEventCard';

interface PopularEventsSectionProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onRegisterEvent: (event: Event) => void;
  onCreatorClick?: (creatorId: string) => void;
  onViewAll?: () => void;
}

const PopularEventsSection: React.FC<PopularEventsSectionProps> = ({ 
  events, 
  onEventClick, 
  onRegisterEvent,
  onCreatorClick,
  onViewAll
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Popular Events</h3>
          <p className="text-gray-600">Trending events in your network</p>
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
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {events.map((event) => (
              <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="h-full">
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

export default PopularEventsSection;
