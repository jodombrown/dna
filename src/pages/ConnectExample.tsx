
import React from 'react';
import Header from '@/components/Header';
import { useConnectPageLogic } from '@/hooks/useConnectPageLogic';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import SearchSection from '@/components/connect/SearchSection';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import ConnectTabs from '@/components/connect/ConnectTabs';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';

const ConnectExample = () => {
  const {
    professionals,
    communities,
    events,
    loading,
    initializing,
    dataError,
    user,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isConnectDialogOpen,
    setIsConnectDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isJoinCommunityDialogOpen,
    setIsJoinCommunityDialogOpen,
    isRegisterEventDialogOpen,
    setIsRegisterEventDialogOpen,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    handleSearch,
    handleConnect,
    handleMessage,
    handleJoinCommunity,
    handleRegisterEvent,
    getConnectionStatus,
    initializeData
  } = useConnectPageLogic();

  if (initializing) {
    return <ConnectLoadingState />;
  }

  if (dataError) {
    return <ConnectErrorState error={dataError} onRetry={initializeData} />;
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Network</h1>
          <p className="text-gray-600">Connect with {totalCount}+ diaspora professionals worldwide</p>
        </div>

        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          loading={loading}
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

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        )}

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
