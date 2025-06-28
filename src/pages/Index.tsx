
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import PhaseNavigation from '@/components/PhaseNavigation';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';

const Index = () => {
  useScrollToTop();

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

      {/* Phase Navigation */}
      <PhaseNavigation />

      <Footer />
    </div>
  );
};

export default Index;
