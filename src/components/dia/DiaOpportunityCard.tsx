/**
 * DiaOpportunityCard
 *
 * STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
 *
 * The CONTRIBUTE module is being reimagined; opportunity-targeted DIA cards
 * are routed through ContributeDIADiscoveryCard (DIA_CONTRIBUTE_REBUILDING).
 * Returns null so callers like DiaSearch render no opportunity cards during
 * teardown. Props retained for caller compatibility.
 */

import type { ContributionNeedType } from '@/types/contributeTypes';

interface DiaOpportunityCardProps {
  id: string;
  title: string;
  type: ContributionNeedType;
  spaceName?: string;
  region?: string;
  focusAreas?: string[];
  relevance?: string;
  matchScore?: number;
  compact?: boolean;
}

export default function DiaOpportunityCard(_props: DiaOpportunityCardProps) {
  return null;
}
