
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/WaitlistPopup';

const Index = () => {
  useScrollToTop();
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

  useEffect(() => {
    // Show waitlist popup after 2 seconds
    const timer = setTimeout(() => {
      setShowWaitlistPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

      <Footer />

      {/* Waitlist Popup */}
      <WaitlistPopup 
        isOpen={showWaitlistPopup} 
        onClose={() => setShowWaitlistPopup(false)} 
      />
    </div>
  );
};

export default Index;
