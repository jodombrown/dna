import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ExternalLink, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { formatDistanceToNow, format } from 'date-fns';
import { AddToCalendarButton } from '@/components/convene/AddToCalendarButton';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);

  // Fetch event details
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event-detail', id],
    queryFn: async () => {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!event) return null;
      
      const eventData: any = event;
      
      // Fetch organizer profile
      const { data: organizer } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, headline')
        .eq('id', eventData.organizer_id)
        .maybeSingle();
      
      // Fetch group info if event is group-hosted
      let group = null;
      if (eventData.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name, slug, description, avatar_url, member_count')
          .eq('id', eventData.group_id)
          .maybeSingle();
        group = groupData;
      }
      
      return {
        ...eventData,
        organizer,
        group
      };
    },
    enabled: !!id,
  });

  const event = eventData;

  // Fetch user's RSVP status
  const { data: userRsvp } = useQuery({
    queryKey: ['user-rsvp', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from('event_attendees')
        .select('status')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  // Fetch attendees
  const { data: attendees = [] } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: async () => {
      const { data: attendeeData, error } = await supabase
        .from('event_attendees')
        .select('status, created_at, user_id')
        .eq('event_id', id)
        .eq('status', 'going')
        .limit(10);

      if (error) throw error;
      if (!attendeeData || attendeeData.length === 0) return [];
      
      // Fetch profiles for attendees
      const userIds = attendeeData.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return attendeeData.map(a => ({
        ...a,
        profile: profileMap.get(a.user_id)
      }));
    },
    enabled: !!id,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: 'going' | 'maybe' | 'not_going') => {
      if (!user || !id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: id,
          user_id: user.id,
          status,
        });

      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvp', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
      toast({
        title: 'RSVP Updated',
        description: `You've marked yourself as ${status === 'going' ? 'going' : status === 'maybe' ? 'maybe' : 'not going'}`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update RSVP',
        variant: 'destructive',
      });
    },
  });

  const handleRsvp = (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to RSVP to events',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    rsvpMutation.mutate(status);
  };

  const handleShareEvent = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Event link copied to clipboard',
    });
  };

  const handleDownloadCalendar = () => {
    // This function is kept for backward compatibility but is replaced by AddToCalendarButton
    toast({
      title: 'Use Add to Calendar',
      description: 'Click the "Add to Calendar" button to save this event',
    });
  };

  if (isLoading) {
    return (
      <FeedLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading event...</p>
        </div>
      </FeedLayout>
    );
  }

  if (!event) {
    return (
      <FeedLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Event not found</p>
              <Button 
                variant="link"
                onClick={() => navigate('/dna/convene/events')}
                className="mt-4"
              >
                Back to events
              </Button>
            </CardContent>
          </Card>
        </div>
      </FeedLayout>
    );
  }

  const isOrganizer = user?.id === event.organizer_id;
  const isPastEvent = new Date(event.end_time) < new Date();
  const currentRsvp = userRsvp?.status;

  return (
    <FeedLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        {event.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and Actions */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {event.event_type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {event.format.replace('_', ' ')}
                </Badge>
                {isPastEvent && <Badge variant="secondary">Past Event</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            </div>
            
            <div className="flex gap-2">
              <AddToCalendarButton 
                event={event}
                organizer={event.organizer}
                variant="outline"
              />
              <Button variant="outline" size="icon" onClick={handleShareEvent}>
                <Share2 className="h-4 w-4" />
              </Button>
              {isOrganizer && (
                <Button onClick={() => navigate(`/dna/convene/events/${id}/edit`)}>
                  Edit Event
                </Button>
              )}
            </div>
          </div>

          {/* Host Info - Group or Individual */}
          {event.group ? (
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 flex-1"
                onClick={() => navigate(`/dna/convene/groups/${event.group.slug}`)}
              >
                <Avatar>
                  <AvatarImage src={event.group.avatar_url || ''} />
                  <AvatarFallback>{event.group.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Hosted by {event.group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.group.member_count || 0} members
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dna/convene/groups/${event.group.slug}/events`)}
              >
                View All Group Events
              </Button>
            </div>
          ) : event.organizer && (
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80"
              onClick={() => navigate(`/dna/${event.organizer.username}`)}
            >
              <Avatar>
                <AvatarImage src={event.organizer.avatar_url || ''} />
                <AvatarFallback>{event.organizer.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Hosted by {event.organizer.full_name}</p>
                {event.organizer.headline && (
                  <p className="text-sm text-muted-foreground">{event.organizer.headline}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')} {event.timezone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    {event.format === 'virtual' ? (
                      <>
                        <p className="font-medium">Online Event</p>
                        {event.meeting_url && (
                          <a 
                            href={event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            Join meeting <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{event.location_name}</p>
                        {event.location_address && (
                          <p className="text-sm text-muted-foreground">{event.location_address}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {event.location_city}, {event.location_country}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Limited to {event.max_attendees} attendees
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {/* Attendees */}
            {attendees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendees ({attendees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {attendees.map((attendee: any) => attendee.profile && (
                      <div 
                        key={attendee.profile.id}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                        onClick={() => navigate(`/dna/${attendee.profile.username}`)}
                      >
                        <Avatar>
                          <AvatarImage src={attendee.profile.avatar_url || ''} />
                          <AvatarFallback>{attendee.profile.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{attendee.profile.full_name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {!isPastEvent && !isOrganizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>RSVP</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full"
                      variant={currentRsvp === 'going' ? 'default' : 'outline'}
                      onClick={() => handleRsvp('going')}
                      disabled={rsvpMutation.isPending}
                    >
                      Going
                    </Button>
                    <Button
                      className="w-full"
                      variant={currentRsvp === 'maybe' ? 'default' : 'outline'}
                      onClick={() => handleRsvp('maybe')}
                      disabled={rsvpMutation.isPending}
                    >
                      Maybe
                    </Button>
                    <Button
                      className="w-full"
                      variant={currentRsvp === 'not_going' ? 'default' : 'outline'}
                      onClick={() => handleRsvp('not_going')}
                      disabled={rsvpMutation.isPending}
                    >
                      Can't Go
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <AddToCalendarButton 
                    event={event}
                    organizer={event.organizer}
                    variant="outline"
                    size="default"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FeedLayout>
  );
};

export default EventDetail;
