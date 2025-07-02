
export interface Professional {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  country_of_origin?: string;
  expertise?: string[];
  bio?: string;
  years_experience?: number;
  education?: string;
  languages?: string[];
  availability_for?: string[];
  linkedin_url?: string;
  website_url?: string;
  avatar_url?: string;
  skills?: string[]; // Added skills property
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  member_count: number;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type?: string;
  date_time?: string;
  location?: string;
  is_virtual: boolean;
  attendee_count: number;
  max_attendees?: number;
  is_featured: boolean;
  image_url?: string;
  banner_url?: string; // banner image!
  registration_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string; // Add creator id reference for linking to profile
  creator_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }
}
