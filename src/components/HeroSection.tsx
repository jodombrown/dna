
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { SectionTransition } from '@/components/ui/section-transition';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { Play, Users } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const { scrollToSection } = useSmoothScroll();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleScrollToDNAFramework = useCallback(() => {
    scrollToSection('dna-framework', 80);
  }, [scrollToSection]);

  return (
    <>
      {/* Main Hero Section with mobile-optimized spacing and layout */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[50vh] sm:min-h-[60vh] py-4 sm:py-6">
            
            {/* Left Column - Main Content with mobile-first approach */}
            <SectionTransition animationType="slide" delay={100}>
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center lg:text-left">
                  <ResponsiveHeading level={1} className="mb-3 sm:mb-4 animate-fade-in">
                    Welcome to the
                    <br />
                    <span className="text-dna-copper">Diaspora Network of Africa</span>
                  </ResponsiveHeading>
                  
                  <ResponsiveText size="lg" className="mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Connecting Africa's diaspora professionals for transformative global impact through 
                    <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                    <span className="font-semibold text-dna-copper"> venture building</span>, and 
                    <span className="font-semibold text-dna-forest"> ecosystem building</span>.
                  </ResponsiveText>

                  {/* Mobile-optimized CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <TouchFriendlyButton 
                      size="default" 
                      variant="default"
                      onClick={() => navigate('/about')}
                      className="w-full sm:w-auto"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Our Journey
                    </TouchFriendlyButton>
                    <TouchFriendlyButton 
                      variant="outline" 
                      size="default"
                      onClick={handleScrollToDNAFramework}
                      className="w-full sm:w-auto"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      See How It Works
                    </TouchFriendlyButton>
                  </div>
                </div>
              </div>
            </SectionTransition>

            {/* Right Column - Introduction with mobile-optimized card */}
            <SectionTransition animationType="scale" delay={300}>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border-0 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-102">
                  <HeroIntroduction />
                </div>
              </div>
            </SectionTransition>
          </div>
        </div>

        {/* Optimized background pattern - hidden on mobile for performance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-dna-mint/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-dna-copper/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Statistics Section with mobile-optimized padding */}
      <SectionTransition animationType="fade" delay={400}>
        <section className="py-6 sm:py-8 lg:py-10 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DiasporaStats />
          </div>
        </section>
      </SectionTransition>

      {/* Platform Development Section with mobile-optimized spacing */}
      <SectionTransition animationType="slide" delay={600}>
        <section id="dna-framework" className="py-8 sm:py-12 lg:py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ResponsiveHeading level={2} className="mb-3 sm:mb-4 animate-fade-in">
              Building Together: From Idea to Impact
            </ResponsiveHeading>
            <ResponsiveText className="mb-4 sm:mb-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Follow our open development journey. Each phase shows you exactly what we're building, 
              why we're building it, and how you can get involved.
            </ResponsiveText>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <PlatformBadges />
            </div>
          </div>
        </section>
      </SectionTransition>

      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
