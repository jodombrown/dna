import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { CreateEventModal } from '@/components/convene/CreateEventModal';
import EventRegistrationSidebar from '@/components/connect/EventRegistrationSidebar';
import ModernEventCard from '@/components/connect/ModernEventCard';
import { Event } from '@/types/search';

const EventsPage = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch all upcoming events from Supabase
  const { data: events, isLoading } = useQuery({
    queryKey: ['all-upcoming-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(50);
      
      return data || [];
    },
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleRegisterEvent = () => {
    // Registration logic handled by EventRegistrationSidebar
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8 text-copper-500" />
                Discover Events
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect with the diaspora through meaningful gatherings
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              size="lg"
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Host Event
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <p className="text-muted-foreground">
            Explore gatherings across the African diaspora
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <ModernEventCard
                key={event.id}
                event={event as Event}
                onEventClick={handleEventClick}
                onRegisterEvent={handleRegisterEvent}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to host an event for the community
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-dna-emerald hover:bg-dna-forest text-white">
              <Plus className="h-4 w-4 mr-2" />
              Host an Event
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {selectedEvent && (
        <EventRegistrationSidebar
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          onRegister={handleRegisterEvent}
        />
      )}
    </div>
  );
};

export default EventsPage;
