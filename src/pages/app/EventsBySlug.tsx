import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/eventTypes';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

// V1 Components
import EventHero from '@/components/events/EventViewV2/EventHero';
import EventDetails from '@/components/events/EventViewV2/EventDetails';
import EventTicketPicker from '@/components/events/EventViewV2/EventTicketPicker';
import EventSocialProof from '@/components/events/EventViewV2/EventSocialProof';

// V2 Components
import Hero from '@/components/events/EventViewV2/Hero';
import TicketTypePicker from '@/components/events/EventViewV2/TicketTypePicker';
import RegistrationForm from '@/components/events/EventViewV2/RegistrationForm';
import SocialProof from '@/components/events/EventViewV2/SocialProof';

const EventsBySlug: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { eventsV2 } = useFeatureFlags();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<'selecting' | 'registered' | 'pending' | 'waitlist'>('selecting');

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator_profile:profiles!events_created_by_fkey(full_name, email)
        `)
        .eq('slug', slug)
        .eq('visibility', 'public')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Event not found');
        } else {
          throw error;
        }
        return;
      }

      setEvent({
        ...data,
        creator_profile: data.creator_profile && typeof data.creator_profile === 'object' && !Array.isArray(data.creator_profile) && 'full_name' in data.creator_profile 
          ? data.creator_profile as { full_name: string; email: string; }
          : null
      });
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticketTypeId: string) => {
    setSelectedTicketType(ticketTypeId);
  };

  const handleRegistrationComplete = (status: 'registered' | 'pending' | 'waitlist') => {
    setRegistrationStatus(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (eventsV2) {
    // V2 Layout with flag-aware renderer
    return (
      <div className="min-h-screen bg-background">
        <Hero event={event} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <EventDetails event={event} />
              <SocialProof event={event} />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                {registrationStatus === 'selecting' && (
                  <TicketTypePicker 
                    event={event} 
                    onTicketSelect={handleTicketSelect}
                  />
                )}
                
                {selectedTicketType && registrationStatus === 'selecting' && (
                  <RegistrationForm
                    event={event}
                    ticketTypeId={selectedTicketType}
                    onRegistrationComplete={handleRegistrationComplete}
                  />
                )}
                
                {registrationStatus !== 'selecting' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">
                      {registrationStatus === 'registered' && 'Successfully Registered!'}
                      {registrationStatus === 'pending' && 'Registration Pending'}
                      {registrationStatus === 'waitlist' && 'Added to Waitlist'}
                    </h3>
                    <p className="text-sm text-green-700">
                      {registrationStatus === 'registered' && 'You\'re all set for this event. Check your email for details.'}
                      {registrationStatus === 'pending' && 'Your registration is pending approval by the event organizer.'}
                      {registrationStatus === 'waitlist' && 'You\'ll be notified if a spot becomes available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // V1 Layout (fallback)
  return (
    <div className="min-h-screen bg-background">
      <EventHero event={event} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <EventDetails event={event} />
            <EventSocialProof event={event} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <EventTicketPicker event={event} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsBySlug;