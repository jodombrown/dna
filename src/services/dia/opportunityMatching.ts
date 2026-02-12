/**
 * DIA | Opportunity Matching Service (Opportunities ↔ Profiles)
 *
 * Matches opportunities (needs/offers) to user profiles based on:
 * - Skill overlap (strongest signal)
 * - Category alignment
 * - Location fit
 * - Compensation/duration fit
 * - Network proximity to opportunity poster
 * - Historical engagement with similar opportunities
 * - Need/Offer complementarity
 *
 * Extends the existing matchingEngine.ts with richer signal computation.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  OpportunityMatchResult,
  OpportunityMatchType,
  OpportunityMatchSignals,
  MatchReason,
  MatchSurface,
  MatchPriority,
  MatchStatus,
} from '@/types/diaEngine';

/** Weights for opportunity match signals */
const MATCH_WEIGHTS: Record<keyof OpportunityMatchSignals, number> = {
  skillOverlap: 0.25,
  categoryAlignment: 0.15,
  locationFit: 0.15,
  compensationFit: 0.10,
  durationFit: 0.05,
  networkProximity: 0.10,
  engagementHistory: 0.10,
  needOfferComplementarity: 0.10,
};

const MIN_MATCH_THRESHOLD = 0.35;

/**
 * Match a specific opportunity to candidate users.
 */
async function matchOpportunityToUsers(
  opportunityId: string,
  limit = 30,
): Promise<OpportunityMatchResult[]> {
  const { data: opportunity } = await supabase
    .from('contribution_needs')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (!opportunity) return [];

  const oppSkills = ((opportunity.skills_needed as string[]) || []).map(s => s.toLowerCase());

  // Build candidate pool: users with matching skills or in same region
  let candidateQuery = supabase
    .from('profiles')
    .select('id, full_name, skills, interests, location, profession')
    .neq('id', opportunity.created_by)
    .limit(200);

  if (oppSkills.length > 0) {
    candidateQuery = candidateQuery.overlaps('skills', opportunity.skills_needed as string[]);
  }

  const { data: candidates } = await candidateQuery;
  if (!candidates) return [];

  // Get poster's connections for network proximity
  const posterConnections = await fetchUserConnectionIds(opportunity.created_by as string);

  const results: OpportunityMatchResult[] = candidates.map(candidate => {
    const signals = computeOpportunitySignals(opportunity, candidate, posterConnections);
    const score = computeScore(signals);
    const matchType = classifyOpportunityMatchType(signals);
    const reasons = generateOpportunityReasons(signals, opportunity);

    return {
      opportunityId,
      userId: candidate.id,
      matchScore: score,
      matchType,
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
 * Match opportunities to a specific user's profile.
 */
async function matchUserToOpportunities(
  userId: string,
  limit = 20,
): Promise<OpportunityMatchResult[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('skills, interests, location, profession')
    .eq('id', userId)
    .single();

  if (!profile) return [];

  const { data: opportunities } = await supabase
    .from('contribution_needs')
    .select('*')
    .eq('status', 'open')
    .neq('created_by', userId)
    .limit(100);

  if (!opportunities) return [];

  // Get user's connections for network proximity
  const userConnections = await fetchUserConnectionIds(userId);

  const results: OpportunityMatchResult[] = opportunities.map(opp => {
    const signals = computeOpportunitySignals(opp, profile, userConnections);
    const score = computeScore(signals);
    const matchType = classifyOpportunityMatchType(signals);
    const reasons = generateOpportunityReasons(signals, opp);

    return {
      opportunityId: opp.id,
      userId,
      matchScore: score,
      matchType,
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

function computeOpportunitySignals(
  opportunity: Record<string, unknown>,
  candidate: Record<string, unknown>,
  posterConnections: Set<string>,
): OpportunityMatchSignals {
  const oppSkills = ((opportunity.skills_needed as string[]) || []).map(s => s.toLowerCase());
  const userSkills = ((candidate.skills as string[]) || []).map(s => s.toLowerCase());
  const userInterests = ((candidate.interests as string[]) || []).map(s => s.toLowerCase());

  // Skill overlap
  const matchedSkills = oppSkills.filter(s => userSkills.includes(s));
  const skillOverlap = oppSkills.length > 0 ? matchedSkills.length / oppSkills.length : 0;

  // Category alignment
  const description = ((opportunity.description || '') as string).toLowerCase();
  const interestMatches = userInterests.filter(i => description.includes(i));
  const categoryAlignment = Math.min(interestMatches.length * 0.3, 1);

  // Location fit
  const oppLocation = ((opportunity.location || '') as string).toLowerCase();
  const userLocation = ((candidate.location || '') as string).toLowerCase();
  const locationFit = oppLocation && userLocation && oppLocation.includes(userLocation.split(',')[0])
    ? 0.8
    : 0.2;

  // Network proximity
  const candidateId = candidate.id as string;
  const networkProximity = posterConnections.has(candidateId) ? 0.8 : 0.2;

  return {
    skillOverlap,
    categoryAlignment,
    locationFit,
    compensationFit: 0.5, // Default (no compensation prefs yet)
    durationFit: 0.5, // Default
    networkProximity,
    engagementHistory: 0, // Future: track engagement with similar opps
    needOfferComplementarity: skillOverlap > 0.5 ? 0.7 : 0.3,
  };
}

function computeScore(signals: OpportunityMatchSignals): number {
  let score = 0;
  for (const [key, weight] of Object.entries(MATCH_WEIGHTS)) {
    score += (signals[key as keyof OpportunityMatchSignals] || 0) * weight;
  }
  return Math.min(Math.max(score, 0), 1);
}

function classifyOpportunityMatchType(signals: OpportunityMatchSignals): OpportunityMatchType {
  if (signals.skillOverlap > 0.6) return OpportunityMatchType.SKILL_MATCH;
  if (signals.categoryAlignment > 0.5) return OpportunityMatchType.INTEREST_MATCH;
  if (signals.locationFit > 0.6) return OpportunityMatchType.REGIONAL_MATCH;
  if (signals.networkProximity > 0.5) return OpportunityMatchType.NETWORK_MATCH;
  if (signals.needOfferComplementarity > 0.6) return OpportunityMatchType.COMPLEMENTARY;
  return OpportunityMatchType.SKILL_MATCH;
}

function generateOpportunityReasons(
  signals: OpportunityMatchSignals,
  opportunity: Record<string, unknown>,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (signals.skillOverlap > 0.3) {
    const oppSkills = (opportunity.skills_needed as string[]) || [];
    reasons.push({
      type: 'shared_skills',
      text: `Skills match: ${oppSkills.slice(0, 2).join(', ')}`,
      strength: signals.skillOverlap,
      icon: 'skill-match',
    });
  }

  if (signals.locationFit > 0.5) {
    reasons.push({
      type: 'same_region',
      text: `Located in ${(opportunity.location as string) || 'your region'}`,
      strength: signals.locationFit,
      icon: 'map-pin',
    });
  }

  if (signals.networkProximity > 0.5) {
    reasons.push({
      type: 'mutual_connections',
      text: 'Posted by someone in your network',
      strength: signals.networkProximity,
      icon: 'people-network',
    });
  }

  if (signals.categoryAlignment > 0.3) {
    reasons.push({
      type: 'shared_interests',
      text: 'Aligns with your interests',
      strength: signals.categoryAlignment,
      icon: 'lightbulb',
    });
  }

  return reasons.sort((a, b) => b.strength - a.strength).slice(0, 3);
}

function determineSurfaces(score: number): MatchSurface[] {
  if (score >= 0.6) {
    return [MatchSurface.FEED_CARD, MatchSurface.NOTIFICATION];
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
    .select('user_id, connected_user_id')
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .limit(500);

  const ids = new Set<string>();
  for (const conn of data || []) {
    ids.add(conn.user_id === userId ? conn.connected_user_id : conn.user_id);
  }
  return ids;
}

export const opportunityMatchingEngineService = {
  matchOpportunityToUsers,
  matchUserToOpportunities,
  MATCH_WEIGHTS,
};
