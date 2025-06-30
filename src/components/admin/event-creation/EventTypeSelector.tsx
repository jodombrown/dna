
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ value, onChange }) => {
  const predefinedEventTypes = [
    'Professional Networking',
    'Investment & Funding',
    'Mentorship & Coaching',
    'Cultural Celebrations',
    'Startup Pitch Sessions',
    'Skill-Building Workshops',
    'Community Roundtables',
    'Impact Project Showcases',
    'Policy & Advocacy Dialogues',
    'Academic & Research Forums'
  ];

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <Label htmlFor="type">Event Type *</Label>
      <div className="space-y-2">
        <Select
          value={predefinedEventTypes.includes(value) ? value : ''}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select or type event type" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {predefinedEventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600">
          Or create a custom type:
        </div>
        <Input
          placeholder="Type custom event type (e.g., 'fundraiser', 'showcase')"
          value={value}
          onChange={handleCustomInputChange}
        />
      </div>
    </div>
  );
};

export default EventTypeSelector;
