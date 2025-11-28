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
  user_id: string;
  username: string;
  full_name: string;
  headline: string | null;
  professional_role: string | null;
  company: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  current_country: string | null;
  location: string | null;
  country_of_origin: string | null;
  diaspora_origin: string | null;
  bio: string | null;
  profession: string | null;
  industry: string | null;
  years_experience: number | null;
  verification_status: VerificationStatus;
  verification_updated_at: string | null;
}

export interface ProfileV2Tags {
  skills: string[];
  interests: string[];
  impact_areas: string[];
  available_for: string[];
  diaspora_tags: any[];
  region_tags: any[];
  skill_tags: any[];
  contribution_tags: any[];
  interest_tags: any[];
}

export interface ProfileV2Activity {
  spaces: Array<{
    id: string;
    title: string;
    role: 'creator' | 'member';
  }>;
  events: Array<{
    id: string;
    title: string;
    role: 'host' | 'attendee';
    event_date: string;
  }>;
  connections_count: number;
}

export interface ProfileV2Permissions {
  is_owner: boolean;
  can_edit: boolean;
  can_create_events: boolean;
  can_create_public_spaces: boolean;
  can_connect: boolean;
}

export interface ProfileV2Visibility {
  about: 'public' | 'hidden';
  skills: 'public' | 'hidden';
  interests: 'public' | 'hidden';
  activity: 'public' | 'hidden';
}

export interface ProfileV2Completion {
  score: number;
  suggested_actions: string[];
}

export interface ProfileV2VerificationMeta {
  tier: VerificationStatus;
  updated_at: string | null;
  improvement_suggestions: string[];
}
