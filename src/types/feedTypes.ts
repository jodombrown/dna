/**
 * DNA | FEED - Intelligence Stream Type System (Phase 2)
 *
 * The Feed is DNA's intelligent, module-aware stream that surfaces
 * content from all Five C's. These types define the complete feed
 * architecture including ranking, DIA insights, and monetization.
 *
 * Builds on the existing feed.ts types and composer.ts enums.
 * Zero `any` types. All interfaces fully typed.
 */

import {
  CModule,
  ComposerMode,
  UserTier,
  EventType,
  SpaceType,
  SpaceVisibility,
  OpportunityDirection,
  OpportunityCategory,
  CompensationType,
  LocationRelevance,
  OpportunityDuration,
  TicketType,
  type MediaAttachment,
  type LinkPreview,
  type ContentContext,
  type PhysicalLocation,
  type SpaceTimeline,
  type StoryCallToAction,
  type CrossReference,
} from './composer';

// Re-export commonly used enums for convenience
export { CModule, UserTier };

// ============================================================
// FEED CONFIGURATION
// ============================================================

export enum FeedType {
  UNIVERSAL = 'universal',
  CONNECT = 'connect',
  CONVENE = 'convene',
  COLLABORATE = 'collaborate',
  CONTRIBUTE = 'contribute',
  CONVEY = 'convey',
}

export enum FeedSortMode {
  FOR_YOU = 'for_you',
  RECENT = 'recent',
  TRENDING = 'trending',
}

export interface FeedFilters {
  cModules?: CModule[];
  regionFilter?: string;
  connectionFilter?: ConnectionFilterType;
  eventType?: EventType;
  eventTimeframe?: EventTimeframe;
  spaceType?: SpaceType;
  opportunityDirection?: OpportunityDirection;
  opportunityCategory?: OpportunityCategory;
  storyTopic?: string;
  contentType?: FeedContentType;
}

export type ConnectionFilterType = 'all' | 'first_degree' | 'mutual' | 'following';

export type EventTimeframe = 'today' | 'this_week' | 'this_month' | 'upcoming';

export type FeedContentType =
  | 'post'
  | 'story'
  | 'event'
  | 'space'
  | 'opportunity'
  | 'dia_insight'
  | 'milestone'
  | 'activity';

// ============================================================
// FEED ITEMS
// ============================================================

export interface FeedItem {
  id: string;
  type: FeedContentType;
  contentId: string;
  primaryC: CModule;
  secondaryCs: CModule[];
  createdBy: FeedAuthor;
  createdAt: Date;
  updatedAt: Date;
  relevanceScore: number;
  rankingSignals: RankingSignals;
  content:
    | PostFeedContent
    | StoryFeedContent
    | EventFeedContent
    | SpaceFeedContent
    | OpportunityFeedContent
    | DIAInsightFeedContent
    | MilestoneFeedContent
    | ActivityFeedContent;
  engagement: FeedEngagement;
  crossReferences: CrossReference[];
  isPro: boolean;
  isPromoted: boolean;
}

export interface FeedAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string | null;
  isVerified: boolean;
  tier: UserTier;
  connectionDegree: number;
  mutualConnectionCount: number;
}

export interface FeedEngagement {
  likeCount: number;
  commentCount: number;
  reshareCount: number;
  bookmarkCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  isBookmarkedByMe: boolean;
  isResharedByMe: boolean;
  rsvpCount?: number;
  registrationCount?: number;
  memberCount?: number;
  interestCount?: number;
  readCount?: number;
}

export interface RankingSignals {
  connectionStrength: number;
  cModuleDiversity: number;
  skillMatch: number;
  regionalRelevance: number;
  engagementVelocity: number;
  freshness: number;
  creatorRelationship: number;
  contentQuality: number;
}

// ============================================================
// POST FEED CONTENT
// ============================================================

export interface PostFeedContent {
  type: 'post';
  body: string;
  bodyPreview: string;
  fullBodyLength: number;
  media: MediaAttachment[];
  poll: PollFeedData | null;
  linkPreview: LinkPreview | null;
  context: ContentContext | null;
  hashtags: string[];
  mentionedUsers: FeedAuthor[];
}

export interface PollFeedData {
  options: PollOption[];
  totalVotes: number;
  duration: string;
  endsAt: Date;
  hasVoted: boolean;
  myVote: string | null;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

// ============================================================
// STORY FEED CONTENT
// ============================================================

export interface StoryFeedContent {
  type: 'story';
  title: string;
  subtitle: string | null;
  coverImageUrl: string;
  bodyPreview: string;
  readingTimeMinutes: number;
  seriesName: string | null;
  seriesPosition: number | null;
  callToAction: StoryCallToAction | null;
  topics: string[];
}

// ============================================================
// EVENT FEED CONTENT
// ============================================================

export interface EventFeedContent {
  type: 'event';
  title: string;
  description: string;
  coverImageUrl: string | null;
  eventType: EventType;
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  viewerLocalTime: string;
  physicalLocation: PhysicalLocation | null;
  virtualLink: string | null;
  ticketType: TicketType;
  ticketPrice: TicketPriceDisplay | null;
  capacity: number | null;
  spotsRemaining: number | null;
  coHosts: FeedAuthor[];
  attendees: EventAttendeePreview;
  regionalHub: string | null;
  relatedSpace: RelatedSpacePreview | null;
  isRSVPd: boolean;
  rsvpStatus: 'going' | 'interested' | 'not_going' | null;
}

export interface TicketPriceDisplay {
  minPrice: number;
  maxPrice: number;
  currency: string;
  displayText: string;
}

export interface EventAttendeePreview {
  totalCount: number;
  connectionAttendees: FeedAuthor[];
  connectionCount: number;
}

export interface RelatedSpacePreview {
  id: string;
  name: string;
  memberCount: number;
}

// ============================================================
// SPACE FEED CONTENT
// ============================================================

export interface SpaceFeedContent {
  type: 'space';
  name: string;
  description: string;
  coverImageUrl: string | null;
  spaceType: SpaceType;
  visibility: SpaceVisibility;
  memberCount: number;
  maxMembers: number | null;
  rolesNeeded: SpaceRoleFeedData[];
  timeline: SpaceTimeline | null;
  progressPercentage: number | null;
  recentActivity: string | null;
  memberPreview: FeedAuthor[];
  connectionMemberCount: number;
  relatedEvent: RelatedEventPreview | null;
  regionalFocus: string | null;
  isMember: boolean;
  membershipStatus: 'member' | 'pending' | 'invited' | null;
}

export interface SpaceRoleFeedData {
  title: string;
  filled: boolean;
  matchesMySkills: boolean;
}

export interface RelatedEventPreview {
  id: string;
  title: string;
  startDateTime: Date;
}

// ============================================================
// OPPORTUNITY FEED CONTENT
// ============================================================

export interface OpportunityFeedContent {
  type: 'opportunity';
  title: string;
  description: string;
  direction: OpportunityDirection;
  category: OpportunityCategory;
  compensationType: CompensationType;
  compensationDisplay: string;
  locationRelevance: LocationRelevance;
  locationDisplay: string;
  duration: OpportunityDuration | null;
  durationDisplay: string | null;
  deadline: Date | null;
  daysUntilDeadline: number | null;
  interestCount: number;
  matchScore: number | null;
  matchReasons: string[];
  relatedSpace: RelatedSpacePreview | null;
  hasExpressedInterest: boolean;
}

// ============================================================
// DIA INSIGHT FEED CONTENT
// ============================================================

export interface DIAInsightFeedContent {
  type: 'dia_insight';
  insightType: DIAFeedInsightType;
  headline: string;
  body: string;
  dataPoints: DIADataPoint[];
  actionCTA: DIAFeedAction;
  secondaryCTA: DIAFeedAction | null;
  relatedContentIds: string[];
  expiresAt: Date | null;
}

export type DIAFeedInsightType =
  | 'network_insight'
  | 'opportunity_match'
  | 'event_recommendation'
  | 'space_invitation'
  | 'contribution_prompt'
  | 'content_amplification'
  | 'milestone_celebration'
  | 'weekly_digest'
  | 'trending_topic'
  | 'regional_highlight';

export interface DIADataPoint {
  label: string;
  value: string;
  icon: string;
}

export interface DIAFeedAction {
  label: string;
  type: 'navigate' | 'open_composer' | 'inline_action' | 'expand';
  payload: {
    targetType?: string;
    targetId?: string;
    composerMode?: ComposerMode;
    composerPrefill?: Record<string, unknown>;
  };
}

// ============================================================
// MILESTONE FEED CONTENT
// ============================================================

export interface MilestoneFeedContent {
  type: 'milestone';
  milestoneType: MilestoneType;
  headline: string;
  description: string;
  metric: {
    label: string;
    value: number;
    unit: string;
  };
  impactSnapshot: string | null;
  celebrationAction: DIAFeedAction;
}

export type MilestoneType =
  | 'connections_milestone'
  | 'events_hosted'
  | 'spaces_created'
  | 'stories_published'
  | 'opportunities_fulfilled'
  | 'cross_c_achievement'
  | 'regional_impact'
  | 'platform_anniversary';

// ============================================================
// ACTIVITY FEED CONTENT (lightweight)
// ============================================================

export interface ActivityFeedContent {
  type: 'activity';
  activityType: ActivityType;
  actors: FeedAuthor[];
  activityText: string;
  targetName: string | null;
  targetId: string | null;
  targetType: string | null;
}

export type ActivityType =
  | 'new_connection'
  | 'event_rsvp'
  | 'space_joined'
  | 'opportunity_interest'
  | 'story_published'
  | 'task_completed'
  | 'role_filled';

// ============================================================
// PAGINATION & LOADING
// ============================================================

export interface FeedPage {
  items: FeedItem[];
  cursor: string | null;
  hasMore: boolean;
  totalEstimate: number | null;
  appliedFilters: FeedFilters;
  appliedSort: FeedSortMode;
  diaInsights: DIAInsightFeedContent[];
}

export interface FeedRequest {
  feedType: FeedType;
  sortMode: FeedSortMode;
  filters: FeedFilters;
  cursor: string | null;
  pageSize: number;
  userId: string;
  userTier: UserTier;
  userTimezone: string;
}

// ============================================================
// FEED STATE
// ============================================================

export interface FeedState {
  feedType: FeedType;
  sortMode: FeedSortMode;
  filters: FeedFilters;
  items: FeedItem[];
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  cursor: string | null;
  pageSize: number;
  newItemCount: number;
  diaInsightsQueue: DIAInsightFeedContent[];
  lastDiaInsertIndex: number;
  readItems: Set<string>;
  engagedItems: Set<string>;
}

// ============================================================
// RANKING
// ============================================================

export interface RankingWeights {
  connectionStrength: number;
  cModuleDiversity: number;
  skillMatch: number;
  regionalRelevance: number;
  engagementVelocity: number;
  freshness: number;
  creatorRelationship: number;
  contentQuality: number;
}

// ============================================================
// FEED TIER CONFIGURATION
// ============================================================

export interface FeedTierConfig {
  sortModes: FeedSortMode[];
  maxFilters: number;
  diaInsightsPerSession: number;
  canSeeMatchScores: boolean;
  canSeeDetailedEngagement: boolean;
  feedRefreshCooldownMs: number;
  showUpgradePrompts: boolean;
}

// ============================================================
// USER FEED PREFERENCES
// ============================================================

export interface UserFeedPreferences {
  userId: string;
  preferredSort: FeedSortMode;
  hiddenContentTypes: FeedContentType[];
  mutedUsers: string[];
  mutedTags: string[];
  preferredRegions: string[];
  diaInsightFrequency: 'frequent' | 'normal' | 'minimal' | 'off';
}

// ============================================================
// ENGAGEMENT BAR TYPES
// ============================================================

export interface EngagementAction {
  type: 'like' | 'comment' | 'reshare' | 'bookmark' | 'rsvp' | 'join' | 'interest';
  icon: string;
  activeIcon: string;
  activeColor: string;
  countVisible: boolean;
  label: string;
}

// ============================================================
// FEED CARD CONFIGURATION
// ============================================================

export type CulturalAccentType =
  | 'none'
  | 'kente_border'
  | 'ndebele_pattern'
  | 'mudcloth_bg'
  | 'adinkra_icon';

export interface FeedCardCTA {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
  action: 'navigate' | 'inline' | 'modal';
}

export interface FeedCardConfig {
  contentType: FeedContentType;
  accentColor: string;
  leftBorderWidth: number;
  showCoverImage: boolean;
  coverImageAspectRatio: string;
  showAuthorHeader: boolean;
  primaryCTA: FeedCardCTA;
  maxBodyPreviewLength: number;
  culturalAccent: CulturalAccentType;
}
