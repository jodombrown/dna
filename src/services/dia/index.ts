/**
 * DNA | DIA Core Engine — Service Index
 *
 * The DIA (Diaspora Intelligence Agent) is the nervous system that makes
 * DNA intelligent. It operates across all Five C's simultaneously.
 *
 * Architecture:
 * - Internal data sourced from Supabase (profiles, connections, activity, engagement)
 * - External data sourced from Perplexity API (news, trends, economic data)
 * - Matching algorithms start rule-based, graduate to ML as data accumulates
 * - DIA never shares private user data across trust boundaries
 * - All suggestions are tracked (shown, accepted, dismissed) for learning
 */

export { profileIntelligenceService } from './profileIntelligence';
export { networkIntelligenceService } from './networkIntelligence';
export { contentIntelligenceService } from './contentIntelligence';
export { matchingEngineService } from './matchingEngine';
export { trendIntelligenceService } from './trendIntelligence';
export { nudgeEngineService } from './nudgeEngine';
export { conversationIntelligenceService } from './conversationIntelligence';
export { regionalIntelligenceService } from './regionalIntelligence';

// Re-export types for convenience
export type {
  DIACoreService,
  DIAOperationalMode,
  FiveCModule,
  SubscriptionTier,
  DIANudge,
  DIAInsightCard,
  MatchRequest,
  MatchResult,
  SmartIntroduction,
  TrendItem,
  RegionalInsight,
  ProfileIntelligenceResult,
  ConnectionStrength,
  ContentAnalysis,
} from '@/types/dia';
