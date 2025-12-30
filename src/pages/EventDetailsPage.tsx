import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventWithOrganizer, EventAttendee, RsvpStatus } from '@/types/events';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Globe,
  Share2,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event-details', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;

      const { data, error } = await supabase.rpc('get_event_details', {
        p_event_id: id,
        p_user_id: user.id,
      });

      if (error) throw error;
      const eventData = data?.[0];
      if (!eventData) return undefined;
      
      // Map event_id to id for EventWithOrganizer interface
      return {
        ...eventData,
        id: eventData.event_id,
      } as EventWithOrganizer;
    },
    enabled: !!id && !!user,
  });

  // Fetch attendees
  const { data: attendees } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase.rpc('get_event_attendees', {
        p_event_id: id,
        p_status: null,
      });

      if (error) throw error;
      return (data || []) as EventAttendee[];
    },
    enabled: !!id,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: RsvpStatus) => {
      if (!id || !user) throw new Error('Not authenticated');

      // Check if already RSVP'd
      const { data: existing } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing RSVP
        const { error } = await supabase
          .from('event_attendees')
          .update({ status })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: id,
            user_id: user.id,
            status,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-details', id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'RSVP updated',
        description: 'Your response has been recorded',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update RSVP',
        variant: 'destructive',
      });
    },
  });

  // Cancel event mutation
  const cancelEventMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('events')
        .update({
          is_cancelled: true,
          cancellation_reason: 'Cancelled by organizer',
        })
        .eq('id', id)
        .eq('organizer_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Event cancelled',
        description: 'All attendees will be notified',
      });
      navigate('/dna/convene/events');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to cancel event',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <>
        <UnifiedHeader />
        <main className="flex-1 pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12 text-muted-foreground">
              Loading event...
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <UnifiedHeader />
        <main className="flex-1 pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Event not found</h2>
              <p className="text-muted-foreground mb-6">
                This event doesn't exist or you don't have permission to view it
              </p>
              <Button onClick={() => navigate('/dna/convene/events')}>
                Back to Events
              </Button>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatEventDate = () => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');

    if (isSameDay) {
      return format(start, 'EEEE, MMMM dd, yyyy');
    }
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  const formatEventTime = () => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const getFormatIcon = () => {
    switch (event.format) {
      case 'virtual':
        return <Video className="h-5 w-5" />;
      case 'in_person':
        return <MapPin className="h-5 w-5" />;
      case 'hybrid':
        return <Globe className="h-5 w-5" />;
    }
  };

  const getLocation = () => {
    if (event.format === 'virtual') {
      return 'Virtual Event';
    }
    const parts = [
      event.location_name,
      event.location_city,
      event.location_country,
    ].filter(Boolean);
    return parts.join(', ') || 'Location TBA';
  };

  const goingAttendees = attendees?.filter((a) => a.status === 'going') || [];
  const maybeAttendees = attendees?.filter((a) => a.status === 'maybe') || [];

  const isFull = event.max_attendees && event.going_count >= event.max_attendees;
  const isPastEvent = new Date(event.end_time) < new Date();

  return (
    <>
      <UnifiedHeader />
      <main className="flex-1 pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cover Image */}
          {event.cover_image_url ? (
            <div className="h-80 rounded-xl overflow-hidden mb-8">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-80 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-8">
              <Calendar className="h-24 w-24 text-primary-foreground opacity-50" />
            </div>
          )}

          {/* Cancelled Banner */}
          {event.is_cancelled && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">This event has been cancelled</p>
                  {event.cancellation_reason && (
                    <p className="text-sm text-muted-foreground mt-1">{event.cancellation_reason}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {event.event_type}
                  </Badge>
                  <Badge variant="outline">
                    {getFormatIcon()}
                    <span className="ml-1 capitalize">{event.format}</span>
                  </Badge>
                  {!event.is_public && (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

                {/* Organizer */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => navigate(`/dna/${event.organizer_username}`)}
                  >
                    <AvatarImage src={event.organizer_avatar_url} alt={event.organizer_full_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(event.organizer_full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Organized by</p>
                    <p
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/dna/${event.organizer_username}`)}
                    >
                      {event.organizer_full_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {event.description}
                </p>
              </Card>

              {/* Attendees Tab */}
              <Card className="p-6">
                <Tabs defaultValue="going">
                  <TabsList className="mb-4">
                    <TabsTrigger value="going">
                      Going ({goingAttendees.length})
                    </TabsTrigger>
                    <TabsTrigger value="maybe">
                      Maybe ({maybeAttendees.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="going" className="space-y-4">
                    {goingAttendees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {goingAttendees.map((attendee) => (
                          <div
                            key={attendee.attendee_id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/dna/${attendee.username}`)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={attendee.avatar_url} alt={attendee.full_name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(attendee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{attendee.full_name}</p>
                              {attendee.headline && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {attendee.headline}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No confirmed attendees yet
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="maybe" className="space-y-4">
                    {maybeAttendees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {maybeAttendees.map((attendee) => (
                          <div
                            key={attendee.attendee_id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/dna/${attendee.username}`)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={attendee.avatar_url} alt={attendee.full_name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(attendee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{attendee.full_name}</p>
                              {attendee.headline && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {attendee.headline}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No maybe responses yet
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{formatEventDate()}</p>
                    <p className="text-sm text-muted-foreground">{formatEventTime()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.timezone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {getFormatIcon()}
                  <div className="flex-1">
                    <p className="font-semibold">{getLocation()}</p>
                    {event.location_address && (
                      <p className="text-sm text-muted-foreground">{event.location_address}</p>
                    )}
                    {event.meeting_url && (
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Join Meeting
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {event.going_count + event.maybe_count} attendees
                    </p>
                    {event.max_attendees && (
                      <p className="text-sm text-muted-foreground">
                        Capacity: {event.going_count} / {event.max_attendees}
                      </p>
                    )}
                  </div>
                </div>

                {isFull && !event.is_organizer && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      This event is at full capacity
                    </p>
                  </div>
                )}
              </Card>

              {/* RSVP Actions */}
              {!isPastEvent && !event.is_cancelled && !event.is_organizer && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">RSVP</h3>
                  <div className="space-y-2">
                    <Button
                      className={cn(
                        'w-full',
                        event.user_rsvp_status === 'going'
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          : ''
                      )}
                      variant={event.user_rsvp_status === 'going' ? 'default' : 'outline'}
                      onClick={() => rsvpMutation.mutate('going')}
                      disabled={rsvpMutation.isPending || (isFull && event.user_rsvp_status !== 'going')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {event.user_rsvp_status === 'going' ? "You're Going" : 'Going'}
                    </Button>

                    <Button
                      variant="outline"
                      className={cn(
                        'w-full',
                        event.user_rsvp_status === 'maybe' && 'border-primary text-primary'
                      )}
                      onClick={() => rsvpMutation.mutate('maybe')}
                      disabled={rsvpMutation.isPending}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {event.user_rsvp_status === 'maybe' ? "You're Interested" : 'Maybe'}
                    </Button>

                    {event.user_rsvp_status && event.user_rsvp_status !== 'not_going' && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => rsvpMutation.mutate('not_going')}
                        disabled={rsvpMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Can't Go
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Organizer Actions */}
              {event.is_organizer && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Manage Event</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/dna/convene/events/${id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Event
                    </Button>

                    {!event.is_cancelled && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Event
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the event and notify all attendees. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelEventMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
