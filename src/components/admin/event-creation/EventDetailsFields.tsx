
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface EventDetailsFieldsProps {
  maxAttendees: string;
  registrationUrl: string;
  isFeatured: boolean;
  onMaxAttendeesChange: (value: string) => void;
  onRegistrationUrlChange: (value: string) => void;
  onFeaturedChange: (checked: boolean) => void;
}

const EventDetailsFields: React.FC<EventDetailsFieldsProps> = ({
  maxAttendees,
  registrationUrl,
  isFeatured,
  onMaxAttendeesChange,
  onRegistrationUrlChange,
  onFeaturedChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
          <Input
            id="maxAttendees"
            type="number"
            value={maxAttendees}
            onChange={(e) => onMaxAttendeesChange(e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>
        
        <div>
          <Label htmlFor="registrationUrl">Registration URL (Optional)</Label>
          <Input
            id="registrationUrl"
            type="url"
            value={registrationUrl}
            onChange={(e) => onRegistrationUrlChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isFeatured"
          checked={isFeatured}
          onCheckedChange={onFeaturedChange}
        />
        <Label htmlFor="isFeatured">Feature this event</Label>
      </div>
    </>
  );
};

export default EventDetailsFields;
