
import React from 'react';
import { useConnectPageLogic } from '@/hooks/useConnectPageLogic';
import ConnectPageHeader from '@/components/connect/ConnectPageHeader';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import SearchSection from '@/components/connect/SearchSection';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import ConnectTabs from '@/components/connect/ConnectTabs';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  if (initializing) {
    return <ConnectLoadingState />;
  }

  if (dataError) {
    return <ConnectErrorState error={dataError} onRetry={initializeData} />;
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pillar Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-dna-forest font-semibold"
        >
          <ArrowLeft className="w-5 h-5" /> Home
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/contribute-example')}
          className="flex items-center gap-2 text-dna-copper font-semibold"
        >
          Contribute <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      <ConnectPageHeader totalCount={totalCount} />
      <PrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

