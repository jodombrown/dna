import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPinIcon, UsersIcon, SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WIZARD_STEPS = [
  { id: 'basics', title: 'Event Basics', icon: CalendarIcon },
  { id: 'details', title: 'Details & Location', icon: MapPinIcon },
  { id: 'tickets', title: 'Tickets & Capacity', icon: UsersIcon },
  { id: 'settings', title: 'Settings', icon: SettingsIcon },
];

interface EventData {
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  is_virtual: boolean;
  visibility: string;
  capacity: number | null;
  waitlist_enabled: boolean;
  online_url: string;
  slug: string;
}

const EventCreateWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    date_time: '',
    location: '',
    type: 'workshop',
    is_virtual: false,
    visibility: 'public',
    capacity: null,
    waitlist_enabled: false,
    online_url: '',
    slug: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Math.random().toString(36).substr(2, 6);
  };

  const updateEventData = (field: keyof EventData, value: any) => {
    setEventData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when title changes
      if (field === 'title' && value) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!eventData.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in to create events');
        return;
      }

      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        organizer_id: user.user.id,
        event_type: (eventData.type as 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other') || 'other',
        format: (eventData.is_virtual ? 'virtual' : 'in_person') as 'in_person' | 'virtual' | 'hybrid',
        start_time: eventData.date_time,
        end_time: eventData.date_time, // Same as start for now
        location_name: eventData.location,
        meeting_url: eventData.is_virtual ? eventData.online_url : null,
        max_attendees: eventData.capacity || null,
        is_public: eventData.visibility === 'public',
        requires_approval: false,
        allow_guests: false,
        timezone: 'UTC',
      };

      const { data: event, error } = await supabase
        .from('events')
        .insert([eventPayload])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        toast.error('Failed to create event');
        return;
      }

      toast.success('Event created successfully!');
      // Phase 1.5: Navigate to events list instead of detail page
      navigate('/dna/convene/events');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case 'basics':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => updateEventData('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => updateEventData('description', e.target.value)}
                placeholder="Describe your event"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="type">Event Type</Label>
              <Select value={eventData.type} onValueChange={(value) => updateEventData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date_time">Date & Time</Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={eventData.date_time}
                onChange={(e) => updateEventData('date_time', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_virtual"
                checked={eventData.is_virtual}
                onCheckedChange={(checked) => updateEventData('is_virtual', checked)}
              />
              <Label htmlFor="is_virtual">This is a virtual event</Label>
            </div>
            {eventData.is_virtual ? (
              <div>
                <Label htmlFor="online_url">Online Meeting URL</Label>
                <Input
                  id="online_url"
                  value={eventData.online_url}
                  onChange={(e) => updateEventData('online_url', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventData.location}
                  onChange={(e) => updateEventData('location', e.target.value)}
                  placeholder="Enter venue address"
                />
              </div>
            )}
          </div>
        );

      case 'tickets':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="capacity">Maximum Attendees</Label>
              <Input
                id="capacity"
                type="number"
                value={eventData.capacity || ''}
                onChange={(e) => updateEventData('capacity', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="waitlist_enabled"
                checked={eventData.waitlist_enabled}
                onCheckedChange={(checked) => updateEventData('waitlist_enabled', checked)}
              />
              <Label htmlFor="waitlist_enabled">Enable waitlist when full</Label>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="visibility">Event Visibility</Label>
              <Select value={eventData.visibility} onValueChange={(value) => updateEventData('visibility', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can see and register</SelectItem>
                  <SelectItem value="members">Members only</SelectItem>
                  <SelectItem value="private">Private - Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="slug">Event URL Slug</Label>
              <Input
                id="slug"
                value={eventData.slug}
                onChange={(e) => updateEventData('slug', e.target.value)}
                placeholder="your-event-slug"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your event will be accessible at: /events/{eventData.slug}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <div className="flex items-center space-x-4 mt-4">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    index === currentStep ? 'text-primary' : index < currentStep ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                  {index < WIZARD_STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/dna/convene/events')}
              >
                Cancel
              </Button>
              
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Event'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCreateWizard;