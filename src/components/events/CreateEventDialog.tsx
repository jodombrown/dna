import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EventType, EventFormat, CreateEventInput } from '@/types/events';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComprehensiveLocationInput from '@/components/ui/comprehensive-location-input';

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSuccess?: (eventId: string) => void;
}

export function CreateEventDialog({
  isOpen,
  onClose,
  currentUserId,
  onSuccess,
}: CreateEventDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    event_type: 'meetup',
    format: 'in_person',
    location_name: '',
    location_city: '',
    location_country: '',
    meeting_url: '',
    start_time: '',
    end_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_public: true,
    requires_approval: false,
    allow_guests: false,
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter an event title',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please enter an event description',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      toast({
        title: 'Date and time required',
        description: 'Please set event start and end times',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      toast({
        title: 'Invalid times',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    // Format validation
    if (formData.format === 'virtual' && !formData.meeting_url) {
      toast({
        title: 'Meeting URL required',
        description: 'Virtual events require a meeting URL',
        variant: 'destructive',
      });
      return;
    }

    if (formData.format === 'in_person' && !formData.location_name) {
      toast({
        title: 'Location required',
        description: 'In-person events require a location',
        variant: 'destructive',
      });
      return;
    }

    if (formData.format === 'hybrid' && (!formData.meeting_url || !formData.location_name)) {
      toast({
        title: 'Location and URL required',
        description: 'Hybrid events require both location and meeting URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user?.id) {
        throw new Error('You must be logged in to create an event');
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Event created!',
        description: 'Your event has been published',
      });

      onSuccess?.(data.id);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: 'meetup',
        format: 'in_person',
        location_name: '',
        location_city: '',
        location_country: '',
        meeting_url: '',
        start_time: '',
        end_time: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_public: true,
        requires_approval: false,
        allow_guests: false,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create an Event</DialogTitle>
          <DialogDescription>
            Organize a meetup, conference, workshop, or gathering for the diaspora community
          </DialogDescription>
        </DialogHeader>

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
                placeholder="e.g., African Tech Summit 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What's this event about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
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
                  <Label htmlFor="location-name">Venue/Location Name *</Label>
                  <Input
                    id="location-name"
                    placeholder="e.g., WeWork Lagos, Central Park"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  />
                </div>

                <ComprehensiveLocationInput
                  id="event-location"
                  label="City & Country *"
                  value={formData.location_city && formData.location_country 
                    ? `${formData.location_city}, ${formData.location_country}` 
                    : ''}
                  onChange={(value) => {
                    const parts = value.split(',').map(s => s.trim());
                    if (parts.length >= 2) {
                      setFormData({ 
                        ...formData, 
                        location_city: parts[0],
                        location_country: parts.slice(1).join(', ')
                      });
                    } else {
                      setFormData({ ...formData, location_city: value, location_country: '' });
                    }
                  }}
                  placeholder="Search for city and country..."
                  required={false}
                />
              </>
            )}

            {(formData.format === 'virtual' || formData.format === 'hybrid') && (
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
