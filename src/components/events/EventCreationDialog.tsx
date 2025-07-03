import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, MapPin, Globe, Video, X } from 'lucide-react';

interface EventCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'conference',
    location: '',
    is_virtual: false,
    date_time: '',
    max_attendees: '',
    image_url: '',
    registration_url: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const eventTypes = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'networking', label: 'Networking' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'roundtable', label: 'Roundtable' },
    { value: 'pitch', label: 'Pitch Event' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        is_virtual: formData.is_virtual,
        date_time: formData.date_time ? new Date(formData.date_time).toISOString() : null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        image_url: formData.image_url || null,
        registration_url: formData.registration_url || null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'conference',
        location: '',
        is_virtual: false,
        date_time: '',
        max_attendees: '',
        image_url: '',
        registration_url: ''
      });
      setTags([]);
      setNewTag('');
      
      onEventCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-dna-copper" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Share an event with the diaspora community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="African Tech Summit 2025"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event..."
                rows={3}
              />
            </div>

            <div>
              <Label>Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_time">Date & Time</Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
                />
                <Label htmlFor="is_virtual" className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Virtual Event
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-1">
                {formData.is_virtual ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={formData.is_virtual ? "Zoom/Virtual platform" : "City, Country"}
              />
            </div>

            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="image_url">Event Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="registration_url">Registration URL</Label>
              <Input
                id="registration_url"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                placeholder="https://eventbrite.com/..."
              />
            </div>

            <div className="md:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationDialog;