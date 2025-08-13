import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import ConnectEventsTab from '@/components/connect/tabs/ConnectEventsTab';
import { Event } from '@/types/search';
import { searchEvents } from '@/services/eventsService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
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
  navigate(`/app/events/${event.id}`);
};

const handleRegisterEvent = async (event: Event) => {
  try {
    await supabase.rpc('rpc_event_register', { p_event: event.id });
    toast.success('Registered');
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('capacity_reached')) toast.error('This event is full.');
    else toast.error('Could not register');
  }
};

  const handleCreatorClick = (creatorId: string) => {
    toast.info('Viewing host profile');
  };

const handleViewAll = () => {
  navigate('/app/events');
};

  return (
    <section aria-labelledby="dashboard-events-heading" className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 id="dashboard-events-heading" className="text-2xl font-bold">Events</h2>
        {/* Soft-gated create event button */}
        <RequireProfileScore min={50} featureName="Create Event" showToast showModal={false}>
          <Button variant="dna" size="sm" aria-label="Create a new event" onClick={() => navigate('/events/new')}>Create event</Button>
        </RequireProfileScore>
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
