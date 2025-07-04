import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, MapPin, Globe, Video, X, Upload, ImageIcon } from 'lucide-react';

interface EnhancedEventCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

const EnhancedEventCreationDialog: React.FC<EnhancedEventCreationDialogProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'conference',
    location: '',
    is_virtual: false,
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    max_attendees: '',
    registration_url: ''
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const eventTypes = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'networking', label: 'Networking' },
    { value: 'cultural', label: 'Cultural Event' },
    { value: 'roundtable', label: 'Roundtable Discussion' },
    { value: 'pitch', label: 'Pitch Event' },
    { value: 'meetup', label: 'Community Meetup' },
    { value: 'panel', label: 'Panel Discussion' },
    { value: 'hackathon', label: 'Hackathon' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setBannerFile(file);
        const reader = new FileReader();
        reader.onload = () => setBannerPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (type: 'image' | 'banner') => {
    if (type === 'image') {
      setImageFile(null);
      setImagePreview(null);
    } else {
      setBannerFile(null);
      setBannerPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let image_url = null;
      let banner_url = null;

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-image.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);
          image_url = publicUrl;
        }
      }

      // Upload banner if present
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-banner.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, bannerFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);
          banner_url = publicUrl;
        }
      }

      // Combine date and time
      const startDateTime = formData.start_date && formData.start_time 
        ? new Date(`${formData.start_date}T${formData.start_time}`).toISOString()
        : null;

      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        is_virtual: formData.is_virtual,
        date_time: startDateTime,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        image_url,
        banner_url,
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
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        max_attendees: '',
        registration_url: ''
      });
      setTags([]);
      setNewTag('');
      setImageFile(null);
      setImagePreview(null);
      setBannerFile(null);
      setBannerPreview(null);
      
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-dna-copper" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Share an event with the diaspora community
          </DialogDescription>
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
                placeholder="African Tech Summit 2025"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event..."
                rows={3}
              />
            </div>
          </div>

          {/* Event Type and Virtual Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Event Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
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

          {/* Date and Time */}
          <div className="space-y-4">
            <Label>Event Schedule *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-sm">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_time" className="text-sm">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-sm">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time" className="text-sm">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-1">
              {formData.is_virtual ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              Location *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={formData.is_virtual ? "Zoom/Virtual platform details" : "Search for venue or enter address"}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.is_virtual 
                ? "Include meeting platform and access details" 
                : "Start typing to search for venues or enter a custom address"
              }
            </p>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Image */}
            <div>
              <Label>Event Image</Label>
              <Card className="p-4 border-dashed">
                <CardContent className="p-0">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage('image')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Event Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'image')}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Event Banner */}
            <div>
              <Label>Event Banner</Label>
              <Card className="p-4 border-dashed">
                <CardContent className="p-0">
                  {bannerPreview ? (
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage('banner')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Event Banner</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'banner')}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="registration_url">Registration URL</Label>
              <Input
                id="registration_url"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                placeholder="https://eventbrite.com/..."
              />
            </div>
          </div>

          {/* Tags */}
          <div>
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
              disabled={loading || !formData.title || !formData.start_date || !formData.start_time}
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

export default EnhancedEventCreationDialog;