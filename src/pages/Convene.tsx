import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import ConnectEventsTab from '@/components/connect/tabs/ConnectEventsTab';
import { Event } from '@/types/search';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Convene = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, loading } = useLiveEvents(50);

  const handleEventClick = (event: Event) => {
    navigate('/dna/events');
  };

  const handleRegisterEvent = async (event: Event) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to register for events",
          variant: "destructive",
        });
        return;
      }

      // Insert registration
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'going'
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: `You're registered for ${event.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register for event",
        variant: "destructive",
      });
    }
  };

  const handleCreatorClick = (creatorId: string) => {
    toast({
      title: "Creator Profile",
      description: "Viewing creator's profile...",
    });
  };

  const handleViewAll = () => {
    navigate('/dna/events');
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald"></div>
          </div>
        ) : (
          <ConnectEventsTab
            events={events as Event[]}
            onEventClick={handleEventClick}
            onRegisterEvent={handleRegisterEvent}
            onCreatorClick={handleCreatorClick}
            onViewAll={handleViewAll}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Convene;
