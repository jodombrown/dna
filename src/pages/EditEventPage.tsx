import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventWithOrganizer, EventType, EventFormat } from '@/types/events';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Map RPC response to EventWithOrganizer type
      const eventData = data?.[0];
      if (!eventData) return undefined;
      
      return {
        id: eventData.event_id,
        organizer_id: eventData.organizer_id,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        format: eventData.format,
        location_name: eventData.location_name,
        location_address: eventData.location_address,
        location_city: eventData.location_city,
        location_country: eventData.location_country,
        location_lat: eventData.location_lat,
        location_lng: eventData.location_lng,
        meeting_url: eventData.meeting_url,
        meeting_platform: eventData.meeting_platform,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        timezone: eventData.timezone,
        max_attendees: eventData.max_attendees,
        cover_image_url: eventData.cover_image_url,
        is_public: eventData.is_public,
        requires_approval: eventData.requires_approval,
        allow_guests: eventData.allow_guests,
        is_cancelled: eventData.is_cancelled,
        cancellation_reason: eventData.cancellation_reason,
        created_at: eventData.created_at,
        updated_at: eventData.updated_at,
        organizer_username: eventData.organizer_username,
        organizer_full_name: eventData.organizer_full_name,
        organizer_avatar_url: eventData.organizer_avatar_url,
        organizer_headline: eventData.organizer_headline,
        attendee_count: Number(eventData.attendee_count),
        going_count: Number(eventData.going_count),
        maybe_count: Number(eventData.maybe_count),
        user_rsvp_status: eventData.user_rsvp_status,
        is_organizer: eventData.is_organizer,
        can_edit: eventData.can_edit,
      } as EventWithOrganizer;
    },
    enabled: !!id && !!user,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meetup' as EventType,
    format: 'in_person' as EventFormat,
    location_name: '',
    location_address: '',
    location_city: '',
    location_country: '',
    meeting_url: '',
    meeting_platform: '',
    start_time: '',
    end_time: '',
    timezone: '',
    max_attendees: undefined as number | undefined,
    cover_image_url: '',
    is_public: true,
    requires_approval: false,
    allow_guests: false,
  });

  // Populate form when event loads
  useEffect(() => {
    if (event) {
      // Check if user is organizer
      if (event.organizer_id !== user?.id) {
        toast({
          title: 'Access Denied',
          description: 'Only the organizer can edit this event',
          variant: 'destructive',
        });
        navigate(`/dna/convene/events/${id}`);
        return;
      }

      // Format datetime for input fields
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
      };

      setFormData({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        format: event.format,
        location_name: event.location_name || '',
        location_address: event.location_address || '',
        location_city: event.location_city || '',
        location_country: event.location_country || '',
        meeting_url: event.meeting_url || '',
        meeting_platform: event.meeting_platform || '',
        start_time: formatDateTimeLocal(event.start_time),
        end_time: formatDateTimeLocal(event.end_time),
        timezone: event.timezone,
        max_attendees: event.max_attendees || undefined,
        cover_image_url: event.cover_image_url || '',
        is_public: event.is_public,
        requires_approval: event.requires_approval,
        allow_guests: event.allow_guests,
      });
    }
  }, [event, user, id, navigate, toast]);

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Not authenticated');

      // Validation
      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Title and description are required');
      }

      if (!formData.start_time || !formData.end_time) {
        throw new Error('Start and end times are required');
      }

      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        throw new Error('End time must be after start time');
      }

      // Format validation
      if (formData.format === 'virtual' && !formData.meeting_url) {
        throw new Error('Virtual events require a meeting URL');
      }

      if (formData.format === 'in_person' && !formData.location_name) {
        throw new Error('In-person events require a location');
      }

      if (formData.format === 'hybrid' && (!formData.meeting_url || !formData.location_name)) {
        throw new Error('Hybrid events require both location and meeting URL');
      }

      // Convert datetime-local to ISO timestamps
      const start_time = new Date(formData.start_time).toISOString();
      const end_time = new Date(formData.end_time).toISOString();

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type,
          format: formData.format,
          location_name: formData.location_name || null,
          location_address: formData.location_address || null,
          location_city: formData.location_city || null,
          location_country: formData.location_country || null,
          meeting_url: formData.meeting_url || null,
          meeting_platform: formData.meeting_platform || null,
          start_time,
          end_time,
          timezone: formData.timezone,
          max_attendees: formData.max_attendees || null,
          cover_image_url: formData.cover_image_url || null,
          is_public: formData.is_public,
          requires_approval: formData.requires_approval,
          allow_guests: formData.allow_guests,
        })
        .eq('id', id)
        .eq('organizer_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-details', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event updated!',
        description: 'Your changes have been saved',
      });
      navigate(`/dna/convene/events/${id}`);
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    updateEventMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-muted-foreground">
            Loading event...
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Event not found</h2>
            <Button onClick={() => navigate('/dna/convene/events')}>
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dna/convene/events/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground mt-1">
              Update your event details
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || updateEventMutation.isPending}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* BASICS TAB */}
            <TabsContent value="basics" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/5000
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type *</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value as EventType })}
                  >
                    <SelectTrigger id="event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="meetup">Meetup</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value as EventFormat })}
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-image">Cover Image URL (Optional)</Label>
                <Input
                  id="cover-image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                />
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Date & Time *</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Date & Time *</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              {(formData.format === 'in_person' || formData.format === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location-name">Location Name *</Label>
                    <Input
                      id="location-name"
                      placeholder="e.g., WeWork Lagos"
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location-address">Address</Label>
                    <Input
                      id="location-address"
                      placeholder="Street address"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Lagos"
                        value={formData.location_city}
                        onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="e.g., Nigeria"
                        value={formData.location_country}
                        onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {(formData.format === 'virtual' || formData.format === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-url">Meeting URL *</Label>
                    <Input
                      id="meeting-url"
                      type="url"
                      placeholder="e.g., https://zoom.us/j/123456789"
                      value={formData.meeting_url}
                      onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-platform">Platform (Optional)</Label>
                    <Input
                      id="meeting-platform"
                      placeholder="e.g., Zoom, Google Meet, Teams"
                      value={formData.meeting_platform}
                      onChange={(e) => setFormData({ ...formData, meeting_platform: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="max-attendees">Max Attendees (Optional)</Label>
                <Input
                  id="max-attendees"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={formData.max_attendees || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_attendees: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is-public">Public Event</Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can discover and view this event
                  </p>
                </div>
                <Switch
                  id="is-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requires-approval">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    You'll approve each attendee before they can join
                  </p>
                </div>
                <Switch
                  id="requires-approval"
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-guests">Allow Guests</Label>
                  <p className="text-sm text-muted-foreground">
                    Attendees can bring guests
                  </p>
                </div>
                <Switch
                  id="allow-guests"
                  checked={formData.allow_guests}
                  onCheckedChange={(checked) => setFormData({ ...formData, allow_guests: checked })}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/dna/convene/events/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || updateEventMutation.isPending}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
