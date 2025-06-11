
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      <Footer />
    </div>
  );
};

export default Index;
