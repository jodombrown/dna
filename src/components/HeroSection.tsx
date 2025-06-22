
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import { Play } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const scrollToDNAFramework = () => {
    const frameworkSection = document.getElementById('dna-framework');
    if (frameworkSection) {
      frameworkSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Main Hero Section with adjusted spacing */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh] py-16">
            
            {/* Left Column, Main Content */}
            <div className="space-y-8">
              {/* Main Headline */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-dna-forest mb-6">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                  Connecting Africa's diaspora professionals for meaningful global impact through 
                  <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                  <span className="font-semibold text-dna-copper"> venture building</span>, and 
                  <span className="font-semibold text-dna-forest"> ecosystem building</span>.
                </p>

                {/* Primary CTA - Swapped buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Button 
                    size="lg" 
                    className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full flex items-center gap-2"
                    onClick={() => setIsFeedbackOpen(true)}
                  >
                    Give Feedback
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full flex items-center gap-2"
                    onClick={scrollToDNAFramework}
                  >
                    <Play className="w-4 h-4" />
                    See how it works
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column, Introduction */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-dna-mint/20">
                <HeroIntroduction />
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-mint/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-copper/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </section>

      {/* Platform Development Section with increased spacing */}
      <section id="dna-framework" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-dna-forest mb-12">
            From Idea to Implementation
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Follow our transparent development process as we build the future of diaspora engagement
          </p>
          <PlatformBadges />
        </div>
      </section>

      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
