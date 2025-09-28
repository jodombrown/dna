
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';

import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import { Play, Users } from 'lucide-react';

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
      {/* Main Hero Section with reduced spacing */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[60vh] py-6">
            
            {/* Left Column, Main Content */}
            <div className="space-y-6">
              {/* Main Headline */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-dna-forest mb-4">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
                  Connecting Africa's diaspora professionals for transformative global impact through 
                  <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                  <span className="font-semibold text-dna-copper"> venture building</span>, and 
                  <span className="font-semibold text-dna-forest"> ecosystem building</span>.
                </p>

                {/* Primary CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <Button 
                    size="lg" 
                    className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
                    onClick={() => navigate('/about')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Our Journey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full whitespace-nowrap"
                    onClick={scrollToDNAFramework}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    See How It Works
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column, Introduction */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-0 overflow-hidden">
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
      <section className="py-10 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
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
