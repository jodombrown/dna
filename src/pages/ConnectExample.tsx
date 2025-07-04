import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import ConnectTabs from '@/components/connect/ConnectTabs';
import FeedbackPanel from '@/components/FeedbackPanel';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import CallToActionSection from '@/components/connect/CallToActionSection';
import SearchSection from '@/components/connect/search/SearchSection';
import { useConnectFiltering } from '@/hooks/useConnectFiltering';
import { Tabs } from '@/components/ui/tabs';
import MobilePageNavigation from '@/components/ui/mobile-page-navigation';

const ConnectExample = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('professionals');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    location: '',
    skills: [],
    isMentor: false,
    isInvestor: false,
    lookingForOpportunities: false
  });

  // Handle search parameter from URL
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);


  // Use custom hook for filtering
  const filteredData = useConnectFiltering(searchTerm, filters);

  // Simplified handlers - removed console.log statements for efficiency
  const handleConnect = (professionalId: string) => {
    // TODO: Implement actual connection logic
  };

  const handleMessage = (recipientId: string, recipientName: string) => {
    // TODO: Implement messaging logic
  };

  const handleJoinCommunity = () => {
    // TODO: Implement join community logic
  };

  const handleRegisterEvent = () => {
    // TODO: Implement event registration logic
  };

  const getConnectionStatus = (professionalId: string) => {
    return { status: 'not_connected' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PrototypeNotice />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="sticky top-16 z-20 bg-gray-50 pb-2 pt-2 border-b border-gray-200">
            <SearchSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearch={() => {}} // Search is automatic via real-time filtering
              onClearSearch={() => setSearchTerm('')}
              loading={false}
              filters={filters}
              onFiltersChange={setFilters}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              resultCounts={{
                professionals: filteredData.professionals.length,
                communities: filteredData.communities.length,
                events: filteredData.events.length
              }}
            />
          </div>
          
          <ConnectTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            professionals={filteredData.professionals}
            communities={filteredData.communities}
            events={filteredData.events}
            onConnect={handleConnect}
            onMessage={handleMessage}
            onJoinCommunity={handleJoinCommunity}
            onRegisterEvent={handleRegisterEvent}
            getConnectionStatus={getConnectionStatus}
            isLoggedIn={false}
            onRefresh={() => {}} // Remove console.log
          />
        </Tabs>
        
        <CallToActionSection onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </main>

      <Footer />
      
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
      
      <MobilePageNavigation currentPage="connect" />
    </div>
  );
};

export default ConnectExample;