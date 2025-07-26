import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { timelineData } from './timeline/timelineData';
import TimelineDialog from './timeline/TimelineDialog';

const HorizontalTimeline = () => {
  const [activeYear, setActiveYear] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTimelineClick = (year: string) => {
    setActiveYear(year);
    setIsDialogOpen(true);
  };

  const navigateToYear = (direction: 'prev' | 'next') => {
    const currentIndex = timelineData.findIndex(item => item.year === activeYear);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveYear(timelineData[currentIndex - 1].year);
    } else if (direction === 'next' && currentIndex < timelineData.length - 1) {
      setActiveYear(timelineData[currentIndex + 1].year);
    }
  };

  const activeTimelineData = timelineData.find(item => item.year === activeYear);
  const canNavigatePrev = timelineData.findIndex(item => item.year === activeYear) > 0;
  const canNavigateNext = timelineData.findIndex(item => item.year === activeYear) < timelineData.length - 1;

  const scrollToCard = (direction: 'left' | 'right') => {
    const container = document.getElementById('timeline-scroll-container');
    if (container) {
      const scrollAmount = 320; // Card width + gap
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-dna-white via-dna-white to-dna-emerald/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-dna-emerald" />
            <Badge variant="outline" className="border-dna-emerald text-dna-emerald px-4 py-2 text-sm font-medium">
              Interactive Timeline
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-dna-forest mb-4">
            Interactive Timeline
          </h2>
          <p className="text-xl text-dna-emerald font-medium mb-2">(2014 – 2024)</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore a decade of diaspora growth and impact
          </p>
        </div>

        {/* Timeline Cards Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scrollToCard('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => scrollToCard('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Scrollable Timeline */}
          <div
            id="timeline-scroll-container"
            className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {timelineData.map((item, index) => (
              <Card
                key={item.year}
                className={`
                  flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2
                  ${index === 1 ? 'border-dna-emerald bg-dna-emerald/5 shadow-lg' : 'border-gray-200 hover:border-dna-emerald/50'}
                `}
                onClick={() => handleTimelineClick(item.year)}
              >
                <CardContent className="p-6">
                  {/* Year Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-dna-emerald" />
                      <h3 className="text-2xl font-bold text-dna-forest">{item.year}</h3>
                    </div>
                    {index === 1 && (
                      <Badge className="bg-dna-emerald text-white text-xs">
                        Click to explore
                      </Badge>
                    )}
                  </div>

                  {/* Events List */}
                  <div className="space-y-3 mb-6">
                    {item.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-dna-emerald rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">{event}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Text */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Click to read the full story</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legacy Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              The Decade's Legacy
            </h3>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-4xl mx-auto">
              From $71B to $100B+ in remittances, from digital emergence to AI-powered platforms, 
              the African diaspora has transformed how we connect, collaborate, and contribute to Africa's future.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Dialog */}
      <TimelineDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        activeTimelineData={activeTimelineData}
        activeTimelineYear={activeYear}
        onNavigate={navigateToYear}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default HorizontalTimeline;