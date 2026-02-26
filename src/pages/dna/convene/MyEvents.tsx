import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, BarChart3, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { EventCalendarView } from '@/components/convene/EventCalendarView';
import { ConveneEventCard } from '@/components/convene/ConveneEventCard';
import { CulturalPattern } from '@/components/shared/CulturalPattern';

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

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden rounded-xl p-6">
            <CulturalPattern pattern="kente" opacity={0.05} />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">My Events</h1>
              <p className="text-muted-foreground text-lg">
                Manage events you're hosting and attending
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
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
                          <ConveneEventCard
                            key={event.id}
                            event={event}
                            variant="compact"
                            showActions
                            isOrganizer
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {pastHosting.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pastHosting.map(event => (
                          <ConveneEventCard
                            key={event.id}
                            event={event}
                            variant="compact"
                            showActions
                            isOrganizer
                          />
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
                      You're not registered for any events yet.
                    </p>
                    <Button onClick={() => navigate('/dna/convene')}>
                      Discover Events
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
                          <ConveneEventCard
                            key={event.id}
                            event={event}
                            variant="compact"
                            rsvpStatus={event.rsvp_status as 'going' | 'maybe' | null}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {pastAttending.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pastAttending.map(event => (
                          <ConveneEventCard
                            key={event.id}
                            event={event}
                            variant="compact"
                            rsvpStatus={event.rsvp_status as 'going' | 'maybe' | null}
                          />
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
      }
      rightColumn={<RightWidgets variant="convene" />}
    />
  );
};

export default MyEvents;
