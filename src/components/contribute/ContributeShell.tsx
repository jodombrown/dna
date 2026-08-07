// Shared chrome for the CONTRIBUTE hub. Uses the unified DnaMobileHubShell on
// mobile so the top bar and bottom nav match every other /dna/* hub exactly, and
// owns the centered content column at both widths (the page must not, so no
// max-w / px / py lands in src/pages). The hub's own navigation is the
// ContributeLensBar rendered in content, so no second tab row is mounted here.

import { type ReactNode } from 'react';
import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';
import { useUniversalComposer } from '@/contexts/ComposerContext';

interface ContributeShellProps {
  children: ReactNode;
  /** Max width of the centered content column. */
  maxWidthClassName?: string;
  /** Optional menu-nav row under the header. Omitted by default: the hub uses
      the in-content ContributeLensBar instead. */
  tabs?: ReactNode;
}

export function ContributeShell({
  children,
  maxWidthClassName = 'max-w-2xl',
  tabs = null,
}: ContributeShellProps) {
  const composer = useUniversalComposer();
  return (
    <DnaMobileHubShell
      bubble={{ kind: 'composer', placeholder: 'Post a Need...', onClick: () => composer.open('need') }}
      tabs={tabs ?? undefined}
    >
      <div className="bg-background">
        <div className={`mx-auto ${maxWidthClassName} px-4 py-6 sm:py-8`}>{children}</div>
      </div>
    </DnaMobileHubShell>
  );
}
