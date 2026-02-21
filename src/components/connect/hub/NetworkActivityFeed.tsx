import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Calendar,
  FileText,
  Handshake,
  Lightbulb,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'story' | 'event' | 'project' | 'opportunity';
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  action: string;
  target: {
    id: string;
    title: string;
    href: string;
  };
  timestamp: string;
}

const ACTIVITY_ICONS = {
  story: FileText,
  event: Calendar,
  project: Handshake,
  opportunity: Lightbulb,
};

const ACTIVITY_COLORS = {
  story: 'bg-dna-purple/10 text-dna-purple',
  event: 'bg-dna-sunset/10 text-dna-sunset',
  project: 'bg-dna-mint/10 text-dna-forest',
  opportunity: 'bg-dna-ochre/10 text-dna-ochre',
};

/**
 * NetworkActivityFeed - Shows what your connections are doing across all Five C's
 */
export function NetworkActivityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['network-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const activities: ActivityItem[] = [];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get user's connections using correct column names
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (!connections || connections.length === 0) return [];

      const connectionIds = connections.map((c) =>
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      );

      // Fetch connection profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', connectionIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // 1. Stories/posts published by connections
      const { data: stories } = await supabase
        .from('posts')
        .select('id, title, author_id, created_at')
        .in('author_id', connectionIds)
        .eq('post_type', 'story')
        .eq('is_deleted', false)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (stories) {
        stories.forEach((story) => {
          const profile = profileMap.get(story.author_id);
          if (profile) {
            activities.push({
              id: `story-${story.id}`,
              type: 'story',
              user: {
                id: story.author_id,
                name: profile.full_name || 'Member',
                avatar_url: profile.avatar_url,
              },
              action: 'published a story',
              target: {
                id: story.id,
                title: story.title || 'Untitled',
                href: `/dna/convey/stories/${story.id}`,
              },
              timestamp: story.created_at,
            });
          }
        });
      }

      // 2. Event registrations by connections
      const { data: eventRegs } = await supabase
        .from('event_attendees')
        .select('id, user_id, event_id, created_at, events(id, slug, title)')
        .in('user_id', connectionIds)
        .eq('status', 'going')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (eventRegs) {
        eventRegs.forEach((reg) => {
          const profile = profileMap.get(reg.user_id);
          const event = reg.events;
          if (profile && event) {
            activities.push({
              id: `event-${reg.id}`,
              type: 'event',
              user: {
                id: reg.user_id,
                name: profile.full_name || 'Member',
                avatar_url: profile.avatar_url,
              },
              action: 'registered for',
              target: {
                id: event.id,
                title: event.title,
                href: `/dna/convene/events/${event.slug || event.id}`,
              },
              timestamp: reg.created_at,
            });
          }
        });
      }

      // 3. Space memberships (projects) by connections
      const { data: spaceMemberships } = await supabase
        .from('space_members')
        .select('space_id, user_id, joined_at, spaces(id, name)')
        .in('user_id', connectionIds)
        .gte('joined_at', oneWeekAgo.toISOString())
        .order('joined_at', { ascending: false })
        .limit(3);

      if (spaceMemberships) {
        spaceMemberships.forEach((membership) => {
          const profile = profileMap.get(membership.user_id);
          const space = membership.spaces;
          if (profile && space) {
            activities.push({
              id: `project-${membership.space_id}-${membership.user_id}`,
              type: 'project',
              user: {
                id: membership.user_id,
                name: profile.full_name || 'Member',
                avatar_url: profile.avatar_url,
              },
              action: 'joined',
              target: {
                id: space.id,
                title: space.name,
                href: `/dna/collaborate/spaces/${space.id}`,
              },
              timestamp: membership.joined_at,
            });
          }
        });
      }

      // 4. Contribution needs posted by connections
      const { data: contributions } = await supabase
        .from('contribution_needs')
        .select('id, title, created_by, type, created_at')
        .in('created_by', connectionIds)
        .eq('status', 'open')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (contributions) {
        contributions.forEach((opp) => {
          const profile = profileMap.get(opp.created_by);
          if (profile) {
            activities.push({
              id: `opp-${opp.id}`,
              type: 'opportunity',
              user: {
                id: opp.created_by,
                name: profile.full_name || 'Member',
                avatar_url: profile.avatar_url,
              },
              action: `posted a ${opp.type}`,
              target: {
                id: opp.id,
                title: opp.title,
                href: `/dna/contribute/needs/${opp.id}`,
              },
              timestamp: opp.created_at,
            });
          }
        });
      }

      // Sort all activities by timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    navigate(activity.target.href);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Network Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Network Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity from your connections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Network Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.slice(0, 5).map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const colorClass = ACTIVITY_COLORS[activity.type];

            return (
              <button
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Activity text */}
                    <p className="text-sm leading-tight">
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-muted-foreground"> {activity.action} </span>
                      <span className="font-medium">{activity.target.title}</span>
                    </p>

                    {/* Timestamp and badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'h-4 px-1 text-[9px] uppercase tracking-wide',
                          colorClass
                        )}
                      >
                        <Icon className="h-2.5 w-2.5 mr-0.5" />
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {activities.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => navigate('/dna/feed')}
          >
            View all activity
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default NetworkActivityFeed;