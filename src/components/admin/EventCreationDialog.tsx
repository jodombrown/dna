
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

    setLoading(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date_time: formData.dateTime,
        location: formData.isVirtual ? null : formData.location,
        is_virtual: formData.isVirtual,
        is_featured: formData.isFeatured,
        max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        registration_url: formData.registrationUrl || null,
        image_url: imageUrl,
        created_by: user.id
      };

      console.log('Creating event with data:', eventData);

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

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
