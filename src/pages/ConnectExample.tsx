
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ConnectHeader from '@/components/connect/ConnectHeader';
import SearchSection from '@/components/connect/SearchSection';
import ProfessionalCard from '@/components/connect/ProfessionalCard';
import CommunityCard from '@/components/connect/CommunityCard';
import EventCard from '@/components/connect/EventCard';
import EmptyState from '@/components/connect/EmptyState';

const ConnectExample = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { professionals, communities, events, loading, searchProfessionals, searchCommunities, searchEvents, getAllData } = useSearch();
  const { sendConnectionRequest, checkConnectionStatus } = useConnections();
  const { sendMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');
  const [initializing, setInitializing] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeData();
  }, []);

  const initializeData = async () => {
    console.log('Loading network data...');
    setInitializing(true);
    setDataError(null);
    
    try {
      await getAllData();
      console.log('Data loaded successfully:', { 
        professionals: professionals.length, 
        communities: communities.length, 
        events: events.length 
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setDataError('Failed to load network data. Please refresh the page.');
      toast.error('Failed to load network data. Please refresh the page.');
    } finally {
      setInitializing(false);
    }
  };

  const handleSearch = async () => {
    if (activeTab === 'professionals') {
      await searchProfessionals(searchTerm);
    } else if (activeTab === 'communities') {
      await searchCommunities(searchTerm);
    } else if (activeTab === 'events') {
      await searchEvents(searchTerm);
    }
  };

  const handleConnect = async (professionalId: string) => {
    if (!user) {
      toast.error('Please log in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendConnectionRequest(professionalId, 'I would like to connect with you!');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/auth');
      return;
    }

    try {
      await sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    }
  };

  const getConnectionStatus = (professionalId: string) => {
    if (!user) return null;
    return checkConnectionStatus(professionalId);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading Professional Network...</div>
          <div className="text-gray-600">Connecting you with the diaspora community</div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xl font-semibold mb-2 text-red-600">Failed to Load Network</div>
          <div className="text-gray-600 mb-4">{dataError}</div>
          <button 
            onClick={initializeData}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectHeader totalCount={totalCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          loading={loading}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            {professionals.length === 0 ? (
              <EmptyState type="professionals" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onConnect={() => handleConnect(professional.id)}
                    onMessage={() => handleMessage(professional.id, professional.full_name)}
                    connectionStatus={getConnectionStatus(professional.id)}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities">
            {communities.length === 0 ? (
              <EmptyState type="communities" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {events.length === 0 ? (
              <EmptyState type="events" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectExample;
