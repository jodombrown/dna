
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Globe, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';

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
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[50vh] sm:min-h-[60vh] py-4 sm:py-6">
            
            {/* Left Column, Main Content */}
            <div className="space-y-6">
              {/* Main Headline */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Badge className="bg-dna-gold/20 text-dna-gold border-dna-gold/30 text-sm px-4 py-2">
                    🚀 DNA Platform Now Live (Beta)
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-dna-forest mb-4">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 leading-relaxed">
                  Connecting Africa's diaspora professionals for transformative global impact through 
                  <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                  <span className="font-semibold text-dna-copper"> venture building</span>, and 
                  <span className="font-semibold text-dna-forest"> ecosystem building</span>.
                </p>

                {/* Primary CTA */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6">
                  <Button 
                    size="lg" 
                    className="bg-dna-emerald hover:bg-dna-forest text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full min-h-[48px] touch-manipulation"
                    onClick={() => navigate('/about')}
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Join Our Journey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
                    onClick={scrollToDNAFramework}
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    See How It Works
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column, Introduction */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border-0 overflow-hidden">
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

      {/* Platform Development Section with optimized spacing */}
      <section id="dna-framework" className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-dna-forest mb-4">
            Building Together: From Idea to Impact
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed px-4">
            Follow our open development journey. Each phase shows you exactly what we're building, 
            why we're building it, and how you can get involved.
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
