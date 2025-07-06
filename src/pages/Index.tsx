
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistSection from '@/components/WaitlistSection';
import WaitlistPopup from '@/components/WaitlistPopup';

const Index = () => {
  useScrollToTop();
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      {/* Waitlist Section */}
      <WaitlistSection onJoinClick={() => setShowWaitlistDialog(true)} />

      <Footer />

      {/* Waitlist Dialog */}
      <WaitlistPopup 
        isOpen={showWaitlistDialog} 
        onClose={() => setShowWaitlistDialog(false)} 
      />
    </div>
  );
};

export default Index;
