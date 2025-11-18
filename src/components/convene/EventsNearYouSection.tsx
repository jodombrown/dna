import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernEventCard from '@/components/connect/ModernEventCard';

export function EventsNearYouSection() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['events-near-you'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { events: [], location: null };

      // Get user's location from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_country, current_city')
        .eq('id', user.id)
        .single();

      if (!profile?.current_country) {
        return { events: [], location: null };
      }

      // Query events near user's location
      let query = supabase
        .from('events')
        .select(`
          *,
          event_attendees(count)
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(6);

      // Match by country
      query = query.eq('location_country', profile.current_country);

      const { data: events, error } = await query;

      if (error) throw error;

      // If user has a city, prioritize events in same city
      let sortedEvents = events || [];
      if (profile.current_city && sortedEvents.length > 0) {
        sortedEvents = sortedEvents.sort((a, b) => {
          const aMatchesCity = a.location_city?.toLowerCase() === profile.current_city?.toLowerCase();
          const bMatchesCity = b.location_city?.toLowerCase() === profile.current_city?.toLowerCase();
          if (aMatchesCity && !bMatchesCity) return -1;
          if (!aMatchesCity && bMatchesCity) return 1;
          return 0;
        });
      }

      return {
        events: sortedEvents,
        location: {
          country: profile.current_country,
          city: profile.current_city
        }
      };
    }
  });

  // No location set
  if (!isLoading && !data?.location) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Events Near You</h2>
        <Card className="p-8 text-center border-dashed">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Set your location</h3>
          <p className="text-muted-foreground mb-4">
            We don't know where you are yet. Set your location to find nearby events.
          </p>
          <Button onClick={() => navigate('/dna/profile')}>
            Set Location
          </Button>
        </Card>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Events Near You</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const { events, location } = data;

  // Has location but no events
  if (!events || events.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Events Near You</h2>
            {location && (
              <p className="text-sm text-muted-foreground">
                Based on your location: {location.city ? `${location.city}, ` : ''}{location.country}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dna/profile')}
            className="gap-2"
          >
            Change location
          </Button>
        </div>
        <Card className="p-8 text-center border-dashed">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            No events near {location?.city || location?.country} yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Be the first to host one and bring your community together.
          </p>
          <Button
            onClick={() => {
              const params = new URLSearchParams();
              if (location?.country) params.set('location_country', location.country);
              if (location?.city) params.set('location_city', location.city);
              navigate(`/dna/convene/events/new?${params.toString()}`);
            }}
          >
            Host an Event
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events Near You</h2>
          {location && (
            <p className="text-sm text-muted-foreground">
              Based on your location: {location.city ? `${location.city}, ` : ''}{location.country}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            const params = new URLSearchParams();
            if (location?.country) params.set('country', location.country);
            navigate(`/dna/convene/events?${params.toString()}`);
          }}
          className="gap-2"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => (
          <ModernEventCard
            key={event.id}
            event={event}
            onEventClick={() => navigate(`/dna/convene/events/${event.id}`)}
            onRegisterEvent={() => navigate(`/dna/convene/events/${event.id}`)}
          />
        ))}
      </div>
    </section>
  );
}
