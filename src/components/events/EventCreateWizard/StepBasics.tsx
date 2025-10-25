import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventData } from './index';

interface StepBasicsProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
  onNext?: (eventId: string) => void;
}

type FormData = { 
  title: string; 
  description: string;
  date_time: string; 
  end_time?: string; 
  type: "workshop" | "conference" | "meetup" | "webinar" | "networking" | "panel" | "hackathon" | "training";
};

const StepBasics: React.FC<StepBasicsProps> = ({ eventData, updateEventData, onNext }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: eventData.title,
      description: eventData.description,
      date_time: eventData.date_time,
      type: eventData.type as FormData['type']
    }
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

  const handleFormSubmit = async (formData: FormData) => {
    if (!formData.title.trim()) {
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

      // Update local state first
      updateEventData('title', formData.title);
      updateEventData('description', formData.description);
      updateEventData('date_time', formData.date_time);
      updateEventData('type', formData.type);
      updateEventData('slug', generateSlug(formData.title));

      // Create draft event in database
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          organizer_id: user.user.id,
          event_type: (formData.type as 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other') || 'other',
          format: 'in_person' as 'in_person',
          start_time: formData.date_time,
          end_time: formData.date_time,
          is_public: false,
          requires_approval: false,
          allow_guests: false,
          timezone: 'UTC',
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Error creating draft event:', error);
        toast.error('Failed to save draft. Please try again.');
        return;
      }

      if (!data) {
        toast.error('No event was created. Please try again.');
        return;
      }

      toast.success('Draft saved successfully!');
      onNext?.(data.id);
    } catch (error) {
      console.error('Unexpected error creating draft:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Event title is required' })}
            placeholder="Enter event title"
            className="mt-1"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe your event, what attendees will learn or experience"
            rows={4}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Event Type *</Label>
            <Select 
              value={eventData.type} 
              onValueChange={(value) => updateEventData('type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="panel">Panel Discussion</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date_time">Start Date & Time *</Label>
            <Input
              id="date_time"
              {...register('date_time', { required: 'Start date and time is required' })}
              type="datetime-local"
              className="mt-1"
            />
            {errors.date_time && (
              <p className="text-sm text-destructive mt-1">{errors.date_time.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="end_time">End Date & Time (Optional)</Label>
          <Input
            id="end_time"
            {...register('end_time')}
            type="datetime-local"
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving Draft...' : 'Save & Continue'}
        </Button>
      </form>
    </div>
  );
};

export default StepBasics;