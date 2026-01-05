import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ExternalLink, Share2, Clock, MoreHorizontal, XCircle, Trash2, Flag, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import DetailViewLayout from '@/layouts/DetailViewLayout';
import { formatDistanceToNow, format } from 'date-fns';
import { AddToCalendarButton } from '@/components/convene/AddToCalendarButton';
import { EventSpacesSection } from '@/components/collaboration/EventSpacesSection';
import { EventActivityFeed } from '@/components/events/EventActivityFeed';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'misleading_information', label: 'Misleading Information' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
] as const;

const EventDetail = () => {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [resolvedEventId, setResolvedEventId] = useState<string | null>(null);
  
  // Use resolved event ID for composer (once we know it)
  const id = resolvedEventId || slugOrId;
  const composer = useUniversalComposer({ eventId: id });

  // Cancel/Delete dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Report modal states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState('');

  // Check if param is UUID or slug
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // Fetch event details - support both UUID and slug lookups
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event-detail', slugOrId],
    queryFn: async () => {
      let event = null;
      
      // Try by UUID first if it looks like one
      if (slugOrId && isUUID(slugOrId)) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', slugOrId)
          .maybeSingle();
        if (!error) event = data;
      }
      
      // If not found or not UUID, try by slug
      if (!event && slugOrId) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slugOrId)
          .maybeSingle();
        if (!error) event = data;
      }

      if (!event) return null;
      
      // Store the actual event ID for use elsewhere
      setResolvedEventId(event.id);
      
      // Redirect UUID URLs to slug URLs for SEO
      if (slugOrId && isUUID(slugOrId) && event.slug) {
        navigate(`/dna/convene/events/${event.slug}`, { replace: true });
      }
      
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

  // Fetch total registration count (for delete eligibility)
  const { data: registrationCount = 0 } = useQuery({
    queryKey: ['event-registration-count', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_attendees')
        .select('id', { count: 'exact' })
        .eq('event_id', id)
        .in('status', ['going', 'maybe', 'pending', 'waitlist']);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  // Cancel event mutation
  const cancelEventMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Not authenticated');

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
      queryClient.invalidateQueries({ queryKey: ['event-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Cancelled',
        description: 'Your event has been cancelled. Attendees will be notified.',
      });
      setShowCancelDialog(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel event',
        variant: 'destructive',
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('organizer_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Deleted',
        description: 'Your event has been permanently deleted.',
      });
      navigate('/dna/convene/events');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    },
  });

  // Report event mutation
  const reportEventMutation = useMutation({
    mutationFn: async ({ reason, details }: { reason: string; details: string }) => {
      if (!user || !id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('event_reports')
        .insert({
          event_id: id,
          reported_by: user.id,
          reason,
          description: details || null,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep DNA safe.',
      });
      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
    },
  });

  const handleReportSubmit = () => {
    if (!reportReason) {
      toast({
        title: 'Error',
        description: 'Please select a reason for your report',
        variant: 'destructive',
      });
      return;
    }
    reportEventMutation.mutate({ reason: reportReason, details: reportDetails });
  };

  const canDeleteEvent = registrationCount === 0;

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
      <DetailViewLayout
        title="Loading..."
        backPath="/dna/convene/events"
        backLabel="Back to Events"
      >
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading event...</p>
        </div>
      </DetailViewLayout>
    );
  }

  if (!event) {
    return (
      <DetailViewLayout
        title="Event Not Found"
        backPath="/dna/convene/events"
        backLabel="Back to Events"
      >
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
      </DetailViewLayout>
    );
  }

  const isOrganizer = user?.id === event.organizer_id;
  const isPastEvent = new Date(event.end_time) < new Date();
  const currentRsvp = userRsvp?.status;

  return (
    <DetailViewLayout
      title={event.title}
      backPath="/dna/convene/events"
      backLabel="Back to Events"
      breadcrumbs={[
        { label: 'Home', path: '/dna/feed' },
        { label: 'Convene', path: '/dna/convene/events' },
        { label: event.title }
      ]}
    >
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className="capitalize">
                  {event.event_type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {event.format.replace('_', ' ')}
                </Badge>
                {isPastEvent && <Badge variant="secondary">Past Event</Badge>}
                {event.is_cancelled && (
                  <Badge variant="destructive">Cancelled</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">{event.title}</h1>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <AddToCalendarButton
                event={event}
                organizer={event.organizer}
                variant="outline"
              />
              <Button variant="outline" size="icon" onClick={handleShareEvent}>
                <Share2 className="h-4 w-4" />
              </Button>
              {isOrganizer ? (
                <>
                  <Button onClick={() => navigate(`/dna/convene/events/${id}/edit`)}>
                    Edit Event
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/dna/convene/events/${id}/check-in`)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Check-in Attendees
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!event.is_cancelled && (
                        <DropdownMenuItem
                          onClick={() => setShowCancelDialog(true)}
                          className="text-amber-600 focus:text-amber-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Event
                        </DropdownMenuItem>
                      )}
                      {canDeleteEvent ? (
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative flex cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cannot delete events with registrations. Cancel instead.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowReportDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

            {/* Tabs for Description and Activity */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <EventActivityFeed
                  eventId={event.id}
                  eventTitle={event.title}
                  canPost={!!userRsvp}
                />
              </TabsContent>
            </Tabs>

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

              {/* Event Spaces Section */}
              <EventSpacesSection 
                eventId={id!}
                isOrganizer={isOrganizer}
              />

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

      {/* Universal Composer for event context */}
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
      />

      {/* Cancel Event Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this event? Attendees will be notified.
              The event will remain visible but marked as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelEventMutation.mutate()}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={cancelEventMutation.isPending}
            >
              {cancelEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Event'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Event Modal */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Event</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-details">Additional Details (Optional)</Label>
              <Textarea
                id="report-details"
                placeholder="Provide any additional context..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={reportEventMutation.isPending || !reportReason}
            >
              {reportEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DetailViewLayout>
  );
};
export default EventDetail;
