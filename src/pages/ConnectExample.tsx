import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import ConnectTabs from '@/components/connect/ConnectTabs';
import FeedbackPanel from '@/components/FeedbackPanel';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import SearchSection from '@/components/connect/search/SearchSection';
import { useConnectFiltering } from '@/hooks/useConnectFiltering';
import { Tabs } from '@/components/ui/tabs';
import MobilePageNavigation from '@/components/ui/mobile-page-navigation';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';
import { demoCommunities, demoEvents, demoProfessionals } from '@/data/demoSearchData';

const ConnectExample = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();
  
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
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


  const filteredData = useConnectFiltering(searchTerm, filters);

  // Calculate accurate counts based on actual mock data
  const getTotalCounts = () => {
    return {
      professionals: demoProfessionals.length, // Now from single consolidated source
      communities: demoCommunities.length,
      events: demoEvents.length
    };
  };

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
      
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="sticky top-16 z-20 bg-gray-50 pb-4 pt-2 shadow-sm">
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
              resultCounts={getTotalCounts()}
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
        
        {/* Page-specific Survey CTA */}
        <div className="mt-12 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-emerald/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Help Us Build Better Networking
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your thoughts on how you connect with the diaspora community. 
            Your feedback will directly shape our networking features and user experience.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Connect Experience
          </button>
        </div>
      </main>

      <MobilePageNavigation currentPage="connect" />
      <Footer />
      
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="connect"
      />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={closeWaitlistPopup}
      />
    </div>
  );
};

export default ConnectExample;