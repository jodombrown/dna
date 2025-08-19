
import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import BuildingTogetherSection from '@/components/BuildingTogetherSection';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';
import { isPrelaunchLocked } from '@/utils/prelaunchGate';
import PrelaunchBanner from '@/components/PrelaunchBanner';

const Index = () => {
  useScrollToTop();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();
  const isPrelaunch = isPrelaunchLocked();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <UnifiedHeader />

      {/* Prelaunch Banner */}
      {isPrelaunch && <PrelaunchBanner />}

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      {/* Building Together Section */}
      <BuildingTogetherSection />

      <Footer />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={closeWaitlistPopup}
      />
    </div>
  );
};

export default Index;
