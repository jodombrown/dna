/**
 * DIA | Space Matching Service (Spaces ↔ Skills)
 *
 * Matches collaboration spaces to users based on:
 * - Role/skill fit (strongest signal — do they fill a needed role?)
 * - Topic/interest overlap
 * - Network presence (connections who are members)
 * - Regional alignment
 * - Space type preference
 * - Availability fit
 */

import { supabase } from '@/integrations/supabase/client';
import {
  SpaceMatchType,
  MatchSurface,
  MatchPriority,
  type SpaceMatchResult,
  type SpaceMatchSignals,
  type MatchReason,
  type MatchStatus,
} from '@/types/diaEngine';

/** Weights for space match signals */
const MATCH_WEIGHTS: Record<keyof SpaceMatchSignals, number> = {
  roleSkillOverlap: 0.30,
  topicInterestOverlap: 0.15,
  connectionMemberCount: 0.15,
  connectionMemberStrength: 0.10,
  regionalAlignment: 0.10,
  spaceTypePreference: 0.10,
  availabilityFit: 0.10,
};

const MIN_MATCH_THRESHOLD = 0.35;

/**
 * Find spaces that match a user's skills and interests.
 */
async function matchUserToSpaces(userId: string, limit = 20): Promise<SpaceMatchResult[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('skills, interests, location, profession')
    .eq('id', userId)
    .single();

  if (!profile) return [];

  // Get spaces user is NOT already a member of
  const { data: myMemberships } = await supabase
    .from('collaboration_memberships')
    .select('space_id')
    .eq('user_id', userId);

  const mySpaceIds = new Set((myMemberships || []).map(m => m.space_id));

  // Get open/public spaces
  const { data: spaces } = await supabase
    .from('collaboration_spaces')
    .select('id, title, description, focus_area, visibility, status')
    .in('visibility', ['public', 'open'])
    .eq('status', 'active')
    .limit(100);

  if (!spaces) return [];

  // Get user's connections for network presence
  const userConnections = await fetchUserConnectionIds(userId);

  // Get space member lists for network presence calculation
  const spaceIds = spaces.filter(s => !mySpaceIds.has(s.id)).map(s => s.id);
  const spaceMemberMap = await fetchSpaceMembers(spaceIds);

  const userSkills = ((profile.skills || []) as string[]).map(s => s.toLowerCase());
  const userInterests = ((profile.interests || []) as string[]).map(s => s.toLowerCase());

  const results: SpaceMatchResult[] = spaces
    .filter(s => !mySpaceIds.has(s.id))
    .map(space => {
      const members = spaceMemberMap.get(space.id) || [];
      const signals = computeSpaceSignals(
        space,
        userSkills,
        userInterests,
        members,
        userConnections,
        profile,
      );
      const score = computeScore(signals);
      const matchType = classifySpaceMatchType(signals);
      const matchedRoles = findMatchedRoles(space, userSkills);
      const reasons = generateSpaceReasons(signals, space, matchedRoles, members.length);

      return {
        spaceId: space.id,
        userId,
        matchScore: score,
        matchType,
        matchedRoles,
        matchReasons: reasons,
        signals,
        surfacedVia: determineSurfaces(score),
        priority: determinePriority(score),
        createdAt: new Date(),
        status: 'active' as MatchStatus,
      };
    });

  return results
    .filter(r => r.matchScore >= MIN_MATCH_THRESHOLD)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Find users who would be a good fit for a specific space.
 */
async function matchSpaceToUsers(spaceId: string, limit = 30): Promise<SpaceMatchResult[]> {
  const { data: space } = await supabase
    .from('collaboration_spaces')
    .select('*')
    .eq('id', spaceId)
    .single();

  if (!space) return [];

  // Get existing members to exclude
  const { data: members } = await supabase
    .from('collaboration_memberships')
    .select('user_id')
    .eq('space_id', spaceId);

  const memberIds = new Set((members || []).map(m => m.user_id));

  // Get candidate profiles
  const spaceDesc = `${space.title} ${space.description || ''} ${space.focus_area || ''}`.toLowerCase();
  const { data: candidates } = await supabase
    .from('profiles')
    .select('id, full_name, skills, interests, location, profession')
    .limit(200);

  if (!candidates) return [];

  const results: SpaceMatchResult[] = candidates
    .filter(c => !memberIds.has(c.id))
    .map(candidate => {
      const userSkills = ((candidate.skills || []) as string[]).map(s => s.toLowerCase());
      const userInterests = ((candidate.interests || []) as string[]).map(s => s.toLowerCase());
      const connectionMembers = Array.from(memberIds);

      const signals = computeSpaceSignals(
        space,
        userSkills,
        userInterests,
        connectionMembers,
        new Set(), // No connection info in this direction
        candidate,
      );
      const score = computeScore(signals);
      const matchType = classifySpaceMatchType(signals);
      const matchedRoles = findMatchedRoles(space, userSkills);

      return {
        spaceId,
        userId: candidate.id,
        matchScore: score,
        matchType,
        matchedRoles,
        matchReasons: generateSpaceReasons(signals, space, matchedRoles, 0),
        signals,
        surfacedVia: [MatchSurface.SPACE_RECRUITMENT],
        priority: determinePriority(score),
        createdAt: new Date(),
        status: 'active' as MatchStatus,
      };
    });

  return results
    .filter(r => r.matchScore >= MIN_MATCH_THRESHOLD)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function computeSpaceSignals(
  space: Record<string, unknown>,
  userSkills: string[],
  userInterests: string[],
  memberIds: string[],
  userConnections: Set<string>,
  profile: Record<string, unknown>,
): SpaceMatchSignals {
  const spaceText = `${space.title} ${space.description || ''} ${space.focus_area || ''}`.toLowerCase();

  // Role/skill overlap
  const skillHits = userSkills.filter(s => spaceText.includes(s));
  const roleSkillOverlap = userSkills.length > 0
    ? Math.min(skillHits.length / Math.max(userSkills.length, 1) * 2, 1)
    : 0;

  // Topic/interest overlap
  const interestHits = userInterests.filter(i => spaceText.includes(i));
  const topicInterestOverlap = Math.min(interestHits.length * 0.3, 1);

  // Network presence
  const connectionMembers = memberIds.filter(id => userConnections.has(id));
  const connectionMemberCount = Math.min(connectionMembers.length / 5, 1);

  // Regional alignment
  const userLocation = ((profile.location || '') as string).toLowerCase();
  const spaceRegion = ((space.focus_area || '') as string).toLowerCase();
  const regionalAlignment = userLocation && spaceRegion && userLocation.includes(spaceRegion)
    ? 0.8
    : 0.3;

  return {
    roleSkillOverlap,
    topicInterestOverlap,
    connectionMemberCount,
    connectionMemberStrength: connectionMemberCount * 0.8, // Approximate
    regionalAlignment,
    spaceTypePreference: 0.5, // Default
    availabilityFit: 0.5, // Default
  };
}

function computeScore(signals: SpaceMatchSignals): number {
  let score = 0;
  for (const [key, weight] of Object.entries(MATCH_WEIGHTS)) {
    score += (signals[key as keyof SpaceMatchSignals] || 0) * weight;
  }
  return Math.min(Math.max(score, 0), 1);
}

function classifySpaceMatchType(signals: SpaceMatchSignals): SpaceMatchType {
  if (signals.roleSkillOverlap > 0.5) return SpaceMatchType.ROLE_FIT;
  if (signals.connectionMemberCount > 0.5) return SpaceMatchType.NETWORK_PRESENCE;
  if (signals.topicInterestOverlap > 0.4) return SpaceMatchType.INTEREST_ALIGNMENT;
  if (signals.regionalAlignment > 0.6) return SpaceMatchType.REGIONAL_FIT;
  return SpaceMatchType.COMPLEMENTARY_EXPERTISE;
}

function findMatchedRoles(space: Record<string, unknown>, userSkills: string[]): string[] {
  const spaceText = `${space.title} ${space.description || ''} ${space.focus_area || ''}`.toLowerCase();
  return userSkills.filter(s => spaceText.includes(s)).slice(0, 3);
}

function generateSpaceReasons(
  signals: SpaceMatchSignals,
  space: Record<string, unknown>,
  matchedRoles: string[],
  connectionCount: number,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (signals.roleSkillOverlap > 0.3 && matchedRoles.length > 0) {
    reasons.push({
      type: 'complementary_skills',
      text: `Your ${matchedRoles.slice(0, 2).join(' and ')} skills match this space`,
      strength: signals.roleSkillOverlap,
      icon: 'puzzle-piece',
    });
  }

  if (signals.connectionMemberCount > 0.2) {
    reasons.push({
      type: 'mutual_connections',
      text: `${connectionCount} of your connections are members`,
      strength: signals.connectionMemberCount,
      icon: 'people-network',
    });
  }

  if (signals.topicInterestOverlap > 0.3) {
    reasons.push({
      type: 'shared_interests',
      text: `Aligns with your interests`,
      strength: signals.topicInterestOverlap,
      icon: 'lightbulb',
    });
  }

  if (signals.regionalAlignment > 0.5) {
    reasons.push({
      type: 'same_region',
      text: `Regional focus matches your location`,
      strength: signals.regionalAlignment,
      icon: 'map-pin',
    });
  }

  return reasons.sort((a, b) => b.strength - a.strength).slice(0, 3);
}

function determineSurfaces(score: number): MatchSurface[] {
  if (score >= 0.6) {
    return [MatchSurface.FEED_CARD, MatchSurface.CONNECT_SUGGESTIONS];
  }
  if (score >= 0.4) {
    return [MatchSurface.CONNECT_SUGGESTIONS];
  }
  return [];
}

function determinePriority(score: number): MatchPriority {
  if (score >= 0.7) return MatchPriority.HIGH;
  if (score >= 0.5) return MatchPriority.MEDIUM;
  return MatchPriority.LOW;
}

async function fetchUserConnectionIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .limit(500);

  const ids = new Set<string>();
  for (const conn of data || []) {
    ids.add(conn.requester_id === userId ? conn.recipient_id : conn.requester_id);
  }
  return ids;
}

async function fetchSpaceMembers(spaceIds: string[]): Promise<Map<string, string[]>> {
  if (spaceIds.length === 0) return new Map();

  const { data } = await supabase
    .from('collaboration_memberships')
    .select('space_id, user_id')
    .in('space_id', spaceIds)
    .eq('status', 'active');

  const result = new Map<string, string[]>();
  for (const m of data || []) {
    const existing = result.get(m.space_id) || [];
    existing.push(m.user_id);
    result.set(m.space_id, existing);
  }
  return result;
}

export const spaceMatchingService = {
  matchUserToSpaces,
  matchSpaceToUsers,
  MATCH_WEIGHTS,
};
