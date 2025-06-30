
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EventBasicFieldsProps {
  title: string;
  description: string;
  dateTime: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
}

const EventBasicFields: React.FC<EventBasicFieldsProps> = ({
  title,
  description,
  dateTime,
  onTitleChange,
  onDescriptionChange,
  onDateTimeChange
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what this event is about..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="dateTime">Event Date & Time *</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => onDateTimeChange(e.target.value)}
          required
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>
    </>
  );
};

export default EventBasicFields;
