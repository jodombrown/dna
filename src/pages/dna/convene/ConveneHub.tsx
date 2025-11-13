import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { formatDistanceToNow } from 'date-fns';

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

  // Fetch upcoming events (basic - no recommendations yet)
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
          organizer_id
        `)
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(6);
      
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
          organizer_id
        `)
        .eq('organizer_id', user.id)
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

  return (
    <FeedLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Convene</h1>
          <p className="text-muted-foreground text-lg">
            Discover events and join groups in the African diaspora community
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dna/convene/events')}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-base font-semibold">Find Events</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dna/convene/groups')}
          >
            <Users className="h-6 w-6" />
            <span className="text-base font-semibold">Find Groups</span>
          </Button>
          
          <Button
            size="lg"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dna/convene/events/new')}
            disabled={!canHostEvent}
          >
            <Plus className="h-6 w-6" />
            <span className="text-base font-semibold">Host an Event</span>
          </Button>
        </div>

        {!canHostEvent && (
          <Card className="mb-8 border-warning">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Complete your profile to at least 40% to host events. 
                <Button 
                  variant="link" 
                  className="px-1"
                  onClick={() => navigate('/app/profile/edit')}
                >
                  Edit profile
                </Button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* My Next Events */}
        {myNextEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Next Events</h2>
              <Button 
                variant="ghost"
                onClick={() => navigate('/dna/convene/my-events')}
              >
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myNextEvents.map((event: any) => (
                <Card 
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/dna/convene/events/${event.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.start_time).toLocaleDateString()} · {event.format}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events For You */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button 
              variant="ghost"
              onClick={() => navigate('/dna/convene/events')}
            >
              View all
            </Button>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming events yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Card 
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/dna/convene/events/${event.id}`)}
                >
                  {event.cover_image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={event.cover_image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <p>{new Date(event.start_time).toLocaleDateString()}</p>
                        <p className="capitalize">{event.format.replace('_', ' ')}</p>
                        {event.location_city && (
                          <p>{event.location_city}, {event.location_country}</p>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Groups Highlight - Placeholder for future */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended Groups</h2>
            <Button 
              variant="ghost"
              onClick={() => navigate('/dna/convene/groups')}
            >
              View all
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Groups coming soon</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </FeedLayout>
  );
};

export default ConveneHub;
