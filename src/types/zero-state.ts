/**
 * Zero State Types
 *
 * Type definitions for the Zero State experience for new users.
 * Used by the Discovery Feed and related components.
 */

/**
 * Trending story from the community feed
 */
export interface TrendingStory {
  id: string;
  title: string | null;
  excerpt: string | null;
  author_name: string | null;
  author_avatar: string | null;
  engagement_count: number;
  created_at: string;
  cover_image: string | null;
}

/**
 * Upcoming event in the community
 */
export interface UpcomingEvent {
  id: string;
  title: string;
  start_date: string;
  location: string | null;
  cover_image: string | null;
  attendee_count: number;
  event_type: string | null;
}

/**
 * Suggested connection based on user profile matching
 */
export interface SuggestedConnection {
  id: string;
  display_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  country_of_origin: string | null;
  industry: string | null;
  match_reasons: string[] | null;
}

/**
 * Popular collaboration space
 */
export interface PopularSpace {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  active_task_count: number;
  is_open: boolean;
  cover_image: string | null;
}

/**
 * Marketplace opportunity matching user skills
 */
export interface MarketplaceHighlight {
  id: string;
  title: string;
  description: string | null;
  contribution_type: string | null;
  skills_needed: string[] | null;
  skills_match_count: number;
  created_at: string;
}

/**
 * Complete Zero State feed response from RPC
 */
export interface ZeroStateFeed {
  user_action_count: number;
  show_welcome_card: boolean;
  show_discovery_feed: boolean;
  trending_stories: TrendingStory[];
  upcoming_events: UpcomingEvent[];
  suggested_connections: SuggestedConnection[];
  popular_spaces: PopularSpace[];
  marketplace_highlights: MarketplaceHighlight[];
  generated_at: string;
}

/**
 * Conditions for determining zero state display
 */
export interface ZeroStateConditions {
  /** Total user actions (connections + RSVPs + posts + contributions) */
  totalActions: number;
  /** Show welcome card for < 3 actions */
  showWelcomeCard: boolean;
  /** Show discovery feed for < 10 actions */
  showDiscoveryFeed: boolean;
  /** Transition to normal activity stream at 10+ actions */
  transitionToActivityStream: boolean;
}
