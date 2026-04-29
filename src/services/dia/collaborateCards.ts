/**
 * DNA | DIA COLLABORATE Card Generators
 *
 * STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
 *
 * The 4 original card types (stalled_space, skill_match, space_milestone,
 * task_reminder) have been replaced with a single DIA_COLLABORATE_REBUILDING
 * card that surfaces while the COLLABORATE module is being reimagined.
 */

import type { DIACard } from '@/services/diaCardService';

const ACCENT = '#2D5A3D';

async function generateCollaborateRebuildingCard(userId: string): Promise<DIACard | null> {
  if (!userId) return null;
  return {
    id: 'collab-rebuilding',
    category: 'collaborate',
    cardType: 'DIA_COLLABORATE_REBUILDING',
    headline: 'DIA is preparing your COLLABORATE intelligence',
    body: 'Spaces are being reimagined. Your DIA insights will return with the new module.',
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
    dismissKey: 'collab-rebuilding',
  };
}

export function generateCollaborateCards(): Array<(userId: string) => Promise<DIACard | null>> {
  return [generateCollaborateRebuildingCard];
}
