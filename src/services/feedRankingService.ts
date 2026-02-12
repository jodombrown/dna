/**
 * DNA | FEED - Ranking Engine
 *
 * DIA-powered feed ranking with multi-signal intelligence.
 * Computes per-user relevance scores and enforces C-module diversity.
 */

import { CModule, UserTier } from '@/types/composer';
import type {
  FeedItem,
  RankingSignals,
  RankingWeights,
  FeedContentType,
  PostFeedContent,
  StoryFeedContent,
  EventFeedContent,
  SpaceFeedContent,
  OpportunityFeedContent,
  DIAInsightFeedContent,
  FeedAuthor,
  FeedEngagement,
  CrossReference,
} from '@/types/feedTypes';
import {
  FOR_YOU_WEIGHTS,
  TRENDING_WEIGHTS,
  PRO_VISIBILITY_MULTIPLIER,
  ORG_VISIBILITY_MULTIPLIER,
} from '@/lib/feedConfig';

export const feedRankingService = {
  // ============================================
  // COMPOSITE SCORE COMPUTATION
  // ============================================

  computeRelevanceScore(
    item: FeedItem,
    signals: RankingSignals,
    weights: RankingWeights
  ): number {
    const baseScore =
      signals.connectionStrength * weights.connectionStrength +
      signals.cModuleDiversity * weights.cModuleDiversity +
      signals.skillMatch * weights.skillMatch +
      signals.regionalRelevance * weights.regionalRelevance +
      signals.engagementVelocity * weights.engagementVelocity +
      signals.freshness * weights.freshness +
      signals.creatorRelationship * weights.creatorRelationship +
      signals.contentQuality * weights.contentQuality;

    // Apply Pro/Org visibility multiplier
    if (item.isPro) {
      const tier = item.createdBy.tier;
      if (tier === UserTier.PRO) return baseScore * PRO_VISIBILITY_MULTIPLIER;
      if (tier === UserTier.ORG) return baseScore * ORG_VISIBILITY_MULTIPLIER;
    }

    return baseScore;
  },

  // ============================================
  // SIGNAL COMPUTATION
  // ============================================

  computeConnectionStrength(connectionDegree: number, mutualCount: number): number {
    if (connectionDegree === 0) return 1.0; // Self
    if (connectionDegree === 1) return 0.9; // Direct connection
    if (connectionDegree === 2) {
      return 0.4 + Math.min(mutualCount * 0.05, 0.3); // 0.4-0.7 based on mutuals
    }
    return 0.1; // 3rd degree or stranger
  },

  computeCModuleDiversity(
    itemC: CModule,
    recentFeedCs: CModule[]
  ): number {
    const recentCount = recentFeedCs.filter((c) => c === itemC).length;
    if (recentCount === 0) return 1.0;
    if (recentCount === 1) return 0.7;
    if (recentCount === 2) return 0.4;
    if (recentCount === 3) return 0.2;
    return 0.05;
  },

  computeSkillMatch(
    itemType: FeedContentType,
    content: FeedItem['content'],
    userSkills: string[],
    userInterests: string[]
  ): number {
    // For Spaces with roles needed
    if (itemType === 'space') {
      const spaceContent = content as SpaceFeedContent;
      const matchingRoles = spaceContent.rolesNeeded.filter((r) => r.matchesMySkills);
      if (matchingRoles.length > 0) return 0.9;
    }

    // For Opportunities
    if (itemType === 'opportunity') {
      const oppContent = content as OpportunityFeedContent;
      if (oppContent.matchScore !== null) return oppContent.matchScore;
    }

    // For Stories — topic overlap with user interests
    if (itemType === 'story') {
      const storyContent = content as StoryFeedContent;
      const overlap = storyContent.topics.filter(
        (t) => userInterests.includes(t) || userSkills.includes(t)
      );
      return Math.min(overlap.length * 0.25, 1.0);
    }

    // For Posts — hashtag overlap
    if (itemType === 'post') {
      const postContent = content as PostFeedContent;
      const overlap = postContent.hashtags.filter(
        (t) => userInterests.includes(t) || userSkills.includes(t)
      );
      return Math.min(overlap.length * 0.25, 1.0);
    }

    return 0.3; // Neutral default
  },

  computeRegionalRelevance(
    itemType: FeedContentType,
    content: FeedItem['content'],
    creatorRegion: string | null,
    userRegion: string | null
  ): number {
    if (!userRegion) return 0.5;

    if (itemType === 'event') {
      const eventContent = content as EventFeedContent;
      if (eventContent.regionalHub === userRegion) return 1.0;
      if (eventContent.eventType === 'virtual') return 0.7;
    }

    if (itemType === 'opportunity') {
      const oppContent = content as OpportunityFeedContent;
      if (oppContent.locationRelevance === 'global') return 0.7;
      if (oppContent.locationDisplay.toLowerCase().includes(userRegion.toLowerCase())) return 0.9;
    }

    if (creatorRegion === userRegion) return 0.6;
    return 0.3;
  },

  computeEngagementVelocity(item: FeedItem): number {
    const age = Date.now() - new Date(item.createdAt).getTime();
    const hoursOld = age / (1000 * 60 * 60);
    if (hoursOld === 0) return 0.5;

    const totalEngagement =
      item.engagement.likeCount +
      item.engagement.commentCount * 2 +
      item.engagement.reshareCount * 3;
    const velocityPerHour = totalEngagement / hoursOld;

    return Math.min(velocityPerHour / 10, 1.0);
  },

  computeFreshness(createdAt: Date): number {
    const age = Date.now() - new Date(createdAt).getTime();
    const hoursOld = age / (1000 * 60 * 60);
    return Math.exp(-0.03 * hoursOld);
  },

  computeContentQuality(itemType: FeedContentType, content: FeedItem['content']): number {
    let score = 0.3;

    if (itemType === 'post') {
      const postContent = content as PostFeedContent;
      if (postContent.media.length > 0) score += 0.2;
      if (postContent.body.length > 200) score += 0.1;
      if (postContent.poll) score += 0.15;
    }

    if (itemType === 'story') {
      const storyContent = content as StoryFeedContent;
      if (storyContent.coverImageUrl) score += 0.15;
      if (storyContent.readingTimeMinutes >= 3) score += 0.15;
      if (storyContent.seriesName) score += 0.1;
    }

    if (itemType === 'event') {
      const eventContent = content as EventFeedContent;
      if (eventContent.coverImageUrl) score += 0.1;
      if (eventContent.coHosts.length > 0) score += 0.1;
      if (eventContent.relatedSpace) score += 0.1;
    }

    return Math.min(score, 1.0);
  },

  // ============================================
  // FULL RANKING PIPELINE
  // ============================================

  rankItems(
    items: FeedItem[],
    sortMode: 'for_you' | 'recent' | 'trending',
    userRegion: string | null,
    userSkills: string[],
    userInterests: string[]
  ): FeedItem[] {
    if (sortMode === 'recent') {
      return [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const weights = sortMode === 'trending' ? TRENDING_WEIGHTS : FOR_YOU_WEIGHTS;
    const recentCs: CModule[] = [];

    for (const item of items) {
      item.rankingSignals = {
        connectionStrength: this.computeConnectionStrength(
          item.createdBy.connectionDegree,
          item.createdBy.mutualConnectionCount
        ),
        cModuleDiversity: this.computeCModuleDiversity(item.primaryC, recentCs),
        skillMatch: this.computeSkillMatch(item.type, item.content, userSkills, userInterests),
        regionalRelevance: this.computeRegionalRelevance(
          item.type,
          item.content,
          null,
          userRegion
        ),
        engagementVelocity: this.computeEngagementVelocity(item),
        freshness: this.computeFreshness(item.createdAt),
        creatorRelationship: 0.5, // Placeholder — requires interaction history
        contentQuality: this.computeContentQuality(item.type, item.content),
      };

      item.relevanceScore = this.computeRelevanceScore(item, item.rankingSignals, weights);
      recentCs.push(item.primaryC);
    }

    return [...items].sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  // ============================================
  // C-MODULE DIVERSITY ENFORCEMENT
  // ============================================

  enforceDiversity(rankedItems: FeedItem[], pageSize: number): FeedItem[] {
    const result: FeedItem[] = [];
    const recentCs: CModule[] = [];
    const maxConsecutiveSameC = 2;
    const skipped: FeedItem[] = [];

    const sorted = [...rankedItems].sort((a, b) => b.relevanceScore - a.relevanceScore);

    for (const item of sorted) {
      if (result.length >= pageSize) break;

      const lastCs = recentCs.slice(-maxConsecutiveSameC);
      const allSameC =
        lastCs.length === maxConsecutiveSameC && lastCs.every((c) => c === item.primaryC);

      if (allSameC) {
        skipped.push(item);
        continue;
      }

      result.push(item);
      recentCs.push(item.primaryC);
    }

    // Backfill with skipped items if under page size
    if (result.length < pageSize) {
      const usedIds = new Set(result.map((i) => i.id));
      for (const item of skipped) {
        if (result.length >= pageSize) break;
        if (!usedIds.has(item.id)) {
          result.push(item);
        }
      }
    }

    return result;
  },

  // ============================================
  // DIA INSIGHT INTERLEAVING
  // ============================================

  interleaveDIAInsights(
    feedItems: FeedItem[],
    insights: DIAInsightFeedContent[],
    userTier: UserTier
  ): FeedItem[] {
    if (insights.length === 0) return feedItems;

    const insertionInterval = userTier === UserTier.FREE ? 12 : 8;
    const maxInsights = userTier === UserTier.FREE ? 3 : Infinity;

    const result: FeedItem[] = [];
    let insightIndex = 0;
    let insightsInserted = 0;

    for (let i = 0; i < feedItems.length; i++) {
      result.push(feedItems[i]);

      if (
        (i + 1) % insertionInterval === 0 &&
        insightIndex < insights.length &&
        insightsInserted < maxInsights
      ) {
        const insightItem: FeedItem = {
          id: `dia-insight-${insights[insightIndex].insightType}-${Date.now()}-${insightIndex}`,
          type: 'dia_insight',
          contentId: `dia-${insightIndex}`,
          primaryC: CModule.CONNECT,
          secondaryCs: [],
          createdBy: {
            id: 'dia',
            displayName: 'DIA',
            avatarUrl: null,
            headline: 'Diaspora Intelligence Agent',
            isVerified: true,
            tier: UserTier.ORG,
            connectionDegree: 0,
            mutualConnectionCount: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          relevanceScore: 1.0,
          rankingSignals: {
            connectionStrength: 0,
            cModuleDiversity: 0,
            skillMatch: 0,
            regionalRelevance: 0,
            engagementVelocity: 0,
            freshness: 1,
            creatorRelationship: 0,
            contentQuality: 1,
          },
          content: insights[insightIndex],
          engagement: {
            likeCount: 0,
            commentCount: 0,
            reshareCount: 0,
            bookmarkCount: 0,
            viewCount: 0,
            isLikedByMe: false,
            isBookmarkedByMe: false,
            isResharedByMe: false,
          },
          crossReferences: [],
          isPro: false,
          isPromoted: false,
        };

        result.push(insightItem);
        insightIndex++;
        insightsInserted++;
      }
    }

    return result;
  },
};
