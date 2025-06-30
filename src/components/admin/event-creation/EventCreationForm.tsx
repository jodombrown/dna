
import React from 'react';
import { Button } from '@/components/ui/button';
import EventBasicFields from './EventBasicFields';
import EventTypeSelector from './EventTypeSelector';
import EventLocationFields from './EventLocationFields';
import EventImageUpload from './EventImageUpload';
import EventDetailsFields from './EventDetailsFields';

interface FormData {
  title: string;
  description: string;
  type: string;
  location: string;
  isVirtual: boolean;
  isFeatured: boolean;
  maxAttendees: string;
  registrationUrl: string;
  dateTime: string;
}

interface EventCreationFormProps {
  formData: FormData;
  imagePreview: string | null;
  loading: boolean;
  onFormDataChange: (data: Partial<FormData>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EventCreationForm: React.FC<EventCreationFormProps> = ({
  formData,
  imagePreview,
  loading,
  onFormDataChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventBasicFields
          title={formData.title}
          description={formData.description}
          dateTime={formData.dateTime}
          onTitleChange={(value) => onFormDataChange({ title: value })}
          onDescriptionChange={(value) => onFormDataChange({ description: value })}
          onDateTimeChange={(value) => onFormDataChange({ dateTime: value })}
        />
        
        <EventTypeSelector
          value={formData.type}
          onChange={(value) => onFormDataChange({ type: value })}
        />
      </div>

      <EventLocationFields
        isVirtual={formData.isVirtual}
        location={formData.location}
        onVirtualChange={(checked) => onFormDataChange({ isVirtual: checked })}
        onLocationChange={(value) => onFormDataChange({ location: value })}
      />

      <EventImageUpload
        imagePreview={imagePreview}
        onImageChange={onImageChange}
        onRemoveImage={onRemoveImage}
      />

      <EventDetailsFields
        maxAttendees={formData.maxAttendees}
        registrationUrl={formData.registrationUrl}
        isFeatured={formData.isFeatured}
        onMaxAttendeesChange={(value) => onFormDataChange({ maxAttendees: value })}
        onRegistrationUrlChange={(value) => onFormDataChange({ registrationUrl: value })}
        onFeaturedChange={(checked) => onFormDataChange({ isFeatured: checked })}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
  );
};

export default EventCreationForm;
