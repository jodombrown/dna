import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectTabs from '@/components/connect/ConnectTabs';
import { Event } from '@/types/search';
import { searchEvents } from '@/services/eventsService';
import { toast } from 'sonner';

const Connect = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await searchEvents('', { upcoming_only: true });
      setEvents(data);
    } catch (e) {
      console.error('Failed to load events', e);
      toast.error('Could not load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Connect | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Discover people, communities, and events across the DNA network.');
    loadEvents();
  }, []);

  const handleConnect = (professionalId: string) => {
    toast.success('Connection request sent');
  };

  const handleMessage = (recipientId: string, recipientName: string) => {
    toast.info(`Start a conversation with ${recipientName}`);
  };

  const handleJoinCommunity = () => {
    toast.success('Join request submitted');
  };

  const handleRegisterEvent = () => {
    // Prototype keeps this as a guided sidebar flow; real registration can be wired next
    toast.success('Registration started');
  };

  const getConnectionStatus = () => ({ status: 'none' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">Loading…</div>
      ) : (
        <ConnectTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          professionals={[]}
          communities={[]}
          events={events}
          onConnect={handleConnect}
          onMessage={handleMessage}
          onJoinCommunity={handleJoinCommunity}
          onRegisterEvent={handleRegisterEvent}
          getConnectionStatus={getConnectionStatus}
          isLoggedIn={true}
          onRefresh={loadEvents}
        />
      )}
    </div>
  );
};

export default Connect;