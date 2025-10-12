
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface EventTicketSectionProps {
  onRegister: () => void;
}

const EventTicketSection: React.FC<EventTicketSectionProps> = ({ onRegister }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Get Tickets</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Registration closes in 5 days</span>
        </div>
        <div className="text-sm text-gray-600">
          Secure your spot before it's too late!
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-lg font-semibold text-gray-900">Free</div>
        <div className="text-sm text-gray-600">Per ticket</div>
      </div>

      <Button 
        className="w-full bg-dna-emerald hover:bg-dna-forest text-white font-medium py-3 text-lg"
        onClick={onRegister}
      >
        Register Now
      </Button>
    </div>
  );
};

export default EventTicketSection;
