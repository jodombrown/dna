
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectHero from '@/components/connect/ConnectHero';
import NetworkingTabs from '@/components/connect/NetworkingTabs';
import ConnectionRecommendations from '@/components/connect/ConnectionRecommendations';
import FeedbackPanel from '@/components/FeedbackPanel';

const Connect = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ConnectHero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <NetworkingTabs />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ConnectionRecommendations />
          </div>
        </div>
      </main>

      <Footer />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
    </div>
  );
};

export default Connect;
