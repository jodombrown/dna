
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistSection from '@/components/WaitlistSection';
import WaitlistPopup from '@/components/WaitlistPopup';
import CommunitySpotlight from '@/components/community/CommunitySpotlight';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useScrollToTop();
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const { user, loading } = useAuth();

  // Redirect authenticated users to app dashboard
  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  // Show loading for auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-dna-emerald mx-auto mb-4"></div>
          <p className="text-dna-forest font-medium">Loading DNA Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DNA - Diaspora Network of Africa | Connect, Collaborate, Contribute"
        description="Join the global African diaspora network. Connect with 500+ professionals, collaborate on impactful projects, and contribute to Africa's development. Building bridges across continents for African advancement."
        keywords="African diaspora, Africa development, professional network, diaspora platform, African professionals, impact network, collaborate Africa, contribute Africa"
        url="https://diasporanetwork.africa"
      />
      
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <HeroSection />

      {/* Platform Feature Showcase */}
      <PlatformFeatureShowcase />

      {/* Waitlist Section */}
      <WaitlistSection onJoinClick={() => setShowWaitlistDialog(true)} />

      <Footer />

      {/* Waitlist Dialog */}
      <WaitlistPopup 
        isOpen={showWaitlistDialog} 
        onClose={() => setShowWaitlistDialog(false)} 
      />
    </div>
  );
};

export default Index;
