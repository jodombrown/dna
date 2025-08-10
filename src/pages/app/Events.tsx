import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ConnectEventsTab from '@/components/connect/tabs/ConnectEventsTab';
import { Event } from '@/types/search';
import { searchEvents } from '@/services/eventsService';
import { toast } from 'sonner';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
    document.title = 'Events | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Discover upcoming DNA community events and meetups.');
    loadEvents();
  }, []);

  const handleEventClick = (event: Event) => {
    // We can wire a full event details route next
    toast.info(`Opening: ${event.title}`);
  };

  const handleRegisterEvent = (event: Event) => {
    toast.success('Registration started');
  };

  const handleCreatorClick = (creatorId: string) => {
    toast.info('Viewing host profile');
  };

  const handleViewAll = () => {
    toast.message('Showing all upcoming events');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => navigate('/app/events/new')}>Create event</Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">Loading…</div>
      ) : (
        <ConnectEventsTab
          events={events}
          onEventClick={handleEventClick}
          onRegisterEvent={handleRegisterEvent}
          onCreatorClick={handleCreatorClick}
          onViewAll={handleViewAll}
        />
      )}
    </div>
  );
}
