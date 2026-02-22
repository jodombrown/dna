/**
 * DNA | Sprint 11 - Feed Scoring Algorithm
 *
 * Computes per-item feed scores using the formula:
 *   FeedScore = (Relevance × 0.35) + (Freshness × 0.20) + (Engagement × 0.20)
 *             + (Connection × 0.15) + (Diversity × 0.10)
 *
 * Each signal component is a pure function returning 0-1.
 * Zero `any` types.
 */

import type {
  FeedItem,
  FeedContentType,
  FeedAuthor,
  FeedEngagement,
  PostFeedContent,
  StoryFeedContent,
  EventFeedContent,
  SpaceFeedContent,
  OpportunityFeedContent,
} from '@/types/feedTypes';
import type { CModule } from '@/types/composer';

// ============================================================
// TYPES
// ============================================================

export interface UserProfile {
  id: string;
  sectors: string[];
  skills: string[];
  interests: string[];
  region: string | null;
  connectionIds: Set<string>;
  secondDegreeIds: Set<string>;
  sharedSpaceIds: Set<string>;
  messageHistoryUserIds: Set<string>;
  /** Sprint 12D.3: IDs of users this user follows (asymmetric) */
  followedIds: Set<string>;
}

export interface FeedState {
  recentTypes: FeedContentType[];
  recentCModules: CModule[];
  cModuleCounts: Record<string, number>;
  totalItems: number;
}

export interface FeedScoreResult {
  total: number;
  relevance: number;
  freshness: number;
  engagement: number;
  connection: number;
  diversity: number;
}

// ============================================================
// SCORING WEIGHTS
// ============================================================

const WEIGHTS = {
  relevance: 0.35,
  freshness: 0.20,
  engagement: 0.20,
  connection: 0.15,
  diversity: 0.10,
} as const;

// ============================================================
// RELEVANCE SCORE (0-1)
// ============================================================

export function relevanceScore(item: FeedItem, user: UserProfile): number {
  const sectorMatch = computeSectorMatch(item, user);
  const topicAffinity = computeTopicAffinity(item, user);
  // Weighted average of sector match and topic affinity
  return sectorMatch * 0.6 + topicAffinity * 0.4;
}

function computeSectorMatch(item: FeedItem, user: UserProfile): number {
  const itemTags = extractTags(item);
  if (itemTags.length === 0 || user.sectors.length === 0) return 0.3;

  const lowerSectors = new Set(user.sectors.map((s) => s.toLowerCase()));
  const matchCount = itemTags.filter((tag) => lowerSectors.has(tag.toLowerCase())).length;
  return Math.min(matchCount / Math.max(user.sectors.length, 1), 1.0);
}

function computeTopicAffinity(item: FeedItem, user: UserProfile): number {
  const itemTags = extractTags(item);
  if (itemTags.length === 0) return 0.2;

  const combinedInterests = new Set([
    ...user.interests.map((i) => i.toLowerCase()),
    ...user.skills.map((s) => s.toLowerCase()),
  ]);

  if (combinedInterests.size === 0) return 0.2;

  const matchCount = itemTags.filter((tag) => combinedInterests.has(tag.toLowerCase())).length;
  return Math.min(matchCount * 0.25, 1.0);
}

function extractTags(item: FeedItem): string[] {
  switch (item.type) {
    case 'post': {
      const content = item.content as PostFeedContent;
      return content.hashtags || [];
    }
    case 'story': {
      const content = item.content as StoryFeedContent;
      return content.topics || [];
    }
    case 'opportunity': {
      const content = item.content as OpportunityFeedContent;
      return content.matchReasons || [];
    }
    default:
      return [];
  }
}

// ============================================================
// FRESHNESS SCORE (0-1)
// ============================================================

export function freshnessScore(item: FeedItem): number {
  const now = Date.now();
  const createdAt = new Date(item.createdAt).getTime();
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

  switch (item.type) {
    case 'post':
      // Posts: half_life = 48 hours
      return Math.pow(0.5, hoursSinceCreation / 48);

    case 'story':
      // Stories: half_life = 72 hours
      return Math.pow(0.5, hoursSinceCreation / 72);

    case 'event': {
      const eventContent = item.content as EventFeedContent;
      const eventStart = new Date(eventContent.startDateTime).getTime();
      const eventEnd = new Date(eventContent.endDateTime).getTime();

      // Past events get 0
      if (now > eventEnd) return 0;

      const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);
      // 3x boost when < 48 hours out
      if (hoursUntilEvent <= 48 && hoursUntilEvent > 0) return Math.min(1.0, 0.33 * 3);
      // 2x boost when < 7 days out
      if (hoursUntilEvent <= 168 && hoursUntilEvent > 0) return Math.min(1.0, 0.5 * 2);
      // Normal decay
      return Math.pow(0.5, hoursSinceCreation / 72);
    }

    case 'opportunity': {
      const oppContent = item.content as OpportunityFeedContent;
      // 1.5x boost first 72 hours
      if (hoursSinceCreation <= 72) {
        return Math.min(1.0, 0.67 * 1.5);
      }
      // Accelerated decay in final 20% of lifespan
      if (oppContent.deadline && oppContent.daysUntilDeadline !== null) {
        if (oppContent.daysUntilDeadline <= 0) return 0;
        if (oppContent.daysUntilDeadline <= 7) {
          return Math.pow(0.5, hoursSinceCreation / 36);
        }
      }
      return Math.pow(0.5, hoursSinceCreation / 96);
    }

    case 'space': {
      // Space updates: half_life = 24 hours
      return Math.pow(0.5, hoursSinceCreation / 24);
    }

    case 'dia_insight':
      // DIA insights are contextual, not time-based
      return 0.8;

    default:
      return Math.pow(0.5, hoursSinceCreation / 48);
  }
}

// ============================================================
// ENGAGEMENT SCORE (0-1)
// ============================================================

export function engagementScore(item: FeedItem): number {
  const eng = item.engagement;
  const weighted =
    eng.likeCount * 1 +
    eng.commentCount * 3 +
    eng.bookmarkCount * 4 +
    eng.reshareCount * 5;

  // Normalize by view count (impressions), with minimum floor
  const impressions = Math.max(eng.viewCount, 10);
  const normalized = weighted / impressions;

  // Clamp to 0-1
  return Math.min(normalized, 1.0);
}

// ============================================================
// CONNECTION SCORE (0-1)
// ============================================================

export function connectionScore(item: FeedItem, user: UserProfile): number {
  const authorId = item.createdBy.id;

  // Self-authored content
  if (authorId === user.id) return 0.9;

  let score: number;

  // 1st degree connection
  if (user.connectionIds.has(authorId)) {
    score = 1.0;
  }
  // Sprint 12D.3: Following boost (1.5-degree — stronger than strangers, slightly weaker than mutual connections)
  else if (user.followedIds.has(authorId)) {
    score = 0.7;
  }
  // 2nd degree connection
  else if (user.secondDegreeIds.has(authorId)) {
    score = 0.5;
  }
  // No connection
  else {
    score = 0.2;
  }

  // Bonus for message history
  if (user.messageHistoryUserIds.has(authorId)) {
    score = Math.min(score + 0.15, 1.0);
  }

  // Bonus for following even if already connected (stacks to show preference)
  if (user.followedIds.has(authorId) && user.connectionIds.has(authorId)) {
    score = Math.min(score + 0.05, 1.0);
  }

  // Bonus for shared spaces
  if (item.type === 'space') {
    const spaceContent = item.content as SpaceFeedContent;
    if (spaceContent.connectionMemberCount > 0) {
      score = Math.min(score + 0.1, 1.0);
    }
  }

  return score;
}

// ============================================================
// DIVERSITY SCORE (0-1)
// ============================================================

export function diversityScore(item: FeedItem, feedState: FeedState): number {
  let score = 0.5;

  // Penalty if last 2 items were same type
  const lastTwo = feedState.recentTypes.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every((t) => t === item.type)) {
    score -= 0.3;
  } else if (lastTwo.length >= 1 && lastTwo[lastTwo.length - 1] === item.type) {
    score -= 0.1;
  }

  // Bonus for underrepresented C modules
  if (feedState.totalItems > 0) {
    const cModuleCount = feedState.cModuleCounts[item.primaryC] || 0;
    const proportion = cModuleCount / feedState.totalItems;
    if (proportion < 0.1) {
      score += 0.3; // Underrepresented bonus
    } else if (proportion < 0.2) {
      score += 0.15;
    }
  } else {
    score += 0.2; // First item gets a small bonus
  }

  return Math.max(0, Math.min(score, 1.0));
}

// ============================================================
// COMPOSITE SCORE
// ============================================================

export function calculateFeedScore(
  item: FeedItem,
  userProfile: UserProfile,
  feedState: FeedState
): FeedScoreResult {
  const rel = relevanceScore(item, userProfile);
  const fresh = freshnessScore(item);
  const eng = engagementScore(item);
  const conn = connectionScore(item, userProfile);
  const div = diversityScore(item, feedState);

  const total =
    rel * WEIGHTS.relevance +
    fresh * WEIGHTS.freshness +
    eng * WEIGHTS.engagement +
    conn * WEIGHTS.connection +
    div * WEIGHTS.diversity;

  return {
    total,
    relevance: rel,
    freshness: fresh,
    engagement: eng,
    connection: conn,
    diversity: div,
  };
}

// ============================================================
// BATCH SCORING
// ============================================================

export function scoreAndRankItems(
  items: FeedItem[],
  userProfile: UserProfile
): Array<FeedItem & { feedScore: FeedScoreResult }> {
  const feedState: FeedState = {
    recentTypes: [],
    recentCModules: [],
    cModuleCounts: {},
    totalItems: 0,
  };

  // First pass: compute scores
  const scored = items.map((item) => {
    const feedScore = calculateFeedScore(item, userProfile, feedState);

    // Update feed state for diversity tracking
    feedState.recentTypes.push(item.type);
    feedState.recentCModules.push(item.primaryC);
    feedState.cModuleCounts[item.primaryC] = (feedState.cModuleCounts[item.primaryC] || 0) + 1;
    feedState.totalItems++;

    return { ...item, feedScore };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.feedScore.total - a.feedScore.total);

  // Second pass: re-evaluate diversity after sorting
  const finalState: FeedState = {
    recentTypes: [],
    recentCModules: [],
    cModuleCounts: {},
    totalItems: 0,
  };

  return scored.map((item) => {
    const diversityAdj = diversityScore(item, finalState);
    const adjustedTotal =
      item.feedScore.relevance * WEIGHTS.relevance +
      item.feedScore.freshness * WEIGHTS.freshness +
      item.feedScore.engagement * WEIGHTS.engagement +
      item.feedScore.connection * WEIGHTS.connection +
      diversityAdj * WEIGHTS.diversity;

    finalState.recentTypes.push(item.type);
    finalState.recentCModules.push(item.primaryC);
    finalState.cModuleCounts[item.primaryC] = (finalState.cModuleCounts[item.primaryC] || 0) + 1;
    finalState.totalItems++;

    return {
      ...item,
      feedScore: { ...item.feedScore, diversity: diversityAdj, total: adjustedTotal },
      relevanceScore: adjustedTotal,
    };
  });
}
