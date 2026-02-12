/**
 * DNA | FEED - Configuration Constants
 *
 * Card configs, engagement bars, layout constants, tier configs,
 * empty states, scroll config, and interaction patterns.
 */

import {
  FeedType,
  FeedSortMode,
  UserTier,
  type FeedCardConfig,
  type FeedContentType,
  type EngagementAction,
  type FeedTierConfig,
  type RankingWeights,
} from '@/types/feedTypes';

// ============================================================
// CARD CONFIGURATIONS
// ============================================================

export const FEED_CARD_CONFIGS: Record<FeedContentType, FeedCardConfig> = {
  post: {
    contentType: 'post',
    accentColor: '#4A8D77',
    leftBorderWidth: 3,
    showCoverImage: false,
    coverImageAspectRatio: '16:9',
    showAuthorHeader: true,
    primaryCTA: { label: 'Comment', variant: 'ghost', action: 'navigate' },
    maxBodyPreviewLength: 500,
    culturalAccent: 'none',
  },
  story: {
    contentType: 'story',
    accentColor: '#2A7A8C',
    leftBorderWidth: 3,
    showCoverImage: true,
    coverImageAspectRatio: '16:9',
    showAuthorHeader: true,
    primaryCTA: { label: 'Read', variant: 'primary', action: 'navigate' },
    maxBodyPreviewLength: 160,
    culturalAccent: 'kente_border',
  },
  event: {
    contentType: 'event',
    accentColor: '#C4942A',
    leftBorderWidth: 4,
    showCoverImage: true,
    coverImageAspectRatio: '3:2',
    showAuthorHeader: true,
    primaryCTA: { label: 'RSVP', variant: 'primary', action: 'inline' },
    maxBodyPreviewLength: 200,
    culturalAccent: 'adinkra_icon',
  },
  space: {
    contentType: 'space',
    accentColor: '#2D5A3D',
    leftBorderWidth: 4,
    showCoverImage: false,
    coverImageAspectRatio: '3:2',
    showAuthorHeader: true,
    primaryCTA: { label: 'Join', variant: 'primary', action: 'inline' },
    maxBodyPreviewLength: 200,
    culturalAccent: 'ndebele_pattern',
  },
  opportunity: {
    contentType: 'opportunity',
    accentColor: '#B87333',
    leftBorderWidth: 4,
    showCoverImage: false,
    coverImageAspectRatio: '1:1',
    showAuthorHeader: true,
    primaryCTA: { label: 'Express Interest', variant: 'primary', action: 'modal' },
    maxBodyPreviewLength: 250,
    culturalAccent: 'mudcloth_bg',
  },
  dia_insight: {
    contentType: 'dia_insight',
    accentColor: '#C4942A',
    leftBorderWidth: 0,
    showCoverImage: false,
    coverImageAspectRatio: '1:1',
    showAuthorHeader: false,
    primaryCTA: { label: 'Take Action', variant: 'primary', action: 'navigate' },
    maxBodyPreviewLength: 200,
    culturalAccent: 'adinkra_icon',
  },
  milestone: {
    contentType: 'milestone',
    accentColor: '#C4942A',
    leftBorderWidth: 0,
    showCoverImage: false,
    coverImageAspectRatio: '1:1',
    showAuthorHeader: true,
    primaryCTA: { label: 'Celebrate', variant: 'primary', action: 'inline' },
    maxBodyPreviewLength: 150,
    culturalAccent: 'kente_border',
  },
  activity: {
    contentType: 'activity',
    accentColor: '#4A8D77',
    leftBorderWidth: 2,
    showCoverImage: false,
    coverImageAspectRatio: '1:1',
    showAuthorHeader: false,
    primaryCTA: { label: 'View', variant: 'ghost', action: 'navigate' },
    maxBodyPreviewLength: 100,
    culturalAccent: 'none',
  },
};

// ============================================================
// ENGAGEMENT BAR CONFIGURATIONS
// ============================================================

export const STANDARD_ENGAGEMENT: EngagementAction[] = [
  { type: 'like', icon: 'Heart', activeIcon: 'Heart', activeColor: '#C4942A', countVisible: true, label: 'Like' },
  { type: 'comment', icon: 'MessageCircle', activeIcon: 'MessageCircle', activeColor: '#4A8D77', countVisible: true, label: 'Comment' },
  { type: 'reshare', icon: 'Repeat2', activeIcon: 'Repeat2', activeColor: '#2A7A8C', countVisible: true, label: 'Reshare' },
  { type: 'bookmark', icon: 'Bookmark', activeIcon: 'Bookmark', activeColor: '#B87333', countVisible: false, label: 'Save' },
];

export const EVENT_ENGAGEMENT: EngagementAction[] = [
  { type: 'rsvp', icon: 'CalendarPlus', activeIcon: 'CalendarCheck', activeColor: '#C4942A', countVisible: true, label: 'RSVP' },
  { type: 'comment', icon: 'MessageCircle', activeIcon: 'MessageCircle', activeColor: '#4A8D77', countVisible: true, label: 'Comment' },
  { type: 'reshare', icon: 'Repeat2', activeIcon: 'Repeat2', activeColor: '#2A7A8C', countVisible: true, label: 'Share' },
  { type: 'bookmark', icon: 'Bookmark', activeIcon: 'Bookmark', activeColor: '#B87333', countVisible: false, label: 'Save' },
];

export const SPACE_ENGAGEMENT: EngagementAction[] = [
  { type: 'join', icon: 'UserPlus', activeIcon: 'UserCheck', activeColor: '#2D5A3D', countVisible: true, label: 'Join' },
  { type: 'comment', icon: 'MessageCircle', activeIcon: 'MessageCircle', activeColor: '#4A8D77', countVisible: true, label: 'Discuss' },
  { type: 'reshare', icon: 'Repeat2', activeIcon: 'Repeat2', activeColor: '#2A7A8C', countVisible: true, label: 'Share' },
  { type: 'bookmark', icon: 'Bookmark', activeIcon: 'Bookmark', activeColor: '#B87333', countVisible: false, label: 'Save' },
];

export const OPPORTUNITY_ENGAGEMENT: EngagementAction[] = [
  { type: 'interest', icon: 'HandMetal', activeIcon: 'HandMetal', activeColor: '#B87333', countVisible: true, label: 'Express Interest' },
  { type: 'comment', icon: 'MessageCircle', activeIcon: 'MessageCircle', activeColor: '#4A8D77', countVisible: true, label: 'Ask Question' },
  { type: 'reshare', icon: 'Repeat2', activeIcon: 'Repeat2', activeColor: '#2A7A8C', countVisible: true, label: 'Share' },
  { type: 'bookmark', icon: 'Bookmark', activeIcon: 'Bookmark', activeColor: '#B87333', countVisible: false, label: 'Save' },
];

export function getEngagementConfig(contentType: FeedContentType): EngagementAction[] {
  switch (contentType) {
    case 'event':
      return EVENT_ENGAGEMENT;
    case 'space':
      return SPACE_ENGAGEMENT;
    case 'opportunity':
      return OPPORTUNITY_ENGAGEMENT;
    default:
      return STANDARD_ENGAGEMENT;
  }
}

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

export const FEED_LAYOUT = {
  cardMarginHorizontal: 0,
  cardMarginVertical: 8,
  cardPaddingHorizontal: 16,
  cardPaddingVertical: 16,
  cardBorderRadius: 0,
  cardBorderRadiusDesktop: 12,

  authorAvatarSize: 44,
  authorAvatarSizeCompact: 32,
  authorNameFontSize: 15,
  authorHeadlineFontSize: 13,
  authorTimestampFontSize: 12,

  bodyFontSize: 15,
  bodyLineHeight: 1.5,

  coverImageMaxHeight: 300,
  coverImageMaxHeightDesktop: 400,

  engagementBarHeight: 44,
  engagementIconSize: 20,
  engagementCountFontSize: 13,

  ctaButtonHeight: 40,
  ctaButtonFontSize: 14,

  diaCardGradientBorderWidth: 2,
  diaCardBackgroundOpacity: 0.03,

  moduleIndicatorDotSize: 8,
  moduleIndicatorFontSize: 11,

  sectionSpacing: 12,
} as const;

// ============================================================
// SCROLL CONFIGURATION
// ============================================================

export const FEED_SCROLL_CONFIG = {
  loadThreshold: 3,
  pageSize: 20,
  initialLoadSize: 15,
  newItemBannerThreshold: 1,
  bannerText: (count: number) => `${count} new ${count === 1 ? 'update' : 'updates'}`,
  bannerAutoHideMs: 5000,
  pullToRefreshEnabled: true,
  pullDistance: 80,
  saveScrollPosition: true,
  restoreOnReturn: true,
  virtualizeItems: true,
  overscan: 5,
  estimatedItemHeight: 280,
} as const;

// ============================================================
// INTERACTION PATTERNS
// ============================================================

export const FEED_INTERACTIONS = {
  cardTap: 'navigate_to_detail' as const,
  ctaTap: 'inline_action' as const,
  longPressMs: 500,
  longPressActions: [
    'save',
    'share',
    'mute_author',
    'report',
    'show_fewer_like_this',
  ] as const,
  swipeEnabled: false,
  doubleTapToLike: true,
  likeAnimation: 'emerald_pulse' as const,
  hapticFeedback: true,
} as const;

// ============================================================
// RANKING WEIGHTS
// ============================================================

export const FOR_YOU_WEIGHTS: RankingWeights = {
  connectionStrength: 0.20,
  cModuleDiversity: 0.18,
  skillMatch: 0.15,
  regionalRelevance: 0.12,
  engagementVelocity: 0.12,
  freshness: 0.10,
  creatorRelationship: 0.08,
  contentQuality: 0.05,
};

export const TRENDING_WEIGHTS: RankingWeights = {
  connectionStrength: 0.05,
  cModuleDiversity: 0.10,
  skillMatch: 0.05,
  regionalRelevance: 0.10,
  engagementVelocity: 0.40,
  freshness: 0.15,
  creatorRelationship: 0.05,
  contentQuality: 0.10,
};

export const PRO_VISIBILITY_MULTIPLIER = 1.15;
export const ORG_VISIBILITY_MULTIPLIER = 1.10;

// ============================================================
// TIER CONFIGURATION
// ============================================================

export const FEED_TIER_CONFIG: Record<string, FeedTierConfig> = {
  [UserTier.FREE]: {
    sortModes: [FeedSortMode.FOR_YOU, FeedSortMode.RECENT],
    maxFilters: 2,
    diaInsightsPerSession: 3,
    canSeeMatchScores: false,
    canSeeDetailedEngagement: false,
    feedRefreshCooldownMs: 30000,
    showUpgradePrompts: true,
  },
  [UserTier.PRO]: {
    sortModes: [FeedSortMode.FOR_YOU, FeedSortMode.RECENT, FeedSortMode.TRENDING],
    maxFilters: Infinity,
    diaInsightsPerSession: Infinity,
    canSeeMatchScores: true,
    canSeeDetailedEngagement: true,
    feedRefreshCooldownMs: 0,
    showUpgradePrompts: false,
  },
  [UserTier.ORG]: {
    sortModes: [FeedSortMode.FOR_YOU, FeedSortMode.RECENT, FeedSortMode.TRENDING],
    maxFilters: Infinity,
    diaInsightsPerSession: Infinity,
    canSeeMatchScores: true,
    canSeeDetailedEngagement: true,
    feedRefreshCooldownMs: 0,
    showUpgradePrompts: false,
  },
};

// ============================================================
// EMPTY STATES
// ============================================================

export const FEED_EMPTY_STATES: Record<FeedType, { headline: string; body: string; action: string }> = {
  [FeedType.UNIVERSAL]: {
    headline: 'Your diaspora journey begins here',
    body: 'Connect with people, attend events, and explore opportunities. As your network grows, your feed comes alive.',
    action: 'Discover People',
  },
  [FeedType.CONNECT]: {
    headline: 'Your network is waiting',
    body: 'The global diaspora is 200 million strong. Find the people building the Africa you believe in.',
    action: 'Find Connections',
  },
  [FeedType.CONVENE]: {
    headline: 'Your next gathering awaits',
    body: 'From Lagos to London to Los Angeles — the diaspora gathers to learn, celebrate, and build together.',
    action: 'Browse Events',
  },
  [FeedType.COLLABORATE]: {
    headline: 'Great things are built together',
    body: 'Spaces are where ideas become action. Join a project or start your own.',
    action: 'Explore Spaces',
  },
  [FeedType.CONTRIBUTE]: {
    headline: 'Every skill finds its purpose',
    body: "The diaspora's collective resources are vast. Find what you need. Offer what you can.",
    action: 'Browse Opportunities',
  },
  [FeedType.CONVEY]: {
    headline: 'Diaspora voices amplified',
    body: 'Stories, insights, and knowledge from the global African diaspora. Follow topics that matter to you.',
    action: 'Explore Stories',
  },
};

// ============================================================
// C-MODULE FEED MAPPING
// ============================================================

export const FEED_TYPE_TO_C_MODULE: Record<string, string> = {
  [FeedType.CONNECT]: 'CONNECT',
  [FeedType.CONVENE]: 'CONVENE',
  [FeedType.COLLABORATE]: 'COLLABORATE',
  [FeedType.CONTRIBUTE]: 'CONTRIBUTE',
  [FeedType.CONVEY]: 'CONVEY',
};

export const C_MODULE_LABELS: Record<string, string> = {
  CONNECT: 'Connect',
  CONVENE: 'Convene',
  COLLABORATE: 'Collaborate',
  CONTRIBUTE: 'Contribute',
  CONVEY: 'Convey',
};
