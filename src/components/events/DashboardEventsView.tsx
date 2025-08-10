import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ConnectEventsTab from '@/components/connect/tabs/ConnectEventsTab';
import { Event } from '@/types/search';
import { searchEvents } from '@/services/eventsService';
import { toast } from 'sonner';

const DashboardEventsView: React.FC = () => {
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
    loadEvents();
  }, []);

  const handleEventClick = (event: Event) => {
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
    <section aria-labelledby="dashboard-events-heading" className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 id="dashboard-events-heading" className="text-2xl font-bold">Events</h2>
        <Button onClick={() => navigate('/app/events/new')}>Create event</Button>
      </header>

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
    </section>
  );
};

export default DashboardEventsView;
