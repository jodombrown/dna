/**
 * DNA Profile v2 Types
 * Type definitions for the Diaspora Impact Dashboard
 */

export type VerificationStatus = 'pending_verification' | 'soft_verified' | 'fully_verified';

export interface ProfileV2Bundle {
  profile: ProfileV2Data;
  tags: ProfileV2Tags;
  activity: ProfileV2Activity;
  permissions: ProfileV2Permissions;
  visibility: ProfileV2Visibility;
  completion: ProfileV2Completion;
  verification_meta: ProfileV2VerificationMeta;
}

export interface ProfileV2Data {
  id: string;
  user_id?: string; // legacy alias
  username: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  headline: string | null;
  professional_role: string | null;
  company: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  banner_type?: 'gradient' | 'solid' | 'image';
  banner_gradient?: string;
  banner_overlay?: boolean;
  current_country: string | null;
  current_city?: string | null;
  location: string | null;
  country_of_origin: string | null;
  diaspora_origin: string | null;
  bio: string | null;
  profession: string | null;
  industry: string | null;
  years_experience: number | null;
  languages?: string[] | null;
  verification_status: VerificationStatus;
  verification_updated_at?: string | null;
  created_at?: string;
  // Diaspora connection fields
  diaspora_status?: string | null;
  ethnic_heritage?: string[] | null;
  african_causes?: string[] | null;
  engagement_intentions?: string[] | null;
  return_intentions?: string | null;
  africa_visit_frequency?: string | null;
  diaspora_networks?: string[] | null;
  mentorship_areas?: string[] | null;
}

export interface ProfileV2Tags {
  // Primary array fields (used by profile view components)
  skills?: string[];
  interests?: string[];
  impact_areas?: string[];
  available_for?: string[];
  // Additional discovery tags
  focus_areas?: string[];
  regional_expertise?: string[];
  industries?: string[];
  professional_sectors?: string[];
  mentorship_areas?: string[];
  diaspora_networks?: string[];
  // Legacy tag fields for backward compatibility
  skill_tags?: any[];
  interest_tags?: any[];
  contribution_tags?: any[];
  sector_tags?: any[];
  diaspora_tags?: any[];
  region_tags?: any[];
  language_tags?: any[];
}

export interface ProfileV2Activity {
  spaces: Array<{
    id: string;
    title: string;
    role: 'creator' | 'member' | string;
  }>;
  events: Array<{
    id: string;
    title: string;
    role: 'host' | 'attendee' | string;
    event_date: string;
  }>;
  connections_count?: number;
  stories_count?: number;
  contributions_count?: number;
}

export interface ProfileV2Permissions {
  is_owner: boolean;
  can_edit: boolean;
  can_create_events: boolean;
  can_create_public_spaces: boolean;
  can_connect?: boolean;
}

export interface ProfileV2Visibility {
  about?: 'public' | 'hidden';
  skills?: 'public' | 'hidden';
  interests?: 'public' | 'hidden';
  activity?: 'public' | 'hidden';
  show_about?: boolean;
  show_skills?: boolean;
  show_interests?: boolean;
  show_activity?: boolean;
}

export interface ProfileV2Completion {
  score: number;
  suggested_actions: string[];
}

export interface ProfileV2VerificationMeta {
  tier?: VerificationStatus | 'pending' | 'soft' | 'full';
  status?: VerificationStatus;
  updated_at?: string | null;
  improvement_suggestions?: string[];
}
