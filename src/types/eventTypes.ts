
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
  updated_at: string;
  created_by: string;
  banner_url?: string | null;
  image_url?: string | null;
  registration_url?: string | null;
  creator_profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
}

export type EventAction = 'feature' | 'unfeature' | 'delete' | 'edit';

export interface EventFilters {
  searchTerm: string;
  typeFilter: string;
  activeTab: string;
}
