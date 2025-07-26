
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CallToActionSection from '@/components/CallToActionSection';
import DNAFrameworkSection from '@/components/DNAFrameworkSection';
import BuildingTogetherSection from '@/components/BuildingTogetherSection';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';

const Index = () => {
  useScrollToTop();
  const { showWaitlistPopup, scrollProgress, closeWaitlistPopup } = useWaitlistPopup();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section */}
      <HeroSection />

      {/* Call to Action Section */}
      <CallToActionSection />

      {/* DNA Framework Section */}
      <DNAFrameworkSection />

      {/* Building Together Section */}
      <BuildingTogetherSection />

      <Footer />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={closeWaitlistPopup}
        scrollProgress={scrollProgress}
      />
    </div>
  );
};

export default Index;
