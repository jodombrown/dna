import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectPageHeader from '@/components/connect/ConnectPageHeader';
import ConnectTabs from '@/components/connect/ConnectTabs';
import SearchSection from '@/components/connect/SearchSection';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import { useConnectPageLogic } from '@/hooks/useConnectPageLogic';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';

const Connect = () => {
  useScrollToTop();
  const navigate = useNavigate();
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
    return <ConnectLoadingState message="Loading Professional Network..." />;
  }

  if (dataError) {
    return <ConnectErrorState error={dataError} onRetry={initializeData} />;
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation pills in top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex items-center gap-2 text-dna-forest font-semibold hover:underline bg-white rounded shadow px-3 py-1"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" /> Home
        </button>
        <button
          className="flex items-center gap-2 text-dna-copper font-semibold hover:underline bg-white rounded shadow px-3 py-1"
          onClick={() => navigate("/contribute")}
        >
          Contribute <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />
      
      <ConnectPageHeader totalCount={totalCount} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Notice */}
        <div className="mb-6 p-4 bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg">
          <h2 className="text-lg font-semibold text-dna-forest mb-2">
            🔧 Admin Access - Main Connect Platform
          </h2>
          <p className="text-sm text-gray-700">
            This is the main Connect page with full professional networking functionality. 
            Admin features are enabled for testing and development.
          </p>
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

        <CallToActionSection onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </div>

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

      <Footer />
    </div>
  );
};

export default Connect;
