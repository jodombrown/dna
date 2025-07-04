
import React, { useState } from 'react';
import TimelineItem from './timeline/TimelineItem';
import TimelineDialog from './timeline/TimelineDialog';
import { timelineData } from './timeline/timelineData';

const InteractiveTimeline = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState('');
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        {/* Decade's Legacy Summary */}
        <div className="mt-8 bg-dna-emerald/10 rounded-xl p-6">
          <h4 className="text-xl font-bold text-dna-forest mb-3">The Decade's Legacy</h4>
          <p className="text-gray-700 leading-relaxed">
            This ten-year journey tells the story of human resilience, technological innovation, and the unbreakable bonds of family and community. What began as simple money transfers evolved into a sophisticated ecosystem of financial inclusion, technological advancement, and economic development. The diaspora didn't just send money home, they sent hope, opportunity, and the tools for transformation.
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
