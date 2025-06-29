
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import AdminEventCard from './AdminEventCard';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  attendee_count: number;
  max_attendees: number | null;
  is_featured: boolean;
  is_virtual: boolean;
  created_at: string;
  created_by: string;
  creator_profile?: {
    full_name: string;
    email: string;
  } | null;
}

interface AdminEventListProps {
  events: Event[];
  searchTerm: string;
  typeFilter: string;
  onEventAction: (eventId: string, action: 'feature' | 'unfeature' | 'delete') => void;
}

const AdminEventList: React.FC<AdminEventListProps> = ({
  events,
  searchTerm,
  typeFilter,
  onEventAction
}) => {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'No events have been created yet.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <AdminEventCard
          key={event.id}
          event={event}
          onEventAction={onEventAction}
        />
      ))}
    </div>
  );
};

export default AdminEventList;
