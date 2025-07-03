
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';

const Index = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PrototypeBanner />
      <HeroSection />
      <PlatformFeatureShowcase />
      <Footer />
    </div>
  );
};

export default Index;
