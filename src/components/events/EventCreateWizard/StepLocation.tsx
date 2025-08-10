import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { MapPinIcon, VideoIcon } from 'lucide-react';
import { EventData } from './index';

interface StepLocationProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
}

const StepLocation: React.FC<StepLocationProps> = ({ eventData, updateEventData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="is_virtual"
          checked={eventData.is_virtual}
          onCheckedChange={(checked) => updateEventData('is_virtual', checked)}
        />
        <Label htmlFor="is_virtual" className="flex items-center space-x-2">
          <VideoIcon className="w-4 h-4" />
          <span>This is a virtual event</span>
        </Label>
      </div>

      {eventData.is_virtual ? (
        <Card className="p-4 border-dashed">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <VideoIcon className="w-5 h-5" />
              <h3 className="font-medium">Virtual Event Setup</h3>
            </div>
            <div>
              <Label htmlFor="online_url">Meeting Link</Label>
              <Input
                id="online_url"
                value={eventData.online_url}
                onChange={(e) => updateEventData('online_url', e.target.value)}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This link will be shared with registered attendees
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-dashed">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <MapPinIcon className="w-5 h-5" />
              <h3 className="font-medium">Physical Location</h3>
            </div>
            <div>
              <Label htmlFor="location">Venue Address</Label>
              <Input
                id="location"
                value={eventData.location}
                onChange={(e) => updateEventData('location', e.target.value)}
                placeholder="Enter full venue address"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Include street address, city, and any specific room/floor details
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Location Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• For virtual events, test your meeting link before the event</li>
          <li>• For physical events, include parking and public transport details</li>
          <li>• Consider accessibility requirements for your venue</li>
        </ul>
      </div>
    </div>
  );
};

export default StepLocation;