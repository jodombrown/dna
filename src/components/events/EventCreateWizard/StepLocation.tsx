import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPinIcon, VideoIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventData } from './index';

interface StepLocationProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
  eventId?: string | null;
  onNext?: () => void;
  onBack?: () => void;
}

type FormData = { 
  venue_name?: string; 
  address?: string; 
  online_url?: string;
  is_virtual: boolean;
};

const StepLocation: React.FC<StepLocationProps> = ({ 
  eventData, 
  updateEventData, 
  eventId, 
  onNext, 
  onBack 
}) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      venue_name: '',
      address: eventData.location || '',
      online_url: eventData.online_url || '',
      is_virtual: eventData.is_virtual || false
    }
  });

  const isVirtual = watch('is_virtual');

  const handleVirtualToggle = (checked: boolean) => {
    setValue('is_virtual', checked);
    updateEventData('is_virtual', checked);
  };

  const handleFormSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      // Update local state
      updateEventData('is_virtual', formData.is_virtual);
      updateEventData('online_url', formData.online_url || '');
      
      if (formData.is_virtual) {
        updateEventData('location', 'Virtual Event');
      } else {
        const locationText = [formData.venue_name, formData.address]
          .filter(Boolean)
          .join(', ') || '';
        updateEventData('location', locationText);
      }

      // If we have an eventId, update the database
      if (eventId) {
        const updateData: any = {
          is_virtual: formData.is_virtual,
          online_url: formData.online_url || null,
        };

        // Store location info in location_json for structured data
        if (formData.is_virtual) {
          updateData.location = 'Virtual Event';
          updateData.location_json = null;
        } else {
          const locationText = [formData.venue_name, formData.address]
            .filter(Boolean)
            .join(', ');
          updateData.location = locationText || null;
          updateData.location_json = formData.venue_name || formData.address ? {
            venue_name: formData.venue_name || null,
            address: formData.address || null
          } : null;
        }

        const { error } = await supabase
          .from('events')
          .update(updateData)
          .eq('id', eventId);

        if (error) {
          toast.error('Failed to save location information');
          return;
        }

        toast.success('Location saved successfully!');
      }

      onNext?.();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_virtual"
            checked={isVirtual}
            onCheckedChange={handleVirtualToggle}
          />
          <Label htmlFor="is_virtual" className="flex items-center space-x-2">
            <VideoIcon className="w-4 h-4" />
            <span>This is a virtual event</span>
          </Label>
        </div>

        {isVirtual ? (
          <Card className="p-4 border-dashed">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <VideoIcon className="w-5 h-5" />
                <h3 className="font-medium">Virtual Event Setup</h3>
              </div>
              <div>
                <Label htmlFor="online_url">Meeting Link</Label>
                <Input
                  id="online_url"
                  {...register('online_url')}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This link will be shared with registered attendees
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border-dashed">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <MapPinIcon className="w-5 h-5" />
                <h3 className="font-medium">Physical Location</h3>
              </div>
              <div>
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  {...register('venue_name')}
                  placeholder="Enter venue name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Venue Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Enter full venue address"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include street address, city, and any specific room/floor details
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Location Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• For virtual events, test your meeting link before the event</li>
            <li>• For physical events, include parking and public transport details</li>
            <li>• Consider accessibility requirements for your venue</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onBack}
            disabled={saving}
          >
            Back
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepLocation;