import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventCard } from '@/components/events/EventCard';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { EventListItem, EventType, EventFormat } from '@/types/events';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Profile } from '@/services/profilesService';

type EventFilter = 'upcoming' | 'past' | 'my_events' | 'attending';

interface DashboardEventsColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardEventsColumn({ profile, isOwnProfile }: DashboardEventsColumnProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EventFilter>('upcoming');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<EventFormat | 'all'>('all');

  const { data: events, refetch, isLoading } = useQuery({
    queryKey: ['events', user?.id, activeTab, typeFilter, formatFilter],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_events', {
        p_user_id: user.id,
        p_filter: activeTab,
        p_event_type: typeFilter === 'all' ? null : typeFilter,
        p_format: formatFilter === 'all' ? null : formatFilter,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      return (data || []) as EventListItem[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('events_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, refetch]);

  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and organize diaspora gatherings
          </p>
        </div>
        {isOwnProfile && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as EventFilter)}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="my_events">My Events</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EventType | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as EventFormat | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading events...
        </div>
      ) : filteredEvents && filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold mb-1">
            {searchQuery ? 'No events found' : 'No events yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try a different search term'
              : activeTab === 'my_events'
              ? "You haven't created any events yet"
              : 'Be the first to organize an event!'}
          </p>
          {!searchQuery && isOwnProfile && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <CreateEventDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          currentUserId={user?.id || ''}
          onSuccess={(eventId) => {
            refetch();
            navigate(`/dna/convene/events/${eventId}`);
          }}
        />
      )}
    </div>
  );
}
