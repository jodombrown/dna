/**
 * DNA Post Composer — Tier / Monetization Service
 *
 * Enforces Free/Pro/Org feature gating at the Composer level.
 * Returns actionable upgrade prompts when a feature is tier-locked.
 */

import { UserTier, type TierLimits } from '@/types/composer';

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  [UserTier.FREE]: {
    canCreatePaidEvents: false,
    canCreateSeries: false,
    canScheduleContent: false,
    canLeadSpaces: false,
    canPostUnlimitedOpportunities: false,
    canAccessFullDIA: false,
    canViewCrossCAnalytics: false,
    maxOpportunitiesPerMonth: 3,
    maxDIASuggestionsPerSession: 2,
    maxDIAQueriesPerDay: 5,
    maxEventTicketTiers: 0,
    maxRSVPQuestions: 0,
  },
  [UserTier.PRO]: {
    canCreatePaidEvents: true,
    canCreateSeries: true,
    canScheduleContent: true,
    canLeadSpaces: true,
    canPostUnlimitedOpportunities: true,
    canAccessFullDIA: true,
    canViewCrossCAnalytics: true,
    maxOpportunitiesPerMonth: Infinity,
    maxDIASuggestionsPerSession: Infinity,
    maxDIAQueriesPerDay: Infinity,
    maxEventTicketTiers: 5,
    maxRSVPQuestions: 10,
  },
  [UserTier.ORG]: {
    canCreatePaidEvents: true,
    canCreateSeries: true,
    canScheduleContent: true,
    canLeadSpaces: true,
    canPostUnlimitedOpportunities: true,
    canAccessFullDIA: true,
    canViewCrossCAnalytics: true,
    maxOpportunitiesPerMonth: Infinity,
    maxDIASuggestionsPerSession: Infinity,
    maxDIAQueriesPerDay: Infinity,
    maxEventTicketTiers: 10,
    maxRSVPQuestions: 20,
  },
};

const UPGRADE_MESSAGES: Partial<Record<keyof TierLimits, string>> = {
  canCreatePaidEvents: 'Sell tickets for your events with DNA Pro.',
  canCreateSeries:
    'Create content series to build your audience with DNA Pro.',
  canScheduleContent:
    'Schedule your content for the perfect time with DNA Pro.',
  canLeadSpaces: 'Lead projects and working groups with DNA Pro.',
  canAccessFullDIA: 'Get unlimited DIA intelligence with DNA Pro.',
  canViewCrossCAnalytics:
    "See how your content performs across all Five C's with DNA Pro.",
};

export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function checkTierAccess(
  tier: UserTier,
  feature: keyof TierLimits
): { allowed: boolean; upgradeMessage?: string } {
  const limits = TIER_LIMITS[tier];
  const value = limits[feature];
  const allowed =
    typeof value === 'boolean' ? value : typeof value === 'number' && value > 0;

  if (!allowed) {
    return {
      allowed: false,
      upgradeMessage: UPGRADE_MESSAGES[feature],
    };
  }

  return { allowed: true };
}
