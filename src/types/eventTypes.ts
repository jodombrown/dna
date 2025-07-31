
export interface Event {
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

export type EventAction = 'feature' | 'unfeature' | 'delete' | 'edit';

export interface EventFilters {
  searchTerm: string;
  typeFilter: string;
  activeTab: string;
}
