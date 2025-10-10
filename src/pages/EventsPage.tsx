import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { demoCommunities, demoEvents } from '@/data/demoSearchData';
import ConnectTabs from '@/components/connect/ConnectTabs';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEventModal } from '@/components/convene/CreateEventModal';

const EventsPage = () => {
  const { user } = useAuth();
  const [activeTab] = useState('events');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        {/* Create Event Button - Floating */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Host an Event
          </Button>
        </div>

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
            isLoggedIn={!!user}
            onRefresh={() => {}}
          />
        </Tabs>
      </div>

      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default EventsPage;
