import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { eventStartMs } from '@/lib/events/eventTime';
import { Event } from '@/types/events';
import { GroupEventCard } from '@/components/convene/GroupEventCard';

export default function GroupEventsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch group details
  const { data: group } = useQuery({
    queryKey: ['group-details', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch group events  
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['group-events', group?.id],
    queryFn: async (): Promise<any[]> => {
      if (!group?.id) return [];
      
      const client: any = supabase;
      const response = await client.from('events').select('*').eq('group_id', group.id).order('start_time');
      if (response.error) throw response.error;
      return response.data || [];
    },
    enabled: !!group?.id,
  });
  
  const events = (eventsData || []) as Event[];

  // Check if user is admin/moderator
  const { data: membership } = useQuery({
    queryKey: ['group-membership', group?.id, user?.id],
    queryFn: async () => {
      if (!group || !user) return null;

      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!group && !!user,
  });

  const canHostEvent = membership?.role && ['owner', 'admin', 'moderator'].includes(membership.role);
  const now = new Date();
  // An undated event has no place on a timeline — it gets its own lane.
  const undatedEvents = events.filter(e => eventStartMs(e) === null && !e.is_cancelled);
  const upcomingEvents = events.filter(e => {
    const start = eventStartMs(e);
    return start !== null && start > now.getTime() && !e.is_cancelled;
  });
  const pastEvents = events.filter(e => {
    const start = eventStartMs(e);
    return (start !== null && start <= now.getTime()) || e.is_cancelled;
  });

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/dna/convene/groups/${slug}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Group
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 font-serif">{group?.name} Events</h1>
                <p className="text-muted-foreground mt-1">
                  Events hosted by this group
                </p>
              </div>
              {canHostEvent && (
                <Button
                  onClick={() => navigate('/dna/convene/events/new', { state: { groupId: group?.id } })}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Host Event
                </Button>
              )}
            </div>
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
              {undatedEvents.length > 0 && (
                <TabsTrigger value="undated">Dates TBA ({undatedEvents.length})</TabsTrigger>
              )}
              <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading events...
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <GroupEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No upcoming events</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {canHostEvent ? 'Be the first to host an event for this group' : 'Check back later for new events'}
                  </p>
                  {canHostEvent && (
                    <Button
                      onClick={() => navigate('/dna/convene/events/new', { state: { groupId: group?.id } })}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Host Event
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {undatedEvents.length > 0 && (
              <TabsContent value="undated" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {undatedEvents.map((event) => (
                    <GroupEventCard key={event.id} event={event} />
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="past" className="space-y-4">
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <GroupEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No past events</h3>
                  <p className="text-sm text-muted-foreground">
                    This group hasn't hosted any events yet
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      }
      rightColumn={<RightWidgets variant="convene" />}
    />
  );
}
