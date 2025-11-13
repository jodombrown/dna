import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Calendar, MapPin, Globe, Clock, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const eventSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  event_type: z.enum(['conference', 'workshop', 'meetup', 'webinar', 'networking', 'social', 'other']),
  format: z.enum(['in_person', 'virtual', 'hybrid']),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  location_city: z.string().optional(),
  location_country: z.string().optional(),
  meeting_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  meeting_platform: z.string().optional(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  timezone: z.string().default('UTC'),
  max_attendees: z.coerce.number().positive('Must be a positive number').optional().or(z.literal(null)),
  is_public: z.boolean().default(true),
  requires_approval: z.boolean().default(false),
  allow_guests: z.boolean().default(true),
  cover_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return new Date(data.end_time) > new Date(data.start_time);
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  preselectedGroupId?: string;
}

export const CreateEventForm = ({ preselectedGroupId }: CreateEventFormProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('basic');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(preselectedGroupId || null);

  // Fetch user's groups where they can host events
  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-admin-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, role, groups(id, name, slug, avatar_url)')
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin', 'moderator']);

      if (error) throw error;
      return data?.filter(m => m.groups).map(m => m.groups) || [];
    },
    enabled: !!user,
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_public: true,
      requires_approval: false,
      allow_guests: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  });

  const formatValue = form.watch('format');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      // Format-specific validation
      if (data.format === 'in_person' || data.format === 'hybrid') {
        if (!data.location_city || !data.location_country) {
          toast({
            title: 'Missing Location',
            description: 'Please provide city and country for in-person events',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (data.format === 'virtual' || data.format === 'hybrid') {
        if (!data.meeting_url) {
          toast({
            title: 'Missing Meeting URL',
            description: 'Please provide a meeting URL for virtual events',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Call edge function
      const { data: result, error } = await supabase.functions.invoke('create-event', {
        body: {
          ...data,
          max_attendees: isNaN(data.max_attendees as any) ? null : data.max_attendees,
          group_id: selectedGroupId || null,
        },
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      toast({
        title: 'Event Created!',
        description: 'Your event has been successfully created',
      });

      // Navigate to the new event
      navigate(`/dna/convene/events/${result.event.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Format & Location</TabsTrigger>
            <TabsTrigger value="settings">Time & Settings</TabsTrigger>
          </TabsList>

          {/* Step 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Tell people what your event is about</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="African Diaspora Tech Meetup" {...field} />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/200 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event, what attendees will learn or experience..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0} characters (minimum 50)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Group Selector (if user has groups) */}
                {userGroups && userGroups.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Host as Group (Optional)</label>
                    <Select
                      value={selectedGroupId || 'personal'}
                      onValueChange={(val) => setSelectedGroupId(val === 'personal' ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Host as Individual</SelectItem>
                        {userGroups.map((group: any) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose to host this event on behalf of a group you manage
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <ImageIcon className="h-5 w-5 text-muted-foreground mt-2" />
                          <Input 
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Optional: Add a cover image for your event</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setCurrentStep('location')}>
                Next: Format & Location
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Format & Location */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Format</CardTitle>
                <CardDescription>How will people attend?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(formatValue === 'in_person' || formatValue === 'hybrid') && (
                  <>
                    <FormField
                      control={form.control}
                      name="location_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Name</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                              <Input placeholder="TechHub Accra" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Independence Avenue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Accra" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ghana" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {(formatValue === 'virtual' || formatValue === 'hybrid') && (
                  <>
                    <FormField
                      control={form.control}
                      name="meeting_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting URL *</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Globe className="h-5 w-5 text-muted-foreground mt-2" />
                              <Input placeholder="https://zoom.us/j/..." {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>Zoom, Google Meet, or other platform link</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meeting_platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <FormControl>
                            <Input placeholder="Zoom, Google Meet, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep('basic')}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep('settings')}>
                Next: Time & Settings
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Time & Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Timing</CardTitle>
                <CardDescription>When will your event take place?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground mt-2" />
                          <Input {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Default: {Intl.DateTimeFormat().resolvedOptions().timeZone}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="max_attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Users className="h-5 w-5 text-muted-foreground mt-2" />
                          <Input 
                            type="number" 
                            placeholder="Unlimited"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : NaN)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Leave empty for unlimited capacity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Event</FormLabel>
                        <FormDescription>
                          Anyone can discover and view this event
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Approval</FormLabel>
                        <FormDescription>
                          You'll approve each attendee before they can join
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allow_guests"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Guests</FormLabel>
                        <FormDescription>
                          Let attendees bring additional guests
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep('location')}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};
