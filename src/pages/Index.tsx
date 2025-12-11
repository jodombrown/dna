import React, { useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import HeroSection from '@/components/HeroSection';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';

// Lazy load below-the-fold components to improve TTI
const PlatformFeatureShowcase = lazy(() => import('@/components/PlatformFeatureShowcase'));
const BuildingTogetherSection = lazy(() => import('@/components/BuildingTogetherSection'));
const WhoIsDNAForSection = lazy(() => import('@/components/WhoIsDNAForSection'));
const Footer = lazy(() => import('@/components/Footer'));
const WaitlistPopup = lazy(() => import('@/components/waitlist/WaitlistPopup'));

// Minimal loading fallback
const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();

  // Redirect authenticated users to Feed (home)
  useEffect(() => {
    if (user && !loading) {
      navigate('/dna/feed');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white">

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Lazy-loaded below-the-fold sections */}
      <Suspense fallback={<SectionFallback />}>
        {/* Platform Feature Showcase - DNA Framework with all 5 pillars in order */}
        <PlatformFeatureShowcase />

        {/* Building Together Section */}
        <BuildingTogetherSection />

        {/* Who is DNA for Section */}
        <WhoIsDNAForSection />

        <Footer />
      </Suspense>
      
      <Suspense fallback={null}>
        <WaitlistPopup 
          isOpen={showWaitlistPopup}
          onClose={closeWaitlistPopup}
        />
      </Suspense>
    </div>
  );
};

export default Index;
