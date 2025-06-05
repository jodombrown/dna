
import React from 'react';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      <Footer />
    </div>
  );
};

export default Index;
