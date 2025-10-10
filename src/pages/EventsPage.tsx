import React, { useState } from 'react';
import { demoCommunities, demoEvents } from '@/data/demoSearchData';
import ConnectTabs from '@/components/connect/ConnectTabs';
import { Tabs } from '@/components/ui/tabs';

const EventsPage = () => {
  const [activeTab] = useState('events');

  const handleConnect = (professionalId: string) => {
    // Connection logic handled by ConnectTabs
  };

  const handleMessage = (recipientId: string, recipientName: string) => {
    // Messaging logic handled by ConnectTabs
  };

  const handleJoinCommunity = () => {
    // Join community logic handled by ConnectTabs
  };

  const handleRegisterEvent = () => {
    // Event registration logic handled by ConnectTabs
  };

  const getConnectionStatus = (professionalId: string) => {
    return { status: 'not_connected' };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab}>
          <ConnectTabs
            activeTab={activeTab}
            setActiveTab={() => {}}
            professionals={[]}
            communities={demoCommunities}
            events={demoEvents}
            onConnect={handleConnect}
            onMessage={handleMessage}
            onJoinCommunity={handleJoinCommunity}
            onRegisterEvent={handleRegisterEvent}
            getConnectionStatus={getConnectionStatus}
            isLoggedIn={false}
            onRefresh={() => {}}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default EventsPage;
