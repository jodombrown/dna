
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
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
  } = useAdvancedSearch();
  
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
        description: "Please sign in to connect with professionals",
      });
      return;
    }
    setIsConnectDialogOpen(true);
  };

  const handleMessage = (userId: string, userName: string) => {
    if (!user) {
      toast({
        title: "Sign In Required", 
        description: "Please sign in to send messages",
      });
      return;
    }
    setIsMessageDialogOpen(true);
  };

  const handleJoinCommunity = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to join communities", 
      });
      return;
    }
    setIsJoinCommunityDialogOpen(true);
  };

  const handleRegisterEvent = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to register for events",
      });
      return;
    }
    setIsRegisterEventDialogOpen(true);
  };

  const getConnectionStatus = (userId: string) => {
    return 'none'; // Demo status
  };

  const initializeData = () => {
    // This is handled automatically by useAdvancedSearch
    console.log('Data initialized automatically');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

        <CallToActionSection onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
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
