
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import EventCreationForm from './event-creation/EventCreationForm';

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  open,
  onOpenChange,
  onEventCreated
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
    
    // Validate date is in the future
    if (formData.dateTime) {
      const eventDate = new Date(formData.dateTime);
      const now = new Date();
      if (eventDate <= now) {
        errors.push('Event date must be in the future');
      }
    }
    
    // Validate max attendees if provided
    if (formData.maxAttendees && parseInt(formData.maxAttendees) <= 0) {
      errors.push('Maximum attendees must be greater than 0');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create events.",
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

    console.log('Starting event creation process...');
    setLoading(true);

    try {
      let imageUrl = null;
      
      // Handle image upload if there's an image
      if (imageFile) {
        console.log('Uploading image...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Check if bucket exists, if not we'll handle the error gracefully
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.warn('Image upload failed, proceeding without image:', uploadError.message);
          toast({
            title: "Image Upload Warning",
            description: "Could not upload image, but event will be created without it.",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        }
      }

      // Prepare event data
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
        image_url: imageUrl,
        created_by: user.id,
        attendee_count: 0
      };

      console.log('Creating event with data:', eventData);

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create event: ${error.message}`);
      }

      console.log('Event created successfully:', data);

      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
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
      
      onEventCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
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

export default EventCreationDialog;
