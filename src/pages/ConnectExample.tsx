
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { SkipToContent } from '@/components/ui/accessibility-focus';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import SearchSection from '@/components/connect/SearchSection';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import ConnectTabs from '@/components/connect/ConnectTabs';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

const ConnectExample = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  useScrollToTop();
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filters, 
    setFilters,
    professionals, 
    communities, 
    events, 
    loading, 
    clearSearch,
    performSearch,
    resultCounts 
  } = useEnhancedSearch();
  
  const [activeTab, setActiveTab] = useState('professionals');
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Dialog states
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);

  const handleConnect = (userId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to connect with professionals and unlock networking features",
      });
      return;
    }
    setIsConnectDialogOpen(true);
  };

  const handleMessage = (userId: string, userName: string) => {
    if (!user) {
      toast({
        title: "Sign In Required", 
        description: "Please sign in to send messages and start conversations",
      });
      return;
    }
    setIsMessageDialogOpen(true);
  };

  const handleJoinCommunity = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to join communities, participate in discussions, and receive updates", 
      });
      return;
    }
    setIsJoinCommunityDialogOpen(true);
  };

  const handleRegisterEvent = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to register for events and connect with other attendees",
      });
      return;
    }
    setIsRegisterEventDialogOpen(true);
  };

  const getConnectionStatus = (userId: string) => {
    return 'none'; // Demo status
  };

  const initializeData = () => {
    // This is handled automatically by useEnhancedSearch
    console.log('Data initialized automatically');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipToContent />
      <Header />

      <PrototypeNotice />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={performSearch}
          onClearSearch={clearSearch}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          resultCounts={resultCounts}
        />

        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <ConnectTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            professionals={professionals}
            communities={communities}
            events={events}
            onConnect={handleConnect}
            onMessage={handleMessage}
            onJoinCommunity={handleJoinCommunity}
            onRegisterEvent={handleRegisterEvent}
            getConnectionStatus={getConnectionStatus}
            isLoggedIn={!!user}
            onRefresh={initializeData}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CallToActionSection onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
        </div>
      </main>

      <Footer />
      
      <ConnectDialogs
        isConnectDialogOpen={isConnectDialogOpen}
        setIsConnectDialogOpen={setIsConnectDialogOpen}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isJoinCommunityDialogOpen={isJoinCommunityDialogOpen}
        setIsJoinCommunityDialogOpen={setIsJoinCommunityDialogOpen}
        isRegisterEventDialogOpen={isRegisterEventDialogOpen}
        setIsRegisterEventDialogOpen={setIsRegisterEventDialogOpen}
      />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
    </div>
  );
};

export default ConnectExample;
