
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import EventCreationForm from './event-creation/EventCreationForm';
import { Event } from '@/types/eventTypes';

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: () => void;
  event: Event | null;
}

const EventEditDialog: React.FC<EventEditDialogProps> = ({
  open,
  onOpenChange,
  onEventUpdated,
  event
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
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

  // Populate form when event changes
  useEffect(() => {
    if (event && open) {
      console.log('Populating form with event data:', event);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        type: event.type || '',
        location: event.location || '',
        isVirtual: event.is_virtual || false,
        isFeatured: event.is_featured || false,
        maxAttendees: event.max_attendees ? event.max_attendees.toString() : '',
        registrationUrl: '', // This field might not exist in the current Event type
        dateTime: event.date_time ? new Date(event.date_time).toISOString().slice(0, 16) : ''
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [event, open]);

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Event title is required');
    if (!formData.description.trim()) errors.push('Event description is required');
    if (!formData.type.trim()) errors.push('Event type is required');
    if (!formData.dateTime) errors.push('Event date and time is required');
    if (!formData.isVirtual && !formData.location.trim()) {
      errors.push('Location is required for non-virtual events');
    }
    
    if (formData.dateTime) {
      const eventDate = new Date(formData.dateTime);
      const now = new Date();
      if (eventDate <= now) {
        errors.push('Event date must be in the future');
      }
    }
    
    if (formData.maxAttendees && parseInt(formData.maxAttendees) <= 0) {
      errors.push('Maximum attendees must be greater than 0');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !event) {
      toast({
        title: "Error",
        description: "Missing required data for event update.",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }

    console.log('Starting event update process for event:', event.id);
    setLoading(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        console.log('Uploading new image...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.warn('Image upload failed, proceeding without new image:', uploadError.message);
          toast({
            title: "Image Upload Warning",
            description: "Could not upload new image, but event will be updated without it.",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
          console.log('New image uploaded successfully:', imageUrl);
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type.trim(),
        date_time: formData.dateTime,
        location: formData.isVirtual ? null : formData.location.trim(),
        is_virtual: formData.isVirtual,
        is_featured: formData.isFeatured,
        max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        registration_url: formData.registrationUrl.trim() || null,
        ...(imageUrl && { image_url: imageUrl }),
        updated_at: new Date().toISOString()
      };

      console.log('Updating event with data:', eventData);

      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update event: ${error.message}`);
      }

      console.log('Event updated successfully:', data);

      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully.",
      });

      onEventUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!event) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event: {event.title}</DialogTitle>
        </DialogHeader>
        
        <EventCreationForm
          formData={formData}
          imagePreview={imagePreview}
          loading={loading}
          onFormDataChange={handleFormDataChange}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventEditDialog;
