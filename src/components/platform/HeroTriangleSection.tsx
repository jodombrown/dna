import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import {
  Sankofa,
  Nkonsonkonson,
  FuntunfunefuDenkyemfunefu,
  Adinkrahene,
  Mpatapo,
} from '@/components/icons/adinkra';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';

type FiveC = {
  id: string;
  name: string;
  sectionId: string;
  blurb: string;
  Icon: typeof Sankofa;
  surface: string;
  text: string;
  hoverBorder: string;
};

const FIVE_CS: FiveC[] = [
  {
    id: 'connect',
    name: 'Connect',
    sectionId: 'connect-section',
    blurb: 'Forge powerful bonds across the global African diaspora.',
    Icon: Sankofa,
    surface: 'bg-c5-connect',
    text: 'text-c5-connect-text',
    hoverBorder: 'hover:border-c5-connect',
  },
  {
    id: 'convene',
    name: 'Convene',
    sectionId: 'convene-section',
    blurb: 'Gather for meaningful events and cultural celebrations.',
    Icon: Nkonsonkonson,
    surface: 'bg-c5-convene',
    text: 'text-c5-convene-text',
    hoverBorder: 'hover:border-c5-convene',
  },
  {
    id: 'collaborate',
    name: 'Collaborate',
    sectionId: 'collaborate-section',
    blurb: 'Transform shared vision into action through partnerships.',
    Icon: FuntunfunefuDenkyemfunefu,
    surface: 'bg-c5-collaborate',
    text: 'text-c5-collaborate-text',
    hoverBorder: 'hover:border-c5-collaborate',
  },
  {
    id: 'contribute',
    name: 'Contribute',
    sectionId: 'contribute-section',
    blurb: "Step into your role in Africa's future with tangible impact.",
    Icon: Adinkrahene,
    surface: 'bg-c5-contribute',
    text: 'text-c5-contribute-text',
    hoverBorder: 'hover:border-c5-contribute',
  },
  {
    id: 'convey',
    name: 'Convey',
    sectionId: 'convey-section',
    blurb: 'Share stories and amplify diaspora voices across platforms.',
    Icon: Mpatapo,
    surface: 'bg-c5-convey',
    text: 'text-c5-convey-text',
    hoverBorder: 'hover:border-c5-convey',
  },
];


const HeroTriangleSection = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <section id="dna-framework" className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-neutral-900 mb-6 leading-tight">
              The DNA Framework
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-4 text-left sm:text-center">
              A virtuous cycle where <strong>individual success fuels collective power</strong>. Connect with leaders. 
              Convene for breakthroughs. Collaborate on ventures. Contribute your assets. Convey your wins. 
              Each action strengthens your network while mobilizing billions toward Africa's transformation.
            </p>
            <p className="text-base sm:text-lg text-neutral-500 max-w-3xl mx-auto leading-relaxed mb-12 text-left sm:text-center">
              <em>You grow. The movement grows. Africa grows. That's the DNA way.</em>
            </p>

            {/* Five C's navigation - hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-5 gap-6 mb-12">
              {FIVE_CS.map(({ id, name, sectionId, blurb, Icon, surface, text, hoverBorder }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(sectionId)}
                  className={`bg-card border border-border rounded-lg p-6 transition-colors duration-150 group cursor-pointer ${hoverBorder}`}
                >
                  <div className="flex justify-center mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${surface}`}>
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className={`text-h2 mb-3 ${text}`}>{name}</h3>
                  <p className="text-muted-foreground text-body mb-4 leading-relaxed">
                    {blurb}
                  </p>
                  <div className={`flex items-center justify-center transition-colors ${text}`}>
                    <span className="text-body font-medium mr-2">Learn more</span>
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroTriangleSection;
