// Shared chrome for the COLLABORATE > Spaces pages. Uses the unified
// DnaMobileHubShell on mobile so the top bar, tabs, and bottom nav match
// every other /dna/* hub exactly.

import { type ReactNode } from 'react';
import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';
import { CollaborateMobileTabs } from '@/components/collaborate/CollaborateMobileTabs';
import { useUniversalComposer } from '@/contexts/ComposerContext';

interface SpacesShellProps {
  children: ReactNode;
  /** Max width of the centered content column. */
  maxWidthClassName?: string;
  /**
   * Optional menu-nav row rendered directly beneath the header. Defaults to
   * the shared CollaborateMobileTabs so every Collaborate surface shows the
   * same second row (Spaces / My Spaces / Discover), matching the pattern
   * used by Feed / Connect / Convene / Contribute. Pass `null` to opt out
   * (e.g. Space detail / board / settings sub-pages).
   */
  tabs?: ReactNode;
}

export function SpacesShell({
  children,
  maxWidthClassName = 'max-w-4xl',
  tabs = <CollaborateMobileTabs />,
}: SpacesShellProps) {
  const composer = useUniversalComposer();
  const bubble = {
    kind: 'composer' as const,
    placeholder: 'Start a Space...',
    onClick: () => composer.open('space'),
  };

  return (
    <DnaMobileHubShell bubble={bubble} tabs={tabs ?? undefined}>
      <div className="min-h-[60vh] bg-background">
        <div className={`mx-auto ${maxWidthClassName} px-4 py-6 sm:py-8`}>
          {children}
        </div>
      </div>
    </DnaMobileHubShell>
  );
}
