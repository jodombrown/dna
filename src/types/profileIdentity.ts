/**
 * DNA | Profile & Identity — Type System
 *
 * The Profile is not a settings page — it's the user's identity across all
 * Five C's. It's the single place where someone's connections, events, spaces,
 * opportunities, and stories come together to tell the story of their
 * diaspora engagement.
 *
 * Profile is DIA's richest data source for personalization.
 */

import type { FiveCModule, SubscriptionTier, ProfileField } from './dia';

// =====================================================
// PROFILE STRUCTURE
// =====================================================

/**
 * Complete profile as rendered on the profile page.
 * This is the canonical structure — the database `profiles` table
 * is the source of truth, but the profile VIEW assembles data
 * from across the Five C's.
 */
export interface ProfileView {
  // Core identity
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  headline: string | null;
  bio: string | null;

  // Location & heritage
  location: string | null;
  diaspora_region: string | null;
  heritage_country: string | null;

  // Professional
  skills: string[];
  interests: string[];
  languages: string[];
  profession: string | null;
  company: string | null;
  education: string | null;
  years_experience: number | null;

  // Platform status
  verification_badge: boolean;
  tier: SubscriptionTier;
  tier_badge_visible: boolean;

  // Social metrics
  connection_count: number;
  mutual_connection_count: number;
  follower_count: number;

  // Profile completeness
  completeness_score: number;

  // Action state (for the viewer)
  viewer_connection_status: ConnectionStatus;
  viewer_can_message: boolean;

  // Five C's tab data (loaded on demand)
  five_c_tabs: FiveCTabData;

  // DIA Impact Snapshot
  impact_snapshot: ImpactSnapshot | null;

  // Activity
  recent_activity: ProfileActivity[];

  // Privacy settings applied
  privacy: ProfilePrivacySettings;
}

export type ConnectionStatus =
  | 'self'
  | 'connected'
  | 'pending_sent'
  | 'pending_received'
  | 'not_connected';

// =====================================================
// FIVE C's TABS
// =====================================================

/**
 * The Five C's tabs are the cross-C hub on every profile.
 * Each tab shows the user's activity within that C.
 */
export interface FiveCTabData {
  connect: ConnectTabData;
  convene: ConveneTabData;
  collaborate: CollaborateTabData;
  contribute: ContributeTabData;
  convey: ConveyTabData;
}

export interface ConnectTabData {
  connections: ProfileConnection[];
  mutual_connections: ProfileConnection[];
  total_count: number;
  network_regions: string[];
}

export interface ProfileConnection {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  is_mutual: boolean;
}

export interface ConveneTabData {
  events_hosted: ProfileEvent[];
  events_attended: ProfileEvent[];
  upcoming_rsvps: ProfileEvent[];
  total_hosted: number;
  total_attended: number;
}

export interface ProfileEvent {
  event_id: string;
  title: string;
  date: string;
  location: string | null;
  role: 'host' | 'cohost' | 'attendee';
  is_upcoming: boolean;
}

export interface CollaborateTabData {
  active_spaces: ProfileSpace[];
  completed_projects: ProfileSpace[];
  total_spaces: number;
}

export interface ProfileSpace {
  space_id: string;
  title: string;
  role: string;
  status: 'active' | 'completed' | 'archived';
  member_count: number;
}

export interface ContributeTabData {
  opportunities_posted: ProfileOpportunity[];
  fulfilled_matches: ProfileOpportunity[];
  total_posted: number;
  total_fulfilled: number;
}

export interface ProfileOpportunity {
  opportunity_id: string;
  title: string;
  type: string;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
}

export interface ConveyTabData {
  stories_published: ProfileStory[];
  content_series: ProfileSeries[];
  total_stories: number;
  total_engagement: number; // Sum of all engagement across stories
}

export interface ProfileStory {
  post_id: string;
  title: string | null;
  preview: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface ProfileSeries {
  series_id: string;
  title: string;
  story_count: number;
}

// =====================================================
// DIA IMPACT SNAPSHOT
// =====================================================

/**
 * DIA-generated impact snapshot shown on profile.
 * Aggregates engagement across all Five C's.
 */
export interface ImpactSnapshot {
  connected_across_countries: number;
  events_attended: number;
  events_hosted: number;
  active_spaces: number;
  opportunities_posted: number;
  stories_published: number;
  total_readers_reached: number;
  network_strength_score: number; // 0-100
  top_skills: string[];
  top_regions: string[];
  generated_at: string;
}

// =====================================================
// PROFILE PRIVACY
// =====================================================

/**
 * Profile privacy settings.
 * Each field has a visibility level the user controls.
 */
export interface ProfilePrivacySettings {
  bio_visibility: ProfileVisibility;
  skills_visibility: ProfileVisibility;
  location_visibility: LocationVisibility;
  connections_visibility: ProfileVisibility;
  activity_feed_visibility: ProfileVisibility;
  events_visibility: ProfileVisibility;
  impact_visibility: ProfileVisibility;
}

export type ProfileVisibility = 'public' | 'connections_only' | 'hidden';
export type LocationVisibility = 'public' | 'region_only' | 'hidden';

/** Default privacy settings for new users */
export const DEFAULT_PRIVACY_SETTINGS: ProfilePrivacySettings = {
  bio_visibility: 'public',
  skills_visibility: 'public',
  location_visibility: 'public',
  connections_visibility: 'connections_only',
  activity_feed_visibility: 'connections_only',
  events_visibility: 'public',
  impact_visibility: 'public',
};

// =====================================================
// PROFILE COMPLETION JOURNEY
// =====================================================

/**
 * Profile completion triggers — DIA generates nudges when these conditions are met.
 * This is progressive completion, not a checklist.
 */
export interface CompletionTrigger {
  trigger_action: string;
  source_module: FiveCModule;
  missing_field: ProfileField;
  nudge_title: string;
  nudge_message: string;
  value_proposition: string;
}

/** The completion journey triggers from the architecture document */
export const COMPLETION_JOURNEY: CompletionTrigger[] = [
  {
    trigger_action: 'browse_opportunities',
    source_module: 'contribute',
    missing_field: 'skills',
    nudge_title: 'Add your skills to see match scores',
    nudge_message: 'Skills help DIA find the best opportunity matches for you.',
    value_proposition: 'Immediate value - better matches',
  },
  {
    trigger_action: 'attend_first_event',
    source_module: 'convene',
    missing_field: 'location',
    nudge_title: 'Add your location for local event recommendations',
    nudge_message: 'Share your location to discover more events nearby.',
    value_proposition: 'Better event discovery',
  },
  {
    trigger_action: 'make_5_connections',
    source_module: 'connect',
    missing_field: 'headline',
    nudge_title: 'Add a headline so connections know what you do',
    nudge_message: 'A headline helps new connections understand your expertise.',
    value_proposition: 'Social proof',
  },
  {
    trigger_action: 'create_first_space',
    source_module: 'collaborate',
    missing_field: 'professional_background',
    nudge_title: 'Add your professional background for credibility',
    nudge_message: 'Your background builds trust with potential collaborators.',
    value_proposition: 'Team recruitment',
  },
  {
    trigger_action: 'publish_first_story',
    source_module: 'convey',
    missing_field: 'interests',
    nudge_title: 'Add your interests to grow your audience',
    nudge_message: 'Interests help DIA recommend your content to the right readers.',
    value_proposition: 'Content discoverability',
  },
];

// =====================================================
// PROFILE ACTIVITY
// =====================================================

export interface ProfileActivity {
  activity_id: string;
  activity_type: ProfileActivityType;
  module: FiveCModule;
  title: string;
  description: string;
  entity_id: string;
  entity_url: string;
  created_at: string;
}

export type ProfileActivityType =
  | 'post_created'
  | 'event_hosted'
  | 'event_attended'
  | 'space_joined'
  | 'opportunity_posted'
  | 'connection_made'
  | 'milestone_reached';

// =====================================================
// PROFILE TIER FEATURES
// =====================================================

export interface ProfileTierFeatures {
  tier: SubscriptionTier;
  verification_badge: boolean;
  profile_analytics: boolean;
  enhanced_search_visibility: boolean;
  custom_profile_url: boolean;
  impact_snapshot: 'basic' | 'full' | 'team_dashboard';
  featured_placement: boolean | 'periodic' | 'branded';
}

export const PROFILE_TIER_FEATURES: Record<SubscriptionTier, ProfileTierFeatures> = {
  free: {
    tier: 'free',
    verification_badge: false,
    profile_analytics: false,
    enhanced_search_visibility: false,
    custom_profile_url: false,
    impact_snapshot: 'basic',
    featured_placement: false,
  },
  pro: {
    tier: 'pro',
    verification_badge: true,
    profile_analytics: true,
    enhanced_search_visibility: true,
    custom_profile_url: true,
    impact_snapshot: 'full',
    featured_placement: 'periodic',
  },
  org: {
    tier: 'org',
    verification_badge: true,
    profile_analytics: true,
    enhanced_search_visibility: true,
    custom_profile_url: true,
    impact_snapshot: 'team_dashboard',
    featured_placement: 'branded',
  },
};
