
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ConnectHeader from '@/components/connect/ConnectHeader';
import SearchSection from '@/components/connect/SearchSection';
import ConnectTabNavigation from '@/components/connect/ConnectTabNavigation';
import ConnectContent from '@/components/connect/ConnectContent';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { Professional, Community, Event } from '@/types/search';
import { mockProfessionals, mockCommunities, mockEvents } from '@/data/mockConnectData';

const ConnectExample = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'professionals' | 'communities' | 'events'>('professionals');

  const { loading } = useSearch();
  const { sendMessage } = useMessages();

  const handleConnect = (professional: Professional) => {
    console.log('Connecting to:', professional.full_name);
  };

  const handleMessage = (professional: Professional) => {
    sendMessage(professional.id, `Hi ${professional.full_name.split(' ')[0]}, I'd love to connect and learn more about your work!`);
  };

  const handleJoinCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setShowJoinDialog(true);
  };

  const handleRegisterEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowRegisterDialog(true);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const isLoggedIn = false; // Mock logged out state for demo

  const totalCount = activeTab === 'professionals' ? mockProfessionals.length : 
                   activeTab === 'communities' ? mockCommunities.length : 
                   mockEvents.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectHeader totalCount={totalCount} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-dna-copper text-white text-sm px-3 py-1">
              Platform Preview
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Connect with Africa's Global Network
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Discover and connect with verified African diaspora professionals, join thriving communities, 
            and participate in events that drive meaningful change across the continent.
          </p>
        </div>

        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={() => console.log('Searching...')}
          loading={loading}
        />

        <ConnectTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-8">
          <ConnectContent
            activeTab={activeTab}
            searchTerm={searchTerm}
            mockProfessionals={mockProfessionals}
            mockCommunities={mockCommunities}
            mockEvents={mockEvents}
            isLoggedIn={isLoggedIn}
            onConnect={handleConnect}
            onMessage={handleMessage}
            onJoinCommunity={handleJoinCommunity}
            onRegisterEvent={handleRegisterEvent}
            onRefresh={handleRefresh}
          />
        </div>
      </main>

      <ConnectDialogs
        showJoinDialog={showJoinDialog}
        showRegisterDialog={showRegisterDialog}
        selectedCommunity={selectedCommunity}
        selectedEvent={selectedEvent}
        setShowJoinDialog={setShowJoinDialog}
        setShowRegisterDialog={setShowRegisterDialog}
      />
    </div>
  );
};

export default ConnectExample;
