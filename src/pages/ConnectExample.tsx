
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
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
import { useAuth } from '@/contexts/AuthContext';

const ConnectExample = () => {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);

  const handleSearch = () => {
    console.log('Search functionality placeholder');
  };

  const handleConnect = () => {
    setIsConnectDialogOpen(true);
  };

  const handleMessage = () => {
    setIsMessageDialogOpen(true);
  };

  const handleJoinCommunity = () => {
    setIsJoinCommunityDialogOpen(true);
  };

  const handleRegisterEvent = () => {
    setIsRegisterEventDialogOpen(true);
  };

  const getConnectionStatus = () => {
    return 'none';
  };

  const initializeData = () => {
    console.log('Initialize data placeholder');
  };

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
