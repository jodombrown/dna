import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import { TYPOGRAPHY } from '@/lib/typography.config';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import PatternBackground from '@/components/ui/PatternBackground';
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
      {/* Main Hero Section - LinkedIn Inspired */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            
            {/* Left Column - Clear Value Proposition */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-dna-forest leading-tight mb-6">
                  Connect Africa's diaspora for transformative impact
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Join visionary leaders, builders, and changemakers mobilizing talent, capital, and expertise to reshape Africa's future.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="bg-dna-emerald hover:bg-dna-forest text-white font-semibold px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all h-14"
                    onClick={() => navigate('/about')}
                  >
                    Join the Network
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-dna-forest text-dna-forest hover:bg-dna-forest/5 font-semibold px-8 py-6 rounded-full text-lg h-14"
                    onClick={scrollToDNAFramework}
                  >
                    Learn More
                  </Button>
                </div>

                {/* Trust Indicator */}
                <p className="text-sm text-gray-500 mt-6">
                  By joining, you agree to our{' '}
                  <a href="/terms" className="text-dna-copper hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-dna-copper hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Right Column - Professional Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-dna-terra-light/20 via-dna-ochre-light/10 to-dna-sunset-light/20 rounded-3xl overflow-hidden">
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,.05)_10px,rgba(0,0,0,.05)_20px)]"></div>
                
                {/* Illustration placeholder - can be replaced with actual illustration */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
                  <div className="space-y-6">
                    <div className="w-32 h-32 mx-auto bg-dna-copper/20 rounded-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-dna-copper" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-dna-emerald animate-pulse"></div>
                        <span className="text-sm font-medium text-dna-forest">50K+ Global Professionals</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-dna-copper animate-pulse delay-75"></div>
                        <span className="text-sm font-medium text-dna-forest">Building Across 54 Countries</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-dna-sunset animate-pulse delay-150"></div>
                        <span className="text-sm font-medium text-dna-forest">One Unified Network</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section with Mudcloth pattern */}
      <PatternBackground pattern="mudcloth" intensity="subtle" className="py-10 bg-gradient-to-r from-dna-terra/10 to-dna-sunset/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </PatternBackground>


      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
