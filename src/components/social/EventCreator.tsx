
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSocialPosts } from '@/hooks/useSocialPosts';

const EventCreator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createPost } = useSocialPosts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    is_virtual: false,
    max_attendees: '',
    registration_url: ''
  });

  const handleSubmit = async () => {
    if (!user || !formData.title || !formData.date_time) return;

    setLoading(true);
    try {
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date_time: formData.date_time,
          location: formData.location,
          is_virtual: formData.is_virtual,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          registration_url: formData.registration_url,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create a post about this event
      await createPost(
        `📅 New Event: ${formData.title}\n\n${formData.description}\n\n📍 ${formData.is_virtual ? 'Virtual Event' : formData.location}\n🗓️ ${new Date(formData.date_time).toLocaleDateString()}\n\n#DiasporaEvents #DNACommunity`,
        'event_share',
        { shared_event_id: event.id }
      );

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        date_time: '',
        location: '',
        is_virtual: false,
        max_attendees: '',
        registration_url: ''
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="event_title">Event Title</Label>
        <Input
          id="event_title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Diaspora Tech Meetup Lagos"
        />
      </div>

      <div>
        <Label htmlFor="event_description">Description</Label>
        <Textarea
          id="event_description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your event..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event_date">Date & Time</Label>
          <Input
            id="event_date"
            type="datetime-local"
            value={formData.date_time}
            onChange={(e) => setFormData(prev => ({ ...prev, date_time: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="max_attendees">Max Attendees</Label>
          <Input
            id="max_attendees"
            type="number"
            value={formData.max_attendees}
            onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: e.target.value }))}
            placeholder="50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_virtual"
          checked={formData.is_virtual}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_virtual: checked }))}
        />
        <Label htmlFor="is_virtual">Virtual Event</Label>
      </div>

      {!formData.is_virtual && (
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="1234 Main St, Lagos, Nigeria"
          />
        </div>
      )}

      <div>
        <Label htmlFor="registration_url">Registration URL (optional)</Label>
        <Input
          id="registration_url"
          value={formData.registration_url}
          onChange={(e) => setFormData(prev => ({ ...prev, registration_url: e.target.value }))}
          placeholder="https://eventbrite.com/..."
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!formData.title || !formData.date_time || loading}
          className="bg-dna-copper hover:bg-dna-gold text-white"
        >
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </div>
  );
};

export default EventCreator;
