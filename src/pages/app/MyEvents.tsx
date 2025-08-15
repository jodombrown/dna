import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PostListSkeleton } from '@/components/ui/loading-skeleton';
import { Calendar, Clock, MapPin, Users, Plus, CalendarDays, Ticket, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserEvent {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  type?: string;
  max_attendees?: number;
  attendee_count: number;
  image_url?: string;
  created_by: string;
  status?: string;
  registration_status?: 'going' | 'waitlisted';
  checked_in_at?: string;
}

const EventCard: React.FC<{ event: UserEvent; showManageButton?: boolean }> = ({ 
  event, 
  showManageButton = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isOwner = user?.id === event.created_by;
  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const { date, time } = formatDate(event.date_time);
  const isPast = new Date(event.date_time) < new Date();

  const getStatusBadge = () => {
    if (isPast) {
      if (event.checked_in_at) {
        return <Badge className="bg-green-100 text-green-800">Attended</Badge>;
      }
      return <Badge variant="secondary">Past</Badge>;
    }
    
    if (event.registration_status === 'waitlisted') {
      return <Badge variant="outline">Waitlisted</Badge>;
    }
    
    if (event.registration_status === 'going') {
      return <Badge className="bg-blue-100 text-blue-800">Registered</Badge>;
    }
    
    return null;
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/app/events/${event.id}`)}>
      <CardHeader className="pb-3">
        {event.image_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">{event.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="mr-3">{date}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{time}</span>
            </div>
            {event.location && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 ml-2">
            {event.type && (
              <Badge variant="secondary">{event.type}</Badge>
            )}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>
              {event.attendee_count}
              {event.max_attendees && ` / ${event.max_attendees}`}
              {isFull && <span className="text-amber-600 ml-1">(Full)</span>}
            </span>
          </div>

          {showManageButton && isOwner && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/events/${event.id}/manage`);
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
  const [myRSVPs, setMyRSVPs] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'rsvps'>('created');

  const loadMyEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('date_time', { ascending: false });

      if (error) throw error;
      setMyEvents(data || []);
    } catch (error) {
      console.error('Failed to load my events:', error);
      toast({ title: "Failed to load your events", variant: "destructive" });
    }
  };

  const loadMyRSVPs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          registered_at,
          status,
          event_id,
          events (
            id,
            title,
            description,
            date_time,
            location,
            type,
            max_attendees,
            attendee_count,
            image_url,
            created_by
          ),
          event_checkins (
            checked_in_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const rsvpEvents = (data || []).map((registration: any) => ({
        ...registration.events,
        registration_status: registration.status,
        checked_in_at: registration.event_checkins?.[0]?.checked_in_at,
      }));

      setMyRSVPs(rsvpEvents);
    } catch (error) {
      console.error('Failed to load RSVP events:', error);
      toast({ title: "Failed to load your RSVPs", variant: "destructive" });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMyEvents(), loadMyRSVPs()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    document.title = 'My Events | DNA';
  }, []);

  const upcomingEvents = myEvents.filter(event => new Date(event.date_time) > new Date());
  const pastEvents = myEvents.filter(event => new Date(event.date_time) <= new Date());

  const upcomingRSVPs = myRSVPs.filter(event => new Date(event.date_time) > new Date());
  const pastRSVPs = myRSVPs.filter(event => new Date(event.date_time) <= new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Button onClick={() => navigate('/events/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Events I Created ({myEvents.length})
          </TabsTrigger>
          <TabsTrigger value="rsvps" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My RSVPs ({myRSVPs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-6">
          {loading ? (
            <PostListSkeleton count={4} />
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events ({upcomingEvents.length})</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        showManageButton 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming events"
                    description="You haven't created any upcoming events yet."
                    action={{
                      label: "Create your first event",
                      onClick: () => navigate('/events/new')
                    }}
                  />
                )}
              </div>

              {pastEvents.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Events ({pastEvents.length})</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pastEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        showManageButton 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rsvps" className="space-y-6">
          {loading ? (
            <PostListSkeleton count={4} />
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming RSVPs ({upcomingRSVPs.length})</h2>
                {upcomingRSVPs.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingRSVPs.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Ticket}
                    title="No upcoming RSVPs"
                    description="You haven't RSVP'd to any upcoming events yet."
                    action={{
                      label: "Discover events",
                      onClick: () => navigate('/app/events')
                    }}
                  />
                )}
              </div>

              {pastRSVPs.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Events ({pastRSVPs.length})</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pastRSVPs.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}