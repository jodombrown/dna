
import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import BuildingTogetherSection from '@/components/BuildingTogetherSection';
import WhoIsDNAForSection from '@/components/WhoIsDNAForSection';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';

const Index = () => {
  useScrollToTop();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <UnifiedHeader />
      
      {/* Spacer for fixed header on mobile */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase - DNA Framework with all 5 pillars in order */}
      <PlatformFeatureShowcase />

      {/* Building Together Section */}
      <BuildingTogetherSection />

      {/* Who is DNA for Section */}
      <WhoIsDNAForSection />

      <Footer />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={closeWaitlistPopup}
      />
    </div>
  );
};

export default Index;
