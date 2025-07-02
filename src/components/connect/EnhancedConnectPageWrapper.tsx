
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import EnhancedSearchSection from '@/components/connect/EnhancedSearchSection';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import EnhancedConnectTabs from '@/components/connect/EnhancedConnectTabs';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const EnhancedConnectPageWrapper = () => {
  useScrollToTop();
  
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

  if (loading && professionals.length === 0 && communities.length === 0 && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PrototypeNotice />
        <ConnectLoadingState />
        <Footer />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PrototypeNotice />
        <ConnectErrorState error={dataError} onRetry={initializeData} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PrototypeNotice />

      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-dna-emerald to-dna-forest text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Build Your Professional Network
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
            Connect with diaspora professionals, join purpose-driven communities, and discover meaningful events that advance Africa's development
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { number: "2,500+", label: "Professionals", icon: "👥" },
              { number: "150+", label: "Communities", icon: "🌍" },
              { number: "300+", label: "Events", icon: "📅" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold">{stat.number}</div>
                <div className="text-emerald-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <EnhancedSearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={performSearch}
          onClearSearch={clearSearch}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          resultCounts={resultCounts}
        />

        <EnhancedConnectTabs
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

export default EnhancedConnectPageWrapper;
