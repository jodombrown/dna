export type EventType = 
  | 'conference'
  | 'workshop'
  | 'meetup'
  | 'webinar'
  | 'networking'
  | 'social'
  | 'other';

export type EventFormat = 'in_person' | 'virtual' | 'hybrid';

export type RsvpStatus = 'going' | 'maybe' | 'not_going' | 'pending' | 'waitlist';

export interface Event {
  id: string;
  organizer_id: string;
  group_id?: string;
  title: string;
  description: string;
  event_type: EventType;
  format: EventFormat;
  
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  
  meeting_url?: string;
  meeting_platform?: string;
  
  start_time: string;
  end_time: string;
  timezone: string;
  
  max_attendees?: number;
  cover_image_url?: string;
  
  is_public: boolean;
  requires_approval: boolean;
  allow_guests: boolean;
  
  is_cancelled: boolean;
  cancellation_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EventWithOrganizer extends Event {
  organizer_username: string;
  organizer_full_name: string;
  organizer_avatar_url?: string;
  organizer_headline?: string;
  attendee_count: number;
  going_count: number;
  maybe_count: number;
  user_rsvp_status?: RsvpStatus;
  is_organizer: boolean;
  can_edit: boolean;
}

export interface EventListItem {
  event_id: string;
  organizer_id: string;
  organizer_username: string;
  organizer_full_name: string;
  organizer_avatar_url?: string;
  title: string;
  description: string;
  event_type: EventType;
  format: EventFormat;
  location_name?: string;
  location_city?: string;
  location_country?: string;
  meeting_url?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  max_attendees?: number;
  cover_image_url?: string;
  is_public: boolean;
  requires_approval: boolean;
  created_at: string;
  attendee_count: number;
  user_rsvp_status?: RsvpStatus;
  is_organizer: boolean;
}

export interface EventAttendee {
  attendee_id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  status: RsvpStatus;
  response_note?: string;
  checked_in: boolean;
  created_at: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  event_type: EventType;
  format: EventFormat;
  
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  
  meeting_url?: string;
  meeting_platform?: string;
  
  start_time: string;
  end_time: string;
  timezone: string;
  
  max_attendees?: number;
  cover_image_url?: string;
  
  is_public: boolean;
  requires_approval: boolean;
  allow_guests: boolean;
}
