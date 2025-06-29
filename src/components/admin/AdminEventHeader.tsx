
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

interface AdminEventHeaderProps {
  onBack: () => void;
  onCreateEvent: () => void;
}

const AdminEventHeader: React.FC<AdminEventHeaderProps> = ({
  onBack,
  onCreateEvent
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Event Management</h1>
              <p className="text-sm text-gray-500">Manage community events and activities</p>
            </div>
          </div>
          <Button 
            className="bg-dna-emerald hover:bg-dna-emerald/90"
            onClick={onCreateEvent}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventHeader;
