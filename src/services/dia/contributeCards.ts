/**
 * DNA | DIA CONTRIBUTE Card Generators
 *
 * STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
 *
 * The 4 original card types (opportunity_match, listing_activity,
 * contribution_pattern, unmet_need) have been replaced with a single
 * DIA_CONTRIBUTE_REBUILDING card that surfaces while the CONTRIBUTE module
 * is being reimagined.
 */

import type { DIACard } from '@/services/diaCardService';

const ACCENT = '#B87333';

async function generateContributeRebuildingCard(userId: string): Promise<DIACard | null> {
  if (!userId) return null;
  return {
    id: 'contrib-rebuilding',
    category: 'contribute',
    cardType: 'DIA_CONTRIBUTE_REBUILDING',
    headline: 'DIA is preparing your CONTRIBUTE intelligence',
    body: 'Opportunities are being reimagined. Your DIA insights will return with the new module.',
    accentColor: ACCENT,
    icon: 'Brain',
    priority: 50,
    actions: [
      {
        label: 'Got it',
        type: 'dismiss',
        payload: {},
        isPrimary: true,
      },
    ],
    metadata: {},
    dismissKey: 'contrib-rebuilding',
  };
}

export function generateContributeCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [generateContributeRebuildingCard];
}
