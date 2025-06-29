
import React from 'react';
import { Button } from '@/components/ui/button';

interface EventActionsSectionProps {
  onContactHost: () => void;
  onReportEvent: () => void;
}

const EventActionsSection: React.FC<EventActionsSectionProps> = ({ 
  onContactHost, 
  onReportEvent 
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <Button 
          variant="outline" 
          className="justify-start gap-2"
          onClick={onContactHost}
        >
          <span>Contact the Host</span>
        </Button>
        <Button 
          variant="outline" 
          className="justify-start gap-2 text-red-600 hover:text-red-700"
          onClick={onReportEvent}
        >
          <span>Report Event</span>
        </Button>
      </div>
    </div>
  );
};

export default EventActionsSection;
