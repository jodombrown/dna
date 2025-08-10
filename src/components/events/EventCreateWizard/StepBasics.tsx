import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventData } from './index';

interface StepBasicsProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
}

const StepBasics: React.FC<StepBasicsProps> = ({ eventData, updateEventData }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={eventData.title}
          onChange={(e) => updateEventData('title', e.target.value)}
          placeholder="Enter event title"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={eventData.description}
          onChange={(e) => updateEventData('description', e.target.value)}
          placeholder="Describe your event, what attendees will learn or experience"
          rows={4}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Event Type</Label>
          <Select value={eventData.type} onValueChange={(value) => updateEventData('type', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="panel">Panel Discussion</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="date_time">Date & Time *</Label>
          <Input
            id="date_time"
            type="datetime-local"
            value={eventData.date_time}
            onChange={(e) => updateEventData('date_time', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default StepBasics;