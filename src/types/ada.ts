/**
 * DNA | ADA (Adaptive Dashboard Architecture) — Type System
 *
 * ADA is DNA's approach to navigation. Instead of traditional page-by-page
 * routing, DNA presents as a single persistent environment that adapts to
 * user intent. The user stays "inside" DNA — the layout transforms, not the page.
 *
 * This extends the existing ViewStateContext with the complete ADA model
 * from the architecture document.
 */

import type { FiveCModule, SubscriptionTier } from './dia';

// =====================================================
// ADA VIEW STATES
// =====================================================

/** Complete ADA view state enum matching the architecture document */
export type ADAViewState =
  | 'dashboard'       // Universal Feed + DIA Insights + Trending
  | 'connect_hub'     // People Discovery + Filters | Connect Feed | Profile Preview
  | 'convene_hub'     // Event Calendar + Filters | Event Listings | Event Detail Preview
  | 'collaborate_hub' // Space List + Activity | Space Feed / Board View | Task Detail
  | 'contribute_hub'  // Opportunity Filters | Opportunity Listings | Opportunity Detail + Match
  | 'convey_hub'      // Topics + Following | Story Feed | Story Reader
  | 'profile_view'    // Full Profile | Activity + Impact
  | 'messaging'       // Conversation List | Active Thread | Participant Info
  | 'dia_chat'        // DIA Conversation | Related Content + Actions
  | 'notifications'   // Notification Center (full view)
  | 'settings'        // User Settings
  | 'detail_focus';   // Single entity detail (event, space, story, profile)

// =====================================================
// ADA PANEL CONFIGURATION
// =====================================================

/** What each panel shows in a given view state */
export interface ADAPanelConfig {
  viewState: ADAViewState;

  // Left panel
  left: PanelDefinition;

  // Center panel (primary content)
  center: PanelDefinition;

  // Right panel (context/detail)
  right: PanelDefinition;

  // Mobile behavior
  mobile: MobilePanelBehavior;
}

export interface PanelDefinition {
  visible: boolean;
  width: string; // CSS width or percentage
  content: PanelContentType;
  scrollable: boolean;
}

export type PanelContentType =
  | 'navigation'
  | 'discovery'
  | 'feed'
  | 'detail'
  | 'context'
  | 'filters'
  | 'list'
  | 'conversation'
  | 'empty';

export interface MobilePanelBehavior {
  default_panel: 'left' | 'center' | 'right';
  swipe_enabled: boolean;
  pull_down_dia: boolean;
}

// =====================================================
// VIEW STATE → PANEL MAPPING
// =====================================================

/** Complete panel configuration for every ADA view state */
export const ADA_PANEL_CONFIGS: Record<ADAViewState, ADAPanelConfig> = {
  dashboard: {
    viewState: 'dashboard',
    left: { visible: true, width: '25%', content: 'navigation', scrollable: false },
    center: { visible: true, width: '50%', content: 'feed', scrollable: true },
    right: { visible: true, width: '25%', content: 'context', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: true },
  },
  connect_hub: {
    viewState: 'connect_hub',
    left: { visible: true, width: '25%', content: 'discovery', scrollable: true },
    center: { visible: true, width: '50%', content: 'feed', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: true },
  },
  convene_hub: {
    viewState: 'convene_hub',
    left: { visible: true, width: '25%', content: 'filters', scrollable: true },
    center: { visible: true, width: '50%', content: 'list', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: true },
  },
  collaborate_hub: {
    viewState: 'collaborate_hub',
    left: { visible: true, width: '20%', content: 'list', scrollable: true },
    center: { visible: true, width: '55%', content: 'feed', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: false },
  },
  contribute_hub: {
    viewState: 'contribute_hub',
    left: { visible: true, width: '25%', content: 'filters', scrollable: true },
    center: { visible: true, width: '50%', content: 'list', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: true },
  },
  convey_hub: {
    viewState: 'convey_hub',
    left: { visible: true, width: '20%', content: 'navigation', scrollable: true },
    center: { visible: true, width: '55%', content: 'feed', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: true, pull_down_dia: true },
  },
  profile_view: {
    viewState: 'profile_view',
    left: { visible: false, width: '0', content: 'empty', scrollable: false },
    center: { visible: true, width: '70%', content: 'detail', scrollable: true },
    right: { visible: true, width: '30%', content: 'context', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: false, pull_down_dia: false },
  },
  messaging: {
    viewState: 'messaging',
    left: { visible: true, width: '35%', content: 'list', scrollable: true },
    center: { visible: true, width: '40%', content: 'conversation', scrollable: true },
    right: { visible: true, width: '25%', content: 'detail', scrollable: true },
    mobile: { default_panel: 'left', swipe_enabled: true, pull_down_dia: false },
  },
  dia_chat: {
    viewState: 'dia_chat',
    left: { visible: false, width: '0', content: 'empty', scrollable: false },
    center: { visible: true, width: '60%', content: 'conversation', scrollable: true },
    right: { visible: true, width: '40%', content: 'context', scrollable: true },
    mobile: { default_panel: 'center', swipe_enabled: false, pull_down_dia: false },
  },
  notifications: {
    viewState: 'notifications',
    left: { visible: false, width: '0', content: 'empty', scrollable: false },
    center: { visible: true, width: '100%', content: 'list', scrollable: true },
    right: { visible: false, width: '0', content: 'empty', scrollable: false },
    mobile: { default_panel: 'center', swipe_enabled: false, pull_down_dia: false },
  },
  settings: {
    viewState: 'settings',
    left: { visible: true, width: '25%', content: 'navigation', scrollable: false },
    center: { visible: true, width: '75%', content: 'detail', scrollable: true },
    right: { visible: false, width: '0', content: 'empty', scrollable: false },
    mobile: { default_panel: 'center', swipe_enabled: false, pull_down_dia: false },
  },
  detail_focus: {
    viewState: 'detail_focus',
    left: { visible: false, width: '0', content: 'empty', scrollable: false },
    center: { visible: true, width: '100%', content: 'detail', scrollable: true },
    right: { visible: false, width: '0', content: 'empty', scrollable: false },
    mobile: { default_panel: 'center', swipe_enabled: false, pull_down_dia: false },
  },
};

// =====================================================
// ROUTE ARCHITECTURE
// =====================================================

/**
 * Complete route architecture from the architecture document.
 * Every piece of content has a shareable URL that resolves correctly.
 */
export const ADA_ROUTES = {
  // Dashboard
  home: '/',
  dashboard: '/dna/feed',

  // Five C Hubs
  connect: '/dna/connect',
  connectProfile: (userId: string) => `/dna/connect/${userId}` as const,

  convene: '/dna/convene',
  conveneEvent: (eventId: string) => `/dna/convene/events/${eventId}` as const,

  collaborate: '/dna/collaborate',
  collaborateSpace: (spaceId: string) => `/dna/collaborate/spaces/${spaceId}` as const,
  collaborateSpaceTasks: (spaceId: string) => `/dna/collaborate/spaces/${spaceId}/tasks` as const,

  contribute: '/dna/contribute',
  contributeOpportunity: (opportunityId: string) => `/dna/contribute/${opportunityId}` as const,

  convey: '/dna/convey',
  conveyStory: (storyId: string) => `/dna/convey/stories/${storyId}` as const,

  // Messaging
  messages: '/dna/messages',
  messagesConversation: (conversationId: string) => `/dna/messages/${conversationId}` as const,

  // DIA
  dia: '/dna/dia',

  // Notifications
  notifications: '/dna/notifications',

  // Settings
  settings: '/dna/settings',

  // Profile
  profile: '/dna/me',
  publicProfile: (username: string) => `/dna/${username}` as const,
} as const;

// =====================================================
// MOBILE NAVIGATION
// =====================================================

/** Mobile bottom tab bar configuration */
export interface MobileTabItem {
  id: FiveCModule | 'home';
  label: string;
  icon: string; // Lucide icon name
  route: string;
  accent_color: string; // CSS variable name
  badge_count_key?: string; // Key in notification counts
}

export const MOBILE_TAB_BAR: MobileTabItem[] = [
  { id: 'home', label: 'Home', icon: 'Home', route: '/dna/feed', accent_color: '--dna-emerald' },
  { id: 'connect', label: 'Connect', icon: 'Users', route: '/dna/connect', accent_color: '--dna-emerald' },
  { id: 'convene', label: 'Convene', icon: 'Calendar', route: '/dna/convene', accent_color: '--dna-gold' },
  { id: 'collaborate', label: 'Collab', icon: 'Wrench', route: '/dna/collaborate', accent_color: '--dna-forest' },
  { id: 'contribute', label: 'Contrib', icon: 'HandHeart', route: '/dna/contribute', accent_color: '--dna-copper' },
  { id: 'convey', label: 'Convey', icon: 'BookOpen', route: '/dna/convey', accent_color: '--dna-ocean' },
];

/** Composer FAB pre-selects mode based on current view */
export const FAB_CONTEXT_MODE: Record<ADAViewState, string | null> = {
  dashboard: null,       // Default composer
  connect_hub: null,
  convene_hub: 'event',
  collaborate_hub: 'space',
  contribute_hub: 'need',
  convey_hub: 'story',
  profile_view: null,
  messaging: null,
  dia_chat: null,
  notifications: null,
  settings: null,
  detail_focus: null,
};

// =====================================================
// NAVIGATION INTELLIGENCE (DIA)
// =====================================================

/** DIA-powered navigation features */
export interface NavigationIntelligence {
  /** Adaptive tab order based on user's most-used modules (opt-in) */
  adaptive_tab_order: boolean;

  /** Smart home content adapts based on time of day */
  time_of_day_adaptation: boolean;

  /** Per-module notification badge counts, DIA-prioritized */
  badge_counts: Record<FiveCModule, number>;
}

/** DIA navigation tier features */
export interface NavigationTierFeatures {
  tier: SubscriptionTier;
  custom_dashboard_layout: boolean;
  adaptive_tab_ordering: boolean;
  branded_sidebar: boolean;
  custom_nav_sections: boolean;
}

export const NAVIGATION_TIER_FEATURES: Record<SubscriptionTier, NavigationTierFeatures> = {
  free: {
    tier: 'free',
    custom_dashboard_layout: false,
    adaptive_tab_ordering: false,
    branded_sidebar: false,
    custom_nav_sections: false,
  },
  pro: {
    tier: 'pro',
    custom_dashboard_layout: true,
    adaptive_tab_ordering: true,
    branded_sidebar: false,
    custom_nav_sections: false,
  },
  org: {
    tier: 'org',
    custom_dashboard_layout: true,
    adaptive_tab_ordering: true,
    branded_sidebar: true,
    custom_nav_sections: true,
  },
};
