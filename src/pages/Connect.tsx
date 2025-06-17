
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConnectPageHeader from '@/components/connect/ConnectPageHeader';
import SearchSection from '@/components/connect/SearchSection';
import ConnectTabs from '@/components/connect/ConnectTabs';
import CallToActionSection from '@/components/connect/CallToActionSection';
import ConnectLoadingState from '@/components/connect/ConnectLoadingState';
import ConnectErrorState from '@/components/connect/ConnectErrorState';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import { useConnectPageLogic } from '@/hooks/useConnectPageLogic';
import { useConnectSearch } from '@/hooks/useConnectSearch';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';

const Connect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);
  
  const {
    activeTab,
    setActiveTab,
    connectionStatuses,
    handleConnect,
    handleMessage,
    handleJoinCommunity,
    handleRegisterEvent,
    getConnectionStatus
  } = useConnectPageLogic();

  const {
    searchTerm,
    setSearchTerm,
    professionals,
    communities,
    events,
    loading,
    error,
    handleSearch,
    refreshData
  } = useConnectSearch();

  // Show loading state initially
  if (loading && professionals.length === 0 && communities.length === 0 && events.length === 0) {
    return <ConnectLoadingState />;
  }

  // Show error state if there's an error
  if (error) {
    return <ConnectErrorState error={error} onRetry={refreshData} />;
  }

  const totalMembers = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectPageHeader totalCount={totalMembers} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PrototypeNotice />
        
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
          onRefresh={refreshData}
        />

        <CallToActionSection onFeedbackClick={() => setIsBetaSignupOpen(true)} />
      </div>

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </div>
  );
};

export default Connect;
