import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PostListSkeleton } from '@/components/ui/loading-skeleton';
import { Calendar, Clock, MapPin, Users, Search, Filter, Plus, CalendarDays, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';

interface Event {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  type?: string;
  max_attendees?: number;
  attendee_count: number;
  created_by: string;
  image_url?: string;
  profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  user_has_registered?: boolean;
  is_waitlisted?: boolean;
}

const EventCard: React.FC<{ event: Event; onRSVPChange?: () => void }> = ({ event, onRSVPChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRSVP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please log in to RSVP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (event.user_has_registered) {
        const { error } = await supabase.rpc('rpc_event_unregister', { p_event: event.id });
        if (error) throw error;
        toast({ title: "Registration cancelled" });
      } else {
        const { error } = await supabase.rpc('rpc_event_register', { p_event: event.id });
        if (error) {
          if (error.message.includes('capacity_reached')) {
            toast({ title: "Event is full", description: "You've been added to the waitlist", variant: "destructive" });
          } else {
            throw error;
          }
        } else {
          toast({ title: "Successfully registered!" });
        }
      }
      onRSVPChange?.();
    } catch (error) {
      console.error('RSVP error:', error);
      toast({ title: "Failed to update registration", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
          
          {event.type && (
            <Badge variant="secondary" className="ml-2">
              {event.type}
            </Badge>
          )}
        </div>

        {event.profiles && (
          <div className="flex items-center mt-3">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={event.profiles.avatar_url} />
              <AvatarFallback className="text-xs">
                {event.profiles.full_name?.[0] || event.profiles.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              by {event.profiles.full_name || event.profiles.username}
            </span>
          </div>
        )}
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

          <div className="flex gap-2">
            {isOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/events/${event.id}/manage`);
                }}
              >
                Manage
              </Button>
            )}
            
            {!isOwner && (
              <Button
                size="sm"
                variant={event.user_has_registered ? "outline" : "default"}
                onClick={handleRSVP}
                disabled={isLoading}
              >
                {isLoading ? "..." : event.user_has_registered ? "Cancel" : isFull ? "Waitlist" : "RSVP"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'discover' | 'my-events' | 'my-rsvps'>('discover');

  const loadEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles:created_by (
            id,
            full_name,
            username,
            avatar_url
          )
        `);

      // Apply filters based on active tab
      if (activeTab === 'my-events') {
        query = query.eq('created_by', user?.id);
      } else if (activeTab === 'my-rsvps') {
        // Get events user has RSVP'd to
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user?.id);
        
        if (registrations?.length) {
          const eventIds = registrations.map(r => r.event_id);
          query = query.in('id', eventIds);
        } else {
          setEvents([]);
          setLoading(false);
          return;
        }
      }

      // Apply time filters
      const now = new Date().toISOString();
      if (filter === 'upcoming') {
        query = query.gte('date_time', now);
      } else if (filter === 'past') {
        query = query.lt('date_time', now);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      query = query.order('date_time', { ascending: filter !== 'past' });

      const { data, error } = await query;
      if (error) throw error;

      // For non-owner views, also fetch registration status
      let eventsWithStatus = data || [];
      if (user && activeTab !== 'my-events') {
        const eventIds = data?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          const { data: registrations } = await supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', user.id)
            .in('event_id', eventIds);

          const registeredEventIds = new Set(registrations?.map(r => r.event_id) || []);
          
          eventsWithStatus = (data || []).map(event => ({
            ...event,
            user_has_registered: registeredEventIds.has(event.id)
          }));
        }
      }

      setEvents(eventsWithStatus);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({ title: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeTab, filter, typeFilter, searchTerm, user]);

  useEffect(() => {
    document.title = 'Events | DNA';
  }, []);

  const getEmptyMessage = () => {
    if (activeTab === 'my-events') return "You haven't created any events yet.";
    if (activeTab === 'my-rsvps') return "You haven't RSVP'd to any events yet.";
    return "No events found. Try adjusting your filters.";
  };

  const getEmptyAction = () => {
    if (activeTab === 'my-events') {
      return {
        label: "Create your first event",
        onClick: () => navigate('/events/new')
      };
    }
    if (activeTab === 'discover') {
      return {
        label: "Create event",
        onClick: () => navigate('/events/new')
      };
    }
    return undefined;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <RequireProfileScore min={50} featureName="Create Event" showToast showModal={false}>
          <Button onClick={() => navigate('/events/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </RequireProfileScore>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="my-events" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            My Events
          </TabsTrigger>
          <TabsTrigger value="my-rsvps" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My RSVPs
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <PostListSkeleton count={6} />
          ) : events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRSVPChange={loadEvents}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description={getEmptyMessage()}
              action={getEmptyAction()}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}