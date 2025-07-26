import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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

  const openWaitlistModal = () => {
    // This will be handled by the existing waitlist popup logic
    window.dispatchEvent(new CustomEvent('openWaitlist'));
  };

  return (
    <>
      {/* Hero Section with Image Background */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero-dna.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Unite. Build. Transform.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            DNA is where Africa's global Diaspora comes together to connect, collaborate, and contribute to projects, communities, and investments that drive Africa's progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
              onClick={scrollToDNAFramework}
            >
              <Play className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-dna-forest px-8 py-4 text-lg font-semibold rounded-full"
              onClick={openWaitlistModal}
            >
              <Users className="w-5 h-5 mr-2" />
              Sign Up to Join the Movement
            </Button>
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

export default HeroSection;