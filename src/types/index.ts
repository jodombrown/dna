
// Core application types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  member_count?: number;
  is_featured?: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date_time?: string;
  location?: string;
  is_virtual?: boolean;
  max_attendees?: number;
  attendee_count?: number;
  type?: string;
  is_featured?: boolean;
  image_url?: string;
  banner_url?: string;
  registration_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  impact_area?: string;
  status?: string;
  creator_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  impact_area?: string;
  creator_id?: string;
  created_at: string;
  updated_at: string;
}
