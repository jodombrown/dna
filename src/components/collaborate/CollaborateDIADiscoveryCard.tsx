/**
 * DNA | DIA Discovery Card for COLLABORATE
 *
 * STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
 *
 * Single rebuilding card replacing the previous priority-ordered discovery
 * variants (no-spaces / stalled-space / skills-match / network-active /
 * welcome). Card type id: DIA_COLLABORATE_REBUILDING.
 *
 * Honors the Sprint 4A 7-day localStorage dismiss pattern.
 */

import { useState } from 'react';
import { isDismissed, dismissDIACard } from '@/services/diaCardService';
import { Brain } from 'lucide-react';
import { DiaDiscoveryCard } from '@/components/cards/DiaDiscoveryCard';

interface CollaborateDIADiscoveryCardProps {
  spaceCount?: number;
  onCreateSpace?: () => void;
  className?: string;
}

const DISMISS_KEY = 'DIA_COLLABORATE_REBUILDING';

export function CollaborateDIADiscoveryCard({
  className,
}: CollaborateDIADiscoveryCardProps) {
  const [dismissed, setDismissed] = useState(() => isDismissed(DISMISS_KEY));

  if (dismissed) return null;

  const handleDismiss = () => {
    dismissDIACard(DISMISS_KEY);
    setDismissed(true);
  };

  return (
    <DiaDiscoveryCard
      module="collaborate"
      icon={Brain}
      headline="DIA is preparing your COLLABORATE intelligence"
      body="Spaces are being reimagined. Your DIA insights will return with the new module."
      cta={{ label: 'Got it', onClick: handleDismiss, variant: 'outline' }}
      onDismiss={handleDismiss}
      announce
      className={className}
    />
  );
}

export default CollaborateDIADiscoveryCard;
