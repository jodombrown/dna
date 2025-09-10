import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/eventTypes';
import { toast } from 'sonner';

// Event Components
import EventHero from '@/components/events/EventViewV2/EventHero';
import EventDetails from '@/components/events/EventViewV2/EventDetails';
import TicketTypePicker from '@/components/events/EventViewV2/TicketTypePicker';
import RegistrationForm from '@/components/events/EventViewV2/RegistrationForm';
import SocialProof from '@/components/events/EventViewV2/SocialProof';

const EventsBySlug: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<'selecting' | 'going' | 'pending' | 'waitlist'>('selecting');

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  // SEO: Update title, meta, canonical, and JSON-LD
  useEffect(() => {
    if (!event) return;

    const title = `${event.title} | DNA Events`;
    const description = (event.description || '').slice(0, 155);

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    const jsonLdEl = document.getElementById('event-json-ld');
    if (jsonLdEl) jsonLdEl.remove();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      startDate: event.date_time,
      description: event.description,
      image: [event.banner_url || event.image_url].filter(Boolean),
      eventAttendanceMode: event.is_virtual
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: event.is_virtual
        ? { '@type': 'VirtualLocation', url: window.location.href }
        : { '@type': 'Place', name: event.location, address: event.location },
      organizer: event.creator_profile
        ? { '@type': 'Organization', name: event.creator_profile.full_name }
        : undefined,
      url: window.location.href,
    } as any;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'event-json-ld';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [event]);

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

  const handleRegistrationComplete = (status: 'going' | 'pending' | 'waitlist') => {
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

  return (
    <div className="min-h-screen bg-background">
      <EventHero event={event} />
      
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
                    {registrationStatus === 'going' && 'Successfully Registered!'}
                    {registrationStatus === 'pending' && 'Registration Pending'}
                    {registrationStatus === 'waitlist' && 'Added to Waitlist'}
                  </h3>
                  <p className="text-sm text-green-700">
                    {registrationStatus === 'going' && 'You\'re all set for this event. Check your email for details.'}
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
};

export default EventsBySlug;