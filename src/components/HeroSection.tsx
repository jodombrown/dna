
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
    const frameworkSection = document.getElementById('dnaFramework');
    if (frameworkSection) {
      frameworkSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-dna-emerald/10">
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-dna-forest">
            Welcome to the
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-dna-copper">
            Diaspora Network of Africa
          </h1>
          
          <p className="text-xl md:text-2xl text-dna-forest mb-8 max-w-4xl mx-auto leading-relaxed">
            Connecting Africa's diaspora professionals for transformative global impact through{' '}
            <span className="text-dna-emerald font-semibold">capacity building</span>,{' '}
            <span className="text-dna-copper font-semibold">venture building</span>, and{' '}
            <span className="font-semibold">ecosystem building</span>.
          </p>

          {/* Founder Introduction */}
          <HeroIntroduction />

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="outline" 
              size="lg"
              className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full flex items-center gap-2"
              onClick={scrollToDNAFramework}
            >
              <Play className="w-4 h-4" />
              See How It Works
            </Button>
            <Button 
              size="lg" 
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
              onClick={() => setIsFeedbackOpen(true)}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Our Journey
            </Button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-mint/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-copper/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Diaspora isn't waiting — we're building.
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tap into a purpose-driven network of professionals committed to real change. From bold ideas to scalable solutions, DNA is where vision becomes reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
              onClick={() => setIsFeedbackOpen(true)}
            >
              <Users className="w-5 h-5 mr-2" />
              Join the Beta
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full"
              onClick={() => navigate('/collaborate')}
            >
              Explore Projects
            </Button>
          </div>
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
