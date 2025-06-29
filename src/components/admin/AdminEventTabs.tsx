
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminEventList from './AdminEventList';

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

interface AdminEventTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredEvents: Event[];
  searchTerm: string;
  typeFilter: string;
  onEventAction: (eventId: string, action: 'feature' | 'unfeature' | 'delete') => void;
}

const AdminEventTabs: React.FC<AdminEventTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredEvents,
  searchTerm,
  typeFilter,
  onEventAction
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="all">All Events</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        <TabsTrigger value="featured">Featured</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>
        <AdminEventList
          events={filteredEvents}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          onEventAction={onEventAction}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminEventTabs;
