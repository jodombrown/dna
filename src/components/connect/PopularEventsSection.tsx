
import React from 'react';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
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
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <ResponsiveHeading level={3} className="mb-1 sm:mb-2">
            Popular Events
          </ResponsiveHeading>
          <ResponsiveText size="sm" className="text-gray-600">
            Trending events in your network
          </ResponsiveText>
        </div>
        <TouchFriendlyButton 
          variant="outline" 
          size="sm"
          className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white transition-all group/button"
          onClick={onViewAll}
        >
          View All 
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
        </TouchFriendlyButton>
      </div>

      {/* Horizontal scrolling container - restored Luma style */}
      <div className="relative">
        {/* Navigation buttons */}
        <TouchFriendlyButton
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </TouchFriendlyButton>
        
        <TouchFriendlyButton
          variant="outline"
          size="sm"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </TouchFriendlyButton>

        {/* Scrollable events container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-12 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="flex-shrink-0 w-72 sm:w-80 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ModernEventCard 
                event={event} 
                onEventClick={onEventClick}
                onRegisterEvent={() => onRegisterEvent(event)}
                onCreatorClick={onCreatorClick}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularEventsSection;
