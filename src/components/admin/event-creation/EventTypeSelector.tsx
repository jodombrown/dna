
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Value is already updated via onChange, so we don't need to do anything else
    }
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
            <SelectValue placeholder="Select event type" />
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
          placeholder="Type custom event type"
          value={value}
          onChange={handleCustomInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default EventTypeSelector;
