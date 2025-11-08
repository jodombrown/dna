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
      {/* Main Hero Section */}
      <PatternBackground pattern="kente" intensity="subtle" className="relative bg-gradient-to-br from-white via-dna-terra-light/5 to-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Main Message */}
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-dna-forest leading-tight">
                Connecting Africa's diaspora for 
                <span className="text-dna-copper"> transformative impact</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Join visionary leaders, builders, and changemakers mobilizing talent, capital, and expertise to accelerate Africa's transformation.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-dna-emerald hover:bg-dna-forest text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/about')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Our Journey
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
                  onClick={scrollToDNAFramework}
                >
                  <Play className="w-4 h-4 mr-2" />
                  See How It Works
                </Button>
              </div>
            </div>

            {/* Right Column - Introduction Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <HeroIntroduction />
            </div>
          </div>
        </div>
      </PatternBackground>

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
