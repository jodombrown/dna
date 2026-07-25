/**
 * DNA | DIA Discovery Card for CONTRIBUTE
 *
 * STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
 *
 * Single rebuilding card replacing the previous priority-ordered discovery
 * variants (no-activity / skills-match / low-content / network-active /
 * welcome). Card type id: DIA_CONTRIBUTE_REBUILDING.
 *
 * Honors the Sprint 4A 7-day localStorage dismiss pattern.
 */

import { useState } from 'react';
import { isDismissed, dismissDIACard } from '@/services/diaCardService';
import { Brain } from 'lucide-react';
import { DiaDiscoveryCard } from '@/components/cards/DiaDiscoveryCard';

interface ContributeDIADiscoveryCardProps {
  openNeedsCount?: number;
  className?: string;
}

const DISMISS_KEY = 'DIA_CONTRIBUTE_REBUILDING';

export function ContributeDIADiscoveryCard({
  className,
}: ContributeDIADiscoveryCardProps) {
  const [dismissed, setDismissed] = useState(() => isDismissed(DISMISS_KEY));

  if (dismissed) return null;

  const handleDismiss = () => {
    dismissDIACard(DISMISS_KEY);
    setDismissed(true);
  };

  return (
    <DiaDiscoveryCard
      module="contribute"
      icon={Brain}
      headline="DIA is preparing your CONTRIBUTE intelligence"
      body="Opportunities are being reimagined. Your DIA insights will return with the new module."
      cta={{ label: 'Got it', onClick: handleDismiss, variant: 'outline' }}
      onDismiss={handleDismiss}
      announce
      className={className}
    />
  );
}

export default ContributeDIADiscoveryCard;
