import React from "react";
import Header from "@/components/Header";
import PrototypeBanner from "@/components/PrototypeBanner";
import Footer from "@/components/Footer";
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
import CreateEventDialog from "@/components/connect/CreateEventDialog";
import CreateCommunityDialog from "@/components/connect/CreateCommunityDialog";

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

  // State for dialogs
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = React.useState(false);

  if (initializing) {
    return <ConnectLoadingState message="Loading Professional Network..." />;
  }

  if (dataError) {
    return <ConnectErrorState error={dataError} onRetry={initializeData} />;
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PrototypeBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creation buttons for logged-in users */}
        {!!user && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              className="bg-dna-emerald text-white px-4 py-2 rounded font-semibold shadow hover:bg-dna-forest"
              onClick={() => setIsCreateEventOpen(true)}
            >
              + Create Event
            </button>
            <button
              className="bg-dna-copper text-white px-4 py-2 rounded font-semibold shadow hover:bg-dna-gold"
              onClick={() => setIsCreateCommunityOpen(true)}
            >
              + Create Community / Group
            </button>
          </div>
        )}

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
      </main>

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

      <CreateEventDialog open={isCreateEventOpen} setOpen={setIsCreateEventOpen} onCreated={initializeData} />
      <CreateCommunityDialog open={isCreateCommunityOpen} setOpen={setIsCreateCommunityOpen} onCreated={initializeData} />

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
