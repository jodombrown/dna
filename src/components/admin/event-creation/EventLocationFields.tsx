
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface EventLocationFieldsProps {
  isVirtual: boolean;
  location: string;
  onVirtualChange: (checked: boolean) => void;
  onLocationChange: (value: string) => void;
}

const EventLocationFields: React.FC<EventLocationFieldsProps> = ({
  isVirtual,
  location,
  onVirtualChange,
  onLocationChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="isVirtual"
          checked={isVirtual}
          onCheckedChange={onVirtualChange}
        />
        <Label htmlFor="isVirtual">Virtual Event</Label>
      </div>

      {!isVirtual && (
        <div>
          <Label htmlFor="location">Event Location *</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Enter event location"
            required={!isVirtual}
          />
        </div>
      )}
    </div>
  );
};

export default EventLocationFields;
