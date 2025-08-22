import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ConnectEventsTab from '@/components/connect/tabs/ConnectEventsTab';
import { Event } from '@/types/search';
import { searchEvents } from '@/services/eventsService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
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
    toast.message('Showing all upcoming events');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <RequireProfileScore min={50} featureName="Create Event" showToast showModal={false}>
          <Button onClick={() => navigate('/events/new')}>Create event</Button>
        </RequireProfileScore>
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
