
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
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      {/* Why We're Building in the Open Section */}
      <section className="py-16 bg-gradient-to-r from-dna-mint/20 to-dna-emerald/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dna-emerald/10 p-8 rounded-2xl border border-dna-emerald/30">
            <p className="text-xl text-dna-forest leading-relaxed">
              <strong>Why we're building in the open:</strong> We believe openness builds trust. 
              Watch us create the platform, share feedback, and join our community as we grow together.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
