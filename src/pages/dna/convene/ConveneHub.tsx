import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Plus, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { EventRecommendations } from '@/components/events/EventRecommendations';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { TYPOGRAPHY } from '@/lib/typography.config';
import PopularEventsSection from '@/components/connect/PopularEventsSection';
import EventCategoriesSection from '@/components/connect/EventCategoriesSection';
import LocalEventsSection from '@/components/connect/LocalEventsSection';
import { Event } from '@/types/search';
import { Badge } from '@/components/ui/badge';

const ConveneHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user's profile completion
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completion_percentage, user_type')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          format,
          location_city,
          location_country,
          cover_image_url,
          organizer_id,
          max_attendees,
          event_type
        `)
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(12);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's next events (hosting or attending)
  const { data: myNextEvents = [] } = useQuery({
    queryKey: ['my-next-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          start_time,
          format,
          location_city,
          location_country,
          organizer_id
        `)
        .or(`organizer_id.eq.${user.id}`)
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const canHostEvent = profile && (profile.profile_completion_percentage ?? 0) >= 40;

  // Transform events to match the Event type for PopularEventsSection
  const transformedEvents: Event[] = upcomingEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    date: event.start_time,
    time: new Date(event.start_time).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    location: event.format === 'virtual' 
      ? 'Virtual Event'
      : `${event.location_city || ''}${event.location_city && event.location_country ? ', ' : ''}${event.location_country || ''}`,
    creator: {
      id: event.organizer_id,
      name: 'Event Organizer',
      avatar: '',
    },
    attendees: event.max_attendees || 50,
    type: event.event_type || 'General',
    image: event.cover_image_url || '',
    tags: event.format ? [event.format] : [],
    created_at: event.start_time,
  }));

  const handleEventClick = (event: Event) => {
    navigate(`/dna/convene/events/${event.id}`);
  };

  const handleRegisterEvent = (event: Event) => {
    navigate(`/dna/convene/events/${event.id}`);
  };

  const handleCreatorClick = (creatorId: string) => {
    navigate(`/profile/${creatorId}`);
  };

  const handleViewAll = () => {
    navigate('/dna/convene/events');
  };

  const centerColumn = (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dna-emerald via-dna-forest to-dna-terra p-12 text-white">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Your Convene Hub
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-4 font-serif">
            Where the Diaspora Gathers
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover events, join communities, and turn connections into collaboration across the African diaspora.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-dna-forest hover:bg-white/90"
              onClick={() => navigate('/dna/convene/events')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Explore Events
            </Button>
            {canHostEvent && (
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/dna/convene/events/new')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Host an Event
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/dna/convene/groups')}
            >
              <Users className="h-5 w-5 mr-2" />
              Find Communities
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-l from-white/30 to-transparent"></div>
        </div>
      </div>

      {/* My Next Events */}
      {myNextEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${TYPOGRAPHY.h2} mb-2`}>My Next Events</h2>
              <p className="text-muted-foreground">Events you're hosting or attending</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dna/convene/my-events')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myNextEvents.map((event) => (
              <Card
                key={event.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/dna/convene/events/${event.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={event.format === 'virtual' ? 'secondary' : 'default'}>
                    {event.format}
                  </Badge>
                  {event.organizer_id === user?.id && (
                    <Badge variant="outline" className="text-dna-emerald border-dna-emerald">
                      Hosting
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(event.start_time), { addSuffix: true })}
                  </div>
                  {event.format !== 'virtual' && (event.location_city || event.location_country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location_city}{event.location_city && event.location_country ? ', ' : ''}{event.location_country}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* What is Convene Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 border-dna-copper/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-dna-copper/20 rounded-xl">
              <Calendar className="h-6 w-6 text-dna-copper" />
            </div>
            <h3 className="text-2xl font-bold font-serif">Events & Gatherings</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            From tech summits to cultural celebrations, discover convenings where the diaspora shows up together to learn, connect, and build.
          </p>
          <Button
            variant="ghost"
            className="text-dna-copper hover:text-dna-copper/80 p-0"
            onClick={() => navigate('/dna/convene/events')}
          >
            Browse All Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-dna-emerald/10 to-dna-forest/10 border-dna-emerald/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-dna-emerald/20 rounded-xl">
              <Users className="h-6 w-6 text-dna-emerald" />
            </div>
            <h3 className="text-2xl font-bold font-serif">Communities & Groups</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Join ongoing communities and local chapters where diaspora members collaborate on shared interests and impact initiatives.
          </p>
          <Button
            variant="ghost"
            className="text-dna-emerald hover:text-dna-emerald/80 p-0"
            onClick={() => navigate('/dna/convene/groups')}
          >
            Find Communities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      {/* Popular Events */}
      {transformedEvents.length > 0 && (
        <div>
          <PopularEventsSection
            events={transformedEvents}
            onEventClick={handleEventClick}
            onRegisterEvent={handleRegisterEvent}
            onCreatorClick={handleCreatorClick}
            onViewAll={handleViewAll}
          />
        </div>
      )}

      {/* AI Recommendations */}
      {user && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-dna-gold" />
              <h2 className={TYPOGRAPHY.h2}>Recommended For You</h2>
            </div>
            <p className="text-muted-foreground">Events matched to your interests and network</p>
          </div>
          <EventRecommendations />
        </div>
      )}

      {/* Event Categories */}
      <EventCategoriesSection />

      {/* Local Events */}
      <LocalEventsSection />

      {/* Bottom CTA */}
      {!canHostEvent && (
        <Card className="p-8 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 border-dna-emerald/20 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to Host Your Own Event?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Complete your profile to unlock event hosting and start bringing the diaspora together around your vision.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/profile/edit')}
            className="bg-dna-emerald hover:bg-dna-forest"
          >
            Complete Profile
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <LayoutController
      centerColumn={centerColumn}
      leftColumn={<LeftNav />}
      rightColumn={<RightWidgets />}
    />
  );
};

export default ConveneHub;
