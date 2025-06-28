
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Event } from '@/types/search';
import ModernEventCard from './ModernEventCard';

interface PopularEventsSectionProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onRegisterEvent: () => void;
}

const PopularEventsSection: React.FC<PopularEventsSectionProps> = ({ 
  events, 
  onEventClick, 
  onRegisterEvent 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Popular Events</h3>
          <p className="text-gray-600">Trending events in your network</p>
        </div>
        <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="relative px-16">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {events.map((event) => (
              <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <ModernEventCard 
                  event={event} 
                  onEventClick={onEventClick}
                  onRegisterEvent={onRegisterEvent}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
          <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
        </Carousel>
      </div>
    </div>
  );
};

export default PopularEventsSection;
