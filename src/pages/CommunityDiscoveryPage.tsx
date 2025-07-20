import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityDiscovery from '@/components/community/CommunityDiscovery';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const CommunityDiscoveryPage = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CommunityDiscovery />
      </div>

      <Footer />
    </div>
  );
};

export default CommunityDiscoveryPage;