import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEventModal } from '@/components/convene/CreateEventModal';
import { Event } from '@/types/search';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import EventListPanel from '@/components/events/EventListPanel';
import EventDetailPanel from '@/components/events/EventDetailPanel';
import { toast } from 'sonner';

const EventsPage = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch upcoming events from Supabase
  const { data: events, isLoading } = useQuery({
    queryKey: ['all-upcoming-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(20);
      
      return data || [];
    },
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleRegister = async (event: Event) => {
    if (!user) {
      toast.error('Please sign in to register for events');
      return;
    }

    try {
      // TODO: Implement actual registration logic
      toast.success('Successfully registered for event!');
    } catch (error) {
      toast.error('Failed to register for event');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      {/* CONVENE_MODE: Two-column layout (60%-40%) */}
      <TwoColumnLayout
        leftWidth="60%"
        rightWidth="40%"
        left={
          <EventListPanel
            events={events || []}
            selectedEvent={selectedEvent}
            isLoading={isLoading}
            onEventClick={handleEventClick}
            onCreateEvent={() => setShowCreateModal(true)}
          />
        }
        right={
          <EventDetailPanel
            event={selectedEvent}
            onRegister={handleRegister}
          />
        }
      />

      {/* Modals */}
      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      
      <MobileBottomNav />
    </div>
  );
};

export default EventsPage;
