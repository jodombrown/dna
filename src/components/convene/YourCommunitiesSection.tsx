import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Community {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  member_count: number | null;
  image_url: string | null;
}

interface CommunityEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean | null;
  community_id: string;
}

export function YourCommunitiesSection() {
  const navigate = useNavigate();

  const { data: userCommunities, isLoading } = useQuery({
    queryKey: ['user-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's communities
      const { data: memberships, error: membershipsError } = await supabase
        .from('community_memberships')
        .select('community_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) return [];

      const communityIds = memberships.map(m => m.community_id);

      // Get community details
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, name, description, category, member_count, image_url')
        .in('id', communityIds)
        .eq('is_active', true);

      if (communitiesError) throw communitiesError;

      // Get upcoming events for these communities
      const { data: events, error: eventsError } = await supabase
        .from('community_events')
        .select('id, title, event_date, end_date, location, is_virtual, community_id')
        .in('community_id', communityIds)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(20);

      if (eventsError) throw eventsError;

      // Map events to communities
      return (communities || []).map(community => ({
        ...community,
        upcomingEvents: (events || []).filter(e => e.community_id === community.id).slice(0, 2),
        isAdmin: memberships.find(m => m.community_id === community.id)?.role === 'admin'
      }));
    }
  });

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Communities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!userCommunities || userCommunities.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Communities</h2>
        <Card className="p-8 text-center border-dashed">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Join a community</h3>
          <p className="text-muted-foreground mb-4">
            Join a community so you never miss what your people are doing.
          </p>
          <Button onClick={() => navigate('/dna/convene/groups')}>
            Browse Communities
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Communities</h2>
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/convene/groups')}
          className="gap-2"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {userCommunities.map((community: any) => (
          <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              {community.image_url ? (
                <img
                  src={community.image_url}
                  alt={community.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-dna-emerald/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{community.name}</h3>
                {community.category && (
                  <Badge variant="secondary" className="mb-2">
                    {community.category}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{community.member_count || 0} members</span>
                </div>
              </div>
            </div>

            {community.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {community.description}
              </p>
            )}

            {/* Upcoming events for this community */}
            {community.upcomingEvents && community.upcomingEvents.length > 0 ? (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming Events</span>
                </div>
                {community.upcomingEvents.map((event: CommunityEvent) => (
                  <div
                    key={event.id}
                    className="pl-6 py-2 border-l-2 border-dna-emerald/30 hover:border-dna-emerald transition-colors cursor-pointer"
                    onClick={() => navigate(`/dna/convene/events/${(event as any).slug || event.id}`)}
                  >
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}
                      {event.is_virtual ? ' • Virtual' : event.location ? ` • ${event.location}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              community.isAdmin && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    No upcoming events yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/dna/convene/events/new?community_id=${community.id}`)}
                  >
                    Host an event for this community
                  </Button>
                </div>
              )
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(`/dna/convene/groups/${community.id}`)}
            >
              View Community
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
