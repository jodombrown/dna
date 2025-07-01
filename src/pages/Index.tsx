import React, { lazy } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import { LazySection } from '@/components/ui/lazy-section';
import { SectionTransition } from '@/components/ui/section-transition';

// Lazy load components that aren't immediately visible
const PlatformFeatureShowcase = lazy(() => import('@/components/PlatformFeatureShowcase'));

const Index = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section - Keep this eager loaded as it's above the fold */}
      <SectionTransition animationType="fade">
        <HeroSection />
      </SectionTransition>

      {/* Platform Feature Showcase - Lazy load this as it's below the fold */}
      <SectionTransition animationType="slide" delay={200}>
        <LazySection>
          <PlatformFeatureShowcase />
        </LazySection>
      </SectionTransition>

      <SectionTransition animationType="fade" delay={400}>
        <Footer />
      </SectionTransition>
    </div>
  );
};

export default Index;
