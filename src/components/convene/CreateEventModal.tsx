import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateEventModal = ({ open, onClose }: CreateEventModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    is_virtual: false,
    max_attendees: '',
    registration_required: true,
    event_type: 'conference',
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
          location: data.location,
          is_virtual: data.is_virtual,
          max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
          registration_required: data.registration_required,
          event_type: data.event_type,
          created_by: user!.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return event;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        is_virtual: false,
        max_attendees: '',
        registration_required: true,
        event_type: 'conference',
      });
    },
    onError: (error) => {
      toast.error('Failed to create event');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_time) {
      toast.error('Please fill in required fields');
      return;
    }

    createEventMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="African Tech Summit 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <select
                id="event_type"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="networking">Networking</option>
                <option value="webinar">Webinar</option>
                <option value="meetup">Meetup</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date & Time *
                </Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date & Time
                </Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_virtual">Virtual Event</Label>
              <Switch
                id="is_virtual"
                checked={formData.is_virtual}
                onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
              />
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={formData.is_virtual ? "Zoom Link" : "City, Country or Venue"}
              />
            </div>
          </div>

          {/* Capacity & Registration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="max_attendees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Maximum Attendees (Optional)
              </Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Attendees must register before joining
                </p>
              </div>
              <Switch
                checked={formData.registration_required}
                onCheckedChange={(checked) => setFormData({ ...formData, registration_required: checked })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEventMutation.isPending}
              className="bg-dna-emerald hover:bg-dna-forest"
            >
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
