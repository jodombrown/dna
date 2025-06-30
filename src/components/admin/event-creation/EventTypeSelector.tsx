
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ value, onChange }) => {
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
    'Academic & Research Forums',
    'Technology & Innovation',
    'Health & Wellness',
    'Arts & Creative Expression',
    'Business Development',
    'Youth & Education'
  ];

  const allEventTypes = [...predefinedEventTypes, ...customTypes];

  const handleSelectChange = (selectedValue: string) => {
    console.log('Event type selected:', selectedValue);
    if (selectedValue === 'add_custom') {
      setShowCustomInput(true);
      return;
    }
    onChange(selectedValue);
    setShowCustomInput(false);
  };

  const handleAddCustomType = () => {
    if (newCustomType.trim() && !allEventTypes.includes(newCustomType.trim())) {
      const customType = newCustomType.trim();
      console.log('Adding custom event type:', customType);
      setCustomTypes(prev => [...prev, customType]);
      onChange(customType);
      setNewCustomType('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomType = (typeToRemove: string) => {
    console.log('Removing custom event type:', typeToRemove);
    setCustomTypes(prev => prev.filter(type => type !== typeToRemove));
    if (value === typeToRemove) {
      onChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomType();
    }
    if (e.key === 'Escape') {
      setShowCustomInput(false);
      setNewCustomType('');
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="type">Event Type *</Label>
      
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50 max-h-60 overflow-y-auto">
          {predefinedEventTypes.map((type) => (
            <SelectItem key={type} value={type} className="cursor-pointer">
              {type}
            </SelectItem>
          ))}
          
          {customTypes.length > 0 && (
            <>
              <div className="px-2 py-1 text-sm font-medium text-gray-500 border-t">Custom Types</div>
              {customTypes.map((type) => (
                <div key={type} className="flex items-center justify-between px-2 py-2 hover:bg-gray-50">
                  <SelectItem value={type} className="flex-1 border-none cursor-pointer">
                    {type}
                  </SelectItem>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveCustomType(type);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </>
          )}
          
          <SelectItem value="add_custom" className="text-blue-600 font-medium cursor-pointer">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Custom Type
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {showCustomInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom event type"
            value={newCustomType}
            onChange={(e) => setNewCustomType(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            className="bg-white"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomType}
            disabled={!newCustomType.trim()}
            className="bg-dna-emerald hover:bg-dna-emerald/90"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCustomInput(false);
              setNewCustomType('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {value && (
        <div className="text-sm text-gray-600">
          Selected: <span className="font-medium">{value}</span>
        </div>
      )}
    </div>
  );
};

export default EventTypeSelector;
