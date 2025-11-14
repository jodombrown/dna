import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, MapPin, Edit, Eye, BarChart3, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { format } from 'date-fns';
import { EventCalendarView } from '@/components/convene/EventCalendarView';

const MyEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch events I'm hosting
  const { data: hostingEvents = [], isLoading: hostingLoading } = useQuery({
    queryKey: ['hosting-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(count)
        `)
        .eq('organizer_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch events I'm attending
  const { data: attendingEvents = [], isLoading: attendingLoading } = useQuery({
    queryKey: ['attending-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id, status')
        .eq('user_id', user.id)
        .in('status', ['going', 'maybe']);

      if (attendeeError) throw attendeeError;
      if (!attendeeData || attendeeData.length === 0) return [];

      const eventIds = attendeeData.map(a => a.event_id);
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      return events?.map(event => ({
        ...event,
        rsvp_status: attendeeData.find(a => a.event_id === event.id)?.status
      })) || [];
    },
    enabled: !!user,
  });

  const now = new Date();

  const upcomingHosting = hostingEvents.filter(e => new Date(e.start_time) > now);
  const pastHosting = hostingEvents.filter(e => new Date(e.start_time) <= now);
  const upcomingAttending = attendingEvents.filter(e => new Date(e.start_time) > now);
  const pastAttending = attendingEvents.filter(e => new Date(e.start_time) <= now);

  const EventCard = ({ event, isHost = false }: any) => {
    const isPast = new Date(event.start_time) < now;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {event.event_type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {event.format.replace('_', ' ')}
                </Badge>
                {isPast && <Badge variant="secondary">Past</Badge>}
                {event.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
                {!isHost && event.rsvp_status && (
                  <Badge variant={event.rsvp_status === 'going' ? 'default' : 'outline'}>
                    {event.rsvp_status}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.start_time), 'MMM d, yyyy · h:mm a')}</span>
                </div>
                {(event.location_city || event.meeting_url) && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.format === 'virtual' 
                        ? 'Online' 
                        : `${event.location_city}, ${event.location_country}`
                      }
                    </span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isHost && (
                <>
                  <Users className="h-4 w-4" />
                  <span>{event.event_attendees?.[0]?.count || 0} attendees</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dna/convene/events/${event.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              {isHost && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dna/convene/events/${event.id}/analytics`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  {!isPast && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dna/convene/events/${event.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <FeedLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground text-lg">
              Manage events you're hosting and attending
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
            <Button onClick={() => navigate('/dna/convene/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <EventCalendarView events={[...hostingEvents, ...attendingEvents]} />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Tabs defaultValue="hosting" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hosting">
              Hosting ({hostingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="attending">
              Attending ({attendingEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* Hosting Tab */}
          <TabsContent value="hosting" className="space-y-6">
            {hostingLoading ? (
              <p className="text-center text-muted-foreground">Loading events...</p>
            ) : hostingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No events yet</p>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any events yet. Host one to bring the diaspora together!
                  </p>
                  <Button onClick={() => navigate('/dna/convene/events/new')}>
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {upcomingHosting.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingHosting.map(event => (
                        <EventCard key={event.id} event={event} isHost />
                      ))}
                    </div>
                  </div>
                )}

                {pastHosting.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastHosting.map(event => (
                        <EventCard key={event.id} event={event} isHost />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Attending Tab */}
          <TabsContent value="attending" className="space-y-6">
            {attendingLoading ? (
              <p className="text-center text-muted-foreground">Loading events...</p>
            ) : attendingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No events yet</p>
                  <p className="text-muted-foreground mb-4">
                    You haven't RSVP'd to any events yet. Browse upcoming events to get started!
                  </p>
                  <Button onClick={() => navigate('/dna/convene/events')}>
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {upcomingAttending.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingAttending.map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {pastAttending.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastAttending.map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </FeedLayout>
  );
};

export default MyEvents;
