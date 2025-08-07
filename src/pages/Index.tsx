
import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import BuildingTogetherSection from '@/components/BuildingTogetherSection';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';
import HowItWorksSection from '@/components/HowItWorksSection';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const Index = () => {
  useScrollToTop();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>DNA — Diaspora Network of Africa | Prototype Platform</title>
          <meta
            name="description"
            content="Join the Diaspora Network of Africa prototype: connect, collaborate, and contribute. Early adopters welcome—waitlist, partner, and learn how DNA works."
          />
          <link rel="canonical" href="https://diasporanetwork.africa/" />
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Diaspora Network of Africa',
              url: 'https://diasporanetwork.africa/',
              logo: 'https://diasporanetwork.africa/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png',
              description:
                'A community-powered platform enabling Africa\'s diaspora to connect, collaborate, and contribute through a build-in-public prototype.',
            })}
          </script>
        </Helmet>

        <div className="min-h-screen bg-white">
          {/* Navigation Header */}
          <UnifiedHeader />

          {/* Prototype Banner */}
          <PrototypeBanner />

          {/* Hero Section with improved layout */}
          <HeroSection />

          {/* Slim How It Works section (targets hero scroll button) */}
          <HowItWorksSection />

          {/* Platform Feature Showcase */}
          <PlatformFeatureShowcase />

          {/* Building Together Section */}
          <BuildingTogetherSection />

          <Footer />

          <WaitlistPopup isOpen={showWaitlistPopup} onClose={closeWaitlistPopup} />
        </div>
      </>
    </HelmetProvider>
  );
};

export default Index;
