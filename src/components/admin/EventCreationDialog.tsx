
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/components/profile/form/ImageUploadHandler';
import { useAuth } from '@/contexts/CleanAuthContext';
import EventCreationForm from './event-creation/EventCreationForm';

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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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
        
        <EventCreationForm
          formData={formData}
          imagePreview={imagePreview}
          loading={loading}
          onFormDataChange={handleFormDataChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationDialog;
