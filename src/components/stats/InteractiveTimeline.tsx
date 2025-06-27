
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronRight, Calendar, MousePointer2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TimelineItem = ({ year, events, isActive, onClick }: {
  year: string;
  events: string[];
  isActive: boolean;
  onClick: () => void;
}) => (
  <div 
    className={`cursor-pointer p-6 rounded-lg transition-all duration-300 relative group ${
      isActive ? 'bg-dna-emerald text-white shadow-lg transform scale-105' : 'bg-white/50 hover:bg-white/70 hover:shadow-md hover:scale-102'
    }`}
    onClick={onClick}
  >
    {/* Click indicator */}
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex items-center gap-1 text-xs">
        <MousePointer2 className="w-3 h-3" />
        <span className={isActive ? 'text-white/70' : 'text-gray-500'}>Click to explore</span>
      </div>
    </div>
    
    {/* Hover effect border */}
    <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 ${
      isActive ? 'border-white/30' : 'border-transparent group-hover:border-dna-emerald/50'
    }`} />
    
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5" />
        <div className="font-bold text-xl">{year}</div>
        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
          isActive ? 'rotate-90' : 'group-hover:translate-x-1'
        }`} />
      </div>
      
      {events.map((event, idx) => (
        <div key={idx} className="text-sm mb-2 flex items-start gap-2">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
            isActive ? 'bg-white' : 'bg-dna-emerald'
          }`} />
          <span>{event}</span>
        </div>
      ))}
      
      {/* Interactive hint */}
      <div className={`mt-3 text-xs opacity-70 flex items-center gap-1 ${
        isActive ? 'text-white' : 'text-gray-600'
      }`}>
        <span>📖</span>
        <span>Click to read the full story</span>
      </div>
    </div>
  </div>
);

const InteractiveTimeline = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState('');
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);

  const timelineData = [
    {
      year: '2014',
      events: ['Remittances: $71B', 'Digital banking emergence', 'First diaspora investment funds'],
      expandedContent: {
        title: 'The Foundation Year',
        description: 'In 2014, the diaspora landscape was undergoing a quiet revolution. With $71 billion flowing through remittance channels, families across developing nations were receiving lifelines from loved ones abroad. This was the year digital banking began its emergence from the shadows of traditional money transfer systems, while pioneering communities established the first diaspora investment funds. These early funds represented more than financial instruments—they were symbols of collective ambition, diaspora communities pooling resources to invest in their homelands\' futures.'
      }
    },
    {
      year: '2016',
      events: ['Remittances: $80B', 'Mobile money expansion', '100+ diaspora organizations'],
      expandedContent: {
        title: 'The Mobile Money Revolution',
        description: 'Two years later, remittances had grown to $80 billion, but the real story was happening in the palm of people\'s hands. Mobile money was expanding rapidly across continents, transforming how a farmer in rural Kenya could receive money from a son working in London, or how a domestic worker in Dubai could instantly support her family in the Philippines. Over 100 diaspora organizations had sprouted worldwide, creating networks of support that extended far beyond financial transfers to encompass cultural preservation, advocacy, and community building.'
      }
    },
    {
      year: '2018',
      events: ['Remittances: $90B', '250+ organizations', 'Tech startup boom begins'],
      expandedContent: {
        title: 'The Tech Startup Boom',
        description: 'By 2018, with $90 billion in remittances flowing globally, the sector was experiencing its own Silicon Valley moment. Over 250 organizations were now operating in this space, and tech startups were beginning to boom with innovative solutions. Young entrepreneurs, many from diaspora communities themselves, were building apps and platforms that promised to make sending money home faster, cheaper, and more transparent. This wasn\'t just about technology—it was about dignity, ensuring that hard-earned money reached families without excessive fees or delays.'
      }
    },
    {
      year: '2020',
      events: ['COVID-19 resilience', 'Digital transformation', 'Virtual collaboration tools'],
      expandedContent: {
        title: 'Resilience in Crisis',
        description: 'The year 2020 tested everything. As COVID-19 swept across the globe, economists predicted remittance flows would collapse. Instead, they demonstrated remarkable resilience. Diaspora communities, even while facing their own economic uncertainties, continued supporting families back home who were often in even more precarious situations. Digital transformation accelerated out of necessity—virtual collaboration tools became lifelines not just for business meetings, but for maintaining the emotional and financial connections that bind diaspora communities to their origins.'
      }
    },
    {
      year: '2022',
      events: ['Remittances: $95B', 'Fintech revolution', '1000+ active projects'],
      expandedContent: {
        title: 'The Fintech Revolution Matures',
        description: 'With remittances reaching $95 billion, 2022 marked the maturation of the fintech revolution in this space. Over 1,000 active projects were now operating, creating an ecosystem where sending money internationally was becoming as simple as sending a text message. Blockchain technology and cryptocurrency solutions were gaining traction, promising even greater efficiency and lower costs. The diaspora had become early adopters of financial technology, driven by necessity and enabled by innovation.'
      }
    },
    {
      year: '2024',
      events: ['Remittances: $100B+', '40% return migration increase', 'AI-powered platforms'],
      expandedContent: {
        title: 'The AI-Powered Future',
        description: 'As remittances surpassed $100 billion, 2024 brought artificial intelligence into the equation. AI-powered platforms began optimizing transfer routes, predicting the best times to send money based on exchange rate fluctuations, and improving compliance with international regulations. Perhaps most significantly, there was a 40% increase in return migration patterns—diaspora members were beginning to move back to their countries of origin, armed with skills, capital, and networks developed abroad. The story had come full circle: from leaving home to send money back, to returning home to build the future directly.'
      }
    }
  ];

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
        <h3 className="text-3xl font-bold text-dna-forest mb-4">Interactive Timeline (2014 – 2024)</h3>
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
            This ten-year journey tells the story of human resilience, technological innovation, and the unbreakable bonds of family and community. What began as simple money transfers evolved into a sophisticated ecosystem of financial inclusion, technological advancement, and economic development. The diaspora didn't just send money home—they sent hope, opportunity, and the tools for transformation.
          </p>
        </div>
      </div>

      {/* Timeline Detail Dialog with Navigation */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToYear('prev')}
                className={`flex items-center gap-1 transition-all duration-300 ${
                  canNavigatePrev 
                    ? 'text-dna-emerald hover:text-dna-forest animate-pulse' 
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                }`}
                disabled={!canNavigatePrev}
              >
                <ArrowLeft className={`w-4 h-4 ${canNavigatePrev ? 'animate-bounce' : ''}`} />
                <span className="text-xs">Previous</span>
              </Button>

              {/* Title Section */}
              <div className="flex-1 text-center">
                <DialogTitle className="text-2xl font-bold text-dna-forest">
                  {activeTimelineData?.expandedContent.title}
                </DialogTitle>
                <DialogDescription className="text-lg font-semibold text-dna-emerald">
                  {activeTimelineYear}
                </DialogDescription>
              </div>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToYear('next')}
                className={`flex items-center gap-1 transition-all duration-300 ${
                  canNavigateNext 
                    ? 'text-dna-emerald hover:text-dna-forest animate-pulse' 
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                }`}
                disabled={!canNavigateNext}
              >
                <span className="text-xs">Next</span>
                <ArrowRight className={`w-4 h-4 ${canNavigateNext ? 'animate-bounce' : ''}`} />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mt-6">
            <p className="text-gray-700 leading-relaxed">
              {activeTimelineData?.expandedContent.description}
            </p>
            
            {/* Navigation Hint */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                <ArrowLeft className="w-3 h-3 animate-pulse" />
                <span>Use arrows to explore other years</span>
                <ArrowRight className="w-3 h-3 animate-pulse" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InteractiveTimeline;
