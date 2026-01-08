import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EventFormFields, EventFormData } from '@/components/convene/EventFormFields';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Helper to check if a string is a UUID
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function EditEventPage() {
  const { id: slugOrId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedEventId, setResolvedEventId] = useState<string | null>(null);

  // Settings state (separate from the main form)
  const [settings, setSettings] = useState({
    is_public: true,
    requires_approval: false,
    allow_guests: false,
  });

  // First resolve slug to UUID if needed
  const { data: eventId, isLoading: isResolvingId } = useQuery({
    queryKey: ['resolve-event-id', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      
      // If it's already a UUID, use it directly
      if (isUUID(slugOrId)) {
        return slugOrId;
      }
      
      // Otherwise, look up by slug
      const { data, error } = await supabase
        .from('events')
        .select('id, slug')
        .eq('slug', slugOrId)
        .maybeSingle();
      
      if (error || !data) return null;
      return data.id;
    },
    enabled: !!slugOrId,
  });

  // Update resolved ID when we get it
  useEffect(() => {
    if (eventId) {
      setResolvedEventId(eventId);
    }
  }, [eventId]);

  // Fetch event details using the resolved UUID
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event-details', resolvedEventId, user?.id],
    queryFn: async () => {
      if (!resolvedEventId || !user) return null;

      const { data, error } = await supabase.rpc('get_event_details', {
        p_event_id: resolvedEventId,
        p_user_id: user.id,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!resolvedEventId && !!user,
  });

  // Form data matching EventFormFields interface
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    subtitle: '',
    description: '',
    format: 'in_person',
    eventDate: '',
    eventTime: '',
    eventEndDate: '',
    eventEndTime: '',
    location: '',
    meetingUrl: '',
    coverImageUrl: '',
    dressCode: '',
    maxAttendees: undefined,
    tags: [],
    agenda: [],
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
        navigate(`/dna/convene/events/${slugOrId}`);
        return;
      }

      // Parse start datetime
      const startDate = parseISO(event.start_time);
      const endDate = parseISO(event.end_time);

      // Build location string from components
      const locationParts = [
        event.location_name,
        event.location_city,
        event.location_country
      ].filter(Boolean);

      setFormData({
        title: event.title || '',
        subtitle: '',
        description: event.description || '',
        format: (event.format as 'in_person' | 'virtual' | 'hybrid') || 'in_person',
        eventDate: format(startDate, 'yyyy-MM-dd'),
        eventTime: format(startDate, 'HH:mm'),
        eventEndDate: format(endDate, 'yyyy-MM-dd'),
        eventEndTime: format(endDate, 'HH:mm'),
        location: locationParts.join(', '),
        meetingUrl: event.meeting_url || '',
        coverImageUrl: event.cover_image_url || '',
        maxAttendees: event.max_attendees || undefined,
        tags: [],
        agenda: [],
      });

      setSettings({
        is_public: event.is_public ?? true,
        requires_approval: event.requires_approval ?? false,
        allow_guests: event.allow_guests ?? false,
      });
    }
  }, [event, user, slugOrId, navigate, toast]);

  const handleFormChange = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedEventId || !user) throw new Error('Not authenticated');

      // Validation
      if (!formData.title.trim()) {
        throw new Error('Event title is required');
      }

      if (!formData.description.trim() || formData.description.length < 50) {
        throw new Error('Description must be at least 50 characters');
      }

      if (!formData.eventDate || !formData.eventTime) {
        throw new Error('Start date and time are required');
      }

      if (!formData.eventEndDate || !formData.eventEndTime) {
        throw new Error('End date and time are required');
      }

      // Build timestamps
      const start_time = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();
      const end_time = new Date(`${formData.eventEndDate}T${formData.eventEndTime}`).toISOString();

      if (new Date(end_time) <= new Date(start_time)) {
        throw new Error('End time must be after start time');
      }

      // Format validation
      if (formData.format === 'virtual' && !formData.meetingUrl) {
        throw new Error('Virtual events require a meeting URL');
      }

      if (formData.format === 'in_person' && !formData.location) {
        throw new Error('In-person events require a location');
      }

      if (formData.format === 'hybrid' && (!formData.meetingUrl || !formData.location)) {
        throw new Error('Hybrid events require both location and meeting URL');
      }

      // Parse location components
      const locationParts = formData.location?.split(',').map(s => s.trim()) || [];

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          format: formData.format,
          location_name: locationParts[0] || null,
          location_city: locationParts[1] || null,
          location_country: locationParts[2] || null,
          meeting_url: formData.meetingUrl || null,
          start_time,
          end_time,
          max_attendees: formData.maxAttendees || null,
          cover_image_url: formData.coverImageUrl || null,
          is_public: settings.is_public,
          requires_approval: settings.requires_approval,
          allow_guests: settings.allow_guests,
        })
        .eq('id', resolvedEventId)
        .eq('organizer_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-details', resolvedEventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event updated!',
        description: 'Your changes have been saved',
      });
      navigate(`/dna/convene/events/${slugOrId}`);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
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

  if (isResolvingId || isLoadingEvent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dna/convene/events/${slugOrId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-sm text-muted-foreground">
              Update your event details
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || updateEventMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Main Form - Same structure as composer */}
        <Card className="p-6">
          <EventFormFields
            formData={formData}
            onChange={handleFormChange}
          />

          {/* Settings Section - Separated with divider */}
          <div className="flex items-center gap-3 pt-6 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Settings</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-public" className="text-sm font-medium">Public Event</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone can discover and view this event
                </p>
              </div>
              <Switch
                id="is-public"
                checked={settings.is_public}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, is_public: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requires-approval" className="text-sm font-medium">Require Approval</Label>
                <p className="text-xs text-muted-foreground">
                  You'll approve each attendee before they can join
                </p>
              </div>
              <Switch
                id="requires-approval"
                checked={settings.requires_approval}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, requires_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-guests" className="text-sm font-medium">Allow Guests</Label>
                <p className="text-xs text-muted-foreground">
                  Attendees can bring guests
                </p>
              </div>
              <Switch
                id="allow-guests"
                checked={settings.allow_guests}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, allow_guests: checked }))}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/dna/convene/events/${slugOrId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || updateEventMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
