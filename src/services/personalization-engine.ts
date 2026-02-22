/**
 * DNA | Sprint 11 - Personalization Engine
 *
 * Builds user interest profiles from multiple signal sources
 * and adapts feed scoring based on session maturity.
 *
 * Signal Sources:
 * - Explicit: sectors, skills, location
 * - Engagement: 30-day rolling window of reactions, comments, bookmarks
 * - Connection graph: aggregate sectors of connections
 * - Content creation: topics of user's own posts/spaces/events
 * - DIA interactions: 14-day window of DIA card engagement
 *
 * Cold Start Strategy:
 * - Sessions 1-3: 100% profile-based + popular content
 * - Sessions 4-10: 60% profile, 40% engagement
 * - Sessions 11+: 30% profile, 70% behavioral
 */

import { supabase } from '@/integrations/supabase/client';
import { logHighError } from '@/lib/errorLogger';
import { getSessionCount } from './dia-feed-cadence';

// ============================================================
// TYPES
// ============================================================

export interface UserInterestProfile {
  userId: string;
  sectors: WeightedTopic[];
  skills: WeightedTopic[];
  topics: WeightedTopic[];
  regions: WeightedTopic[];
  sessionMaturity: 'cold_start' | 'warming' | 'mature';
  profileWeight: number;
  behavioralWeight: number;
}

interface WeightedTopic {
  name: string;
  weight: number;
  source: 'explicit' | 'engagement' | 'connection' | 'creation' | 'dia';
}

interface RawEngagementSignal {
  content_type: string;
  tags: string[];
  action_type: string;
  created_at: string;
}

// ============================================================
// SESSION MATURITY
// ============================================================

function getSessionMaturity(sessionCount: number): {
  maturity: UserInterestProfile['sessionMaturity'];
  profileWeight: number;
  behavioralWeight: number;
} {
  if (sessionCount <= 3) {
    return { maturity: 'cold_start', profileWeight: 1.0, behavioralWeight: 0.0 };
  }
  if (sessionCount <= 10) {
    return { maturity: 'warming', profileWeight: 0.6, behavioralWeight: 0.4 };
  }
  return { maturity: 'mature', profileWeight: 0.3, behavioralWeight: 0.7 };
}

// ============================================================
// MAIN FUNCTION
// ============================================================

export async function getUserInterestProfile(userId: string): Promise<UserInterestProfile> {
  const sessionCount = getSessionCount();
  const { maturity, profileWeight, behavioralWeight } = getSessionMaturity(sessionCount);

  try {
    // Fetch explicit profile data
    const explicitTopics = await fetchExplicitProfile(userId);

    // For cold start, skip behavioral signals
    if (maturity === 'cold_start') {
      return {
        userId,
        sectors: explicitTopics.sectors,
        skills: explicitTopics.skills,
        topics: explicitTopics.topics,
        regions: explicitTopics.regions,
        sessionMaturity: maturity,
        profileWeight,
        behavioralWeight,
      };
    }

    // Fetch behavioral signals
    const [engagementTopics, connectionTopics, creationTopics] = await Promise.all([
      fetchEngagementSignals(userId),
      fetchConnectionGraphSignals(userId),
      fetchContentCreationSignals(userId),
    ]);

    // Merge all signals with appropriate weights
    const mergedSectors = mergeWeightedTopics([
      { topics: explicitTopics.sectors, weight: profileWeight },
      { topics: engagementTopics.sectors, weight: behavioralWeight * 0.4 },
      { topics: connectionTopics.sectors, weight: behavioralWeight * 0.3 },
      { topics: creationTopics.sectors, weight: behavioralWeight * 0.3 },
    ]);

    const mergedTopics = mergeWeightedTopics([
      { topics: explicitTopics.topics, weight: profileWeight },
      { topics: engagementTopics.topics, weight: behavioralWeight * 0.5 },
      { topics: creationTopics.topics, weight: behavioralWeight * 0.5 },
    ]);

    return {
      userId,
      sectors: mergedSectors,
      skills: explicitTopics.skills,
      topics: mergedTopics,
      regions: explicitTopics.regions,
      sessionMaturity: maturity,
      profileWeight,
      behavioralWeight,
    };
  } catch (err) {
    logHighError(err, 'feed', 'getUserInterestProfile failed', { userId });
    // Fallback: return minimal profile from explicit data
    const fallback = await fetchExplicitProfile(userId);
    return {
      userId,
      ...fallback,
      sessionMaturity: maturity,
      profileWeight,
      behavioralWeight,
    };
  }
}

// ============================================================
// EXPLICIT PROFILE SIGNALS
// ============================================================

async function fetchExplicitProfile(userId: string): Promise<{
  sectors: WeightedTopic[];
  skills: WeightedTopic[];
  topics: WeightedTopic[];
  regions: WeightedTopic[];
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('sectors, skills, location, interests')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { sectors: [], skills: [], topics: [], regions: [] };
  }

  const profileData = profile as Record<string, unknown>;

  const sectors = toWeightedTopics(
    profileData.sectors as string[] | null,
    'explicit',
    1.0
  );
  const skills = toWeightedTopics(
    profileData.skills as string[] | null,
    'explicit',
    0.8
  );
  const topics = toWeightedTopics(
    profileData.interests as string[] | null,
    'explicit',
    0.9
  );
  const regions = profileData.location
    ? [{ name: profileData.location as string, weight: 1.0, source: 'explicit' as const }]
    : [];

  return { sectors, skills, topics, regions };
}

// ============================================================
// ENGAGEMENT SIGNALS (30-day window)
// ============================================================

async function fetchEngagementSignals(userId: string): Promise<{
  sectors: WeightedTopic[];
  topics: WeightedTopic[];
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch recent reactions
  const { data: reactions } = await supabase
    .from('feed_reactions')
    .select('content_type, content_id, reaction_type, created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo)
    .limit(200);

  // Fetch recent bookmarks
  const { data: bookmarks } = await supabase
    .from('feed_bookmarks')
    .select('content_type, content_id, created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo)
    .limit(100);

  // Aggregate engagement by content area
  const topicCounts = new Map<string, number>();

  const allContentIds = new Set<string>();
  for (const r of (reactions || []) as Array<Record<string, string>>) {
    allContentIds.add(r.content_id);
  }
  for (const b of (bookmarks || []) as Array<Record<string, string>>) {
    allContentIds.add(b.content_id);
  }

  // Weight: reactions=1, bookmarks=2
  for (const r of (reactions || []) as Array<Record<string, string>>) {
    topicCounts.set(r.content_type, (topicCounts.get(r.content_type) || 0) + 1);
  }
  for (const b of (bookmarks || []) as Array<Record<string, string>>) {
    topicCounts.set(b.content_type, (topicCounts.get(b.content_type) || 0) + 2);
  }

  const maxCount = Math.max(...topicCounts.values(), 1);
  const sectors: WeightedTopic[] = [];
  for (const [topic, count] of topicCounts) {
    sectors.push({
      name: topic,
      weight: count / maxCount,
      source: 'engagement',
    });
  }

  return { sectors, topics: sectors };
}

// ============================================================
// CONNECTION GRAPH SIGNALS
// ============================================================

async function fetchConnectionGraphSignals(userId: string): Promise<{
  sectors: WeightedTopic[];
}> {
  // Fetch connected user IDs
  const { data: connections } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .limit(100);

  if (!connections || connections.length === 0) {
    return { sectors: [] };
  }

  const connectedIds = (connections as Array<Record<string, string>>).map((c) =>
    c.requester_id === userId ? c.recipient_id : c.requester_id
  );

  // Fetch sectors of connected users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('sectors')
    .in('id', connectedIds.slice(0, 50));

  const sectorCounts = new Map<string, number>();
  for (const profile of (profiles || []) as Array<Record<string, unknown>>) {
    const sectors = profile.sectors as string[] | null;
    if (sectors) {
      for (const sector of sectors) {
        sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
      }
    }
  }

  const maxCount = Math.max(...sectorCounts.values(), 1);
  const sectors: WeightedTopic[] = [];
  for (const [sector, count] of sectorCounts) {
    sectors.push({
      name: sector,
      weight: count / maxCount,
      source: 'connection',
    });
  }

  return { sectors };
}

// ============================================================
// CONTENT CREATION SIGNALS
// ============================================================

async function fetchContentCreationSignals(userId: string): Promise<{
  sectors: WeightedTopic[];
  topics: WeightedTopic[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: posts } = await db
    .from('posts')
    .select('tags, post_type')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const tagCounts = new Map<string, number>();
  for (const post of (posts || []) as unknown as Array<Record<string, unknown>>) {
    const tags = post.tags as string[] | null;
    if (tags) {
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  const maxCount = Math.max(...tagCounts.values(), 1);
  const topics: WeightedTopic[] = [];
  for (const [tag, count] of tagCounts) {
    topics.push({
      name: tag,
      weight: count / maxCount,
      source: 'creation',
    });
  }

  return { sectors: topics, topics };
}

// ============================================================
// HELPERS
// ============================================================

function toWeightedTopics(
  items: string[] | null,
  source: WeightedTopic['source'],
  baseWeight: number
): WeightedTopic[] {
  if (!items) return [];
  return items.map((item) => ({
    name: item,
    weight: baseWeight,
    source,
  }));
}

function mergeWeightedTopics(
  sources: Array<{ topics: WeightedTopic[]; weight: number }>
): WeightedTopic[] {
  const merged = new Map<string, { totalWeight: number; source: WeightedTopic['source'] }>();

  for (const { topics, weight } of sources) {
    for (const topic of topics) {
      const existing = merged.get(topic.name);
      const adjustedWeight = topic.weight * weight;
      if (existing) {
        existing.totalWeight += adjustedWeight;
      } else {
        merged.set(topic.name, {
          totalWeight: adjustedWeight,
          source: topic.source,
        });
      }
    }
  }

  // Normalize to 0-1
  const maxWeight = Math.max(...Array.from(merged.values()).map((v) => v.totalWeight), 1);

  return Array.from(merged.entries())
    .map(([name, { totalWeight, source }]) => ({
      name,
      weight: totalWeight / maxWeight,
      source,
    }))
    .sort((a, b) => b.weight - a.weight);
}
