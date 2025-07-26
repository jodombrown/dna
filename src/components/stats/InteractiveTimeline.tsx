
import React, { useState, useEffect, useRef } from 'react';
import TimelineItem from './timeline/TimelineItem';
import TimelineDialog from './timeline/TimelineDialog';
import { timelineData } from './timeline/timelineData';

const InteractiveTimeline = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState('');
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active card when year changes
  useEffect(() => {
    if (activeTimelineYear && scrollContainerRef.current) {
      const activeIndex = timelineData.findIndex(item => item.year === activeTimelineYear);
      if (activeIndex !== -1) {
        const cardWidth = 320 + 24; // w-80 (320px) + gap-6 (24px)
        const scrollPosition = activeIndex * cardWidth;
        
        scrollContainerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTimelineYear]);

  const handleTimelineClick = (year: string) => {
    setActiveTimelineYear(year);
    setIsTimelineDialogOpen(true);
  };

  const getCurrentIndex = () => {
    return timelineData.findIndex(item => item.year === activeTimelineYear);
  };

  const navigateToYear = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : timelineData.length - 1;
    } else {
      newIndex = currentIndex < timelineData.length - 1 ? currentIndex + 1 : 0;
    }
    
    setActiveTimelineYear(timelineData[newIndex].year);
  };

  const activeTimelineData = timelineData.find(item => item.year === activeTimelineYear);
  const currentIndex = getCurrentIndex();
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < timelineData.length - 1;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-dna-forest mb-2">Interactive Timeline</h3>
        <p className="text-xl font-semibold text-dna-emerald mb-4">(2014 – 2024)</p>
        <p className="text-lg text-gray-600 mb-4">Explore a decade of diaspora growth and impact</p>
      </div>
      
      <div className="bg-gray-50 rounded-2xl p-8">
        {/* Mobile: Keep original grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
          {timelineData.map((item) => (
            <TimelineItem
              key={item.year}
              year={item.year}
              events={item.events}
              isActive={activeTimelineYear === item.year}
              onClick={() => handleTimelineClick(item.year)}
            />
          ))}
        </div>
        
        {/* Desktop: Horizontal scrollable timeline */}
        <div className="hidden lg:block">
          <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {timelineData.map((item) => (
              <div key={item.year} className="flex-shrink-0 w-80">
                <TimelineItem
                  year={item.year}
                  events={item.events}
                  isActive={activeTimelineYear === item.year}
                  onClick={() => handleTimelineClick(item.year)}
                />
              </div>
            ))}
          </div>
          {/* Scroll indicator */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">← Scroll horizontally to explore more years →</p>
          </div>
        </div>
        
        {/* Decade's Legacy Summary */}
        <div className="mt-8 bg-dna-emerald/10 rounded-xl p-6 text-center">
          <h4 className="text-xl font-bold text-dna-forest mb-3">The Decade's Legacy</h4>
          <p className="text-gray-700 leading-relaxed mb-4">
            Over the course of ten years, a simple act that began with sending money home became something greater. It evolved into a movement of resilience, innovation, and unity. The diaspora didn't just send funds; they sent hope, opportunity, and the tools for transformation. Now, the future lies beyond remittances. It's through strategic partnerships, shared knowledge, and coordinated investment that Africa's untapped potential will be unlocked.
          </p>
          <p className="text-gray-700 leading-relaxed">
            At DNA, we're building the platform to power that future, transforming individual contributions into collective strength, scattered expertise into focused impact, and diaspora potential into Africa's accelerated, united, and unstoppable progress.
          </p>
        </div>
      </div>

      <TimelineDialog
        isOpen={isTimelineDialogOpen}
        onOpenChange={setIsTimelineDialogOpen}
        activeTimelineData={activeTimelineData}
        activeTimelineYear={activeTimelineYear}
        onNavigate={navigateToYear}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
      />
    </section>
  );
};

export default InteractiveTimeline;
