
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import UserSuccessSection from '@/components/UserSuccessSection';
import CompetitiveEdgeSection from '@/components/CompetitiveEdgeSection';
import MembershipMomentum from '@/components/MembershipMomentum';
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

      {/* NEW: User Success Stories and Stats */}
      <UserSuccessSection />

      {/* NEW: Competitive Differentiation */}
      <CompetitiveEdgeSection />

      {/* NEW: Membership Momentum and Waitlist */}
      <MembershipMomentum />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      <Footer />
    </div>
  );
};

export default Index;
