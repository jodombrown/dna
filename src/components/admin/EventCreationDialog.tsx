
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/components/profile/form/ImageUploadHandler';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Upload, X } from 'lucide-react';

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  open,
  onOpenChange,
  onEventCreated
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    isVirtual: false,
    isFeatured: false,
    maxAttendees: '',
    registrationUrl: '',
    dateTime: ''
  });

  const predefinedEventTypes = [
    'networking',
    'workshop', 
    'conference',
    'meetup',
    'webinar',
    'social',
    'panel-discussion',
    'hackathon',
    'career-fair',
    'mentorship'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEventTypeChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dateTime || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including event type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile && user?.id) {
        try {
          imageUrl = await uploadImage(imageFile, user.id, 'event-images');
          if (!imageUrl) {
            console.warn('Image upload failed, continuing without image');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: "Warning",
            description: "Event will be created but image upload failed.",
            variant: "destructive",
          });
        }
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          location: formData.isVirtual ? 'Virtual' : formData.location,
          is_virtual: formData.isVirtual,
          is_featured: formData.isFeatured,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          registration_url: formData.registrationUrl || null,
          date_time: new Date(formData.dateTime).toISOString(),
          image_url: imageUrl,
          banner_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "The event has been successfully created.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        location: '',
        isVirtual: false,
        isFeatured: false,
        maxAttendees: '',
        registrationUrl: '',
        dateTime: ''
      });
      setImageFile(null);
      setImagePreview(null);
      
      onOpenChange(false);
      onEventCreated?.();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new community event. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Event Type *</Label>
              <div className="space-y-2">
                <Select
                  value={formData.type}
                  onValueChange={handleEventTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type event type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {predefinedEventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600">
                  Or create a custom type:
                </div>
                <Input
                  placeholder="Type custom event type (e.g., 'fundraiser', 'showcase')"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this event is about..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="dateTime">Event Date & Time *</Label>
            <Input
              id="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={(checked) => setFormData({ ...formData, isVirtual: checked })}
              />
              <Label htmlFor="isVirtual">Virtual Event</Label>
            </div>

            {!formData.isVirtual && (
              <div>
                <Label htmlFor="location">Event Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter event location"
                  required={!formData.isVirtual}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Event Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Upload Image</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="registrationUrl">Registration URL (Optional)</Label>
              <Input
                id="registrationUrl"
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
            />
            <Label htmlFor="isFeatured">Feature this event</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-dna-emerald hover:bg-dna-emerald/90"
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
