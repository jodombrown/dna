/**
 * ConveneShell — the single source of mobile chrome for every Convene route
 * (hub, events index, event detail, my events, edit event, calendar view).
 *
 * Renders the canonical DnaMobileHeader (DNA logo, composer bubble, bell,
 * avatar) plus the Convene lens bar via DnaMobileHubShell. No Convene page
 * composes its own header chrome; pages only supply body content.
 *
 * The lens bar is route-driven (BD332b): LensBar reads and writes ?lens=<id>,
 * and the hub (ConveneDiscovery) filters off that same param. This surface is
 * the ARIA upgrade — the old hand-rolled strip carried no role="tablist",
 * role="tab" or aria-selected; the primitive brings all three.
 *
 * Two deliberate icon changes:
 *  - Virtual uses Video, not Globe. A gathering with no place is a video call,
 *    not a globe — and Globe is retired from the shell.
 *  - Network uses UserCheck, not Users. Users means the member directory
 *    (Connect Members); "from people I am connected to" is the same meaning as
 *    Feed's My Network, which already uses UserCheck. Same meaning, same glyph.
 *
 * On desktop this is a pass-through — pages keep their desktop chrome.
 */
import React, { type ReactNode } from 'react';
import { CalendarDays, MapPin, Clock, Video, Ticket, UserCheck } from 'lucide-react';
import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { LensBar, type Lens } from '@/components/shell/LensBar';

export const CONVENE_LENSES: Lens[] = [
  { id: 'all', label: 'All', icon: CalendarDays },
  { id: 'near_me', label: 'Near Me', icon: MapPin },
  { id: 'this_week', label: 'This Week', icon: Clock },
  { id: 'online', label: 'Virtual', icon: Video },
  { id: 'free', label: 'Free', icon: Ticket },
  { id: 'network', label: 'Network', icon: UserCheck },
];

function ConveneTabStrip() {
  return (
    <div className="md:hidden px-3 py-1.5 bg-background border-b border-border">
      <LensBar lenses={CONVENE_LENSES} ariaLabel="Convene lenses" c="convene" />
    </div>
  );
}

interface ConveneShellProps {
  children: ReactNode;
  /** Set false when the page renders its own fixed bottom bar (e.g. the
   *  event detail's StickyRSVPBar) — never two fixed bottom bars. */
  showBottomNav?: boolean;
  /** Extra classes on the scrolling content wrapper. */
  contentClassName?: string;
}

export function ConveneShell({
  children,
  showBottomNav = true,
  contentClassName,
}: ConveneShellProps) {
  const composer = useUniversalComposer();

  return (
    <>
      <DnaMobileHubShell
        bubble={{
          kind: 'composer',
          placeholder: 'Host or find an event...',
          onClick: () => composer.open('event'),
        }}
        tabs={<ConveneTabStrip />}
        showBottomNav={showBottomNav}
        contentClassName={contentClassName}
      >
        {children}
      </DnaMobileHubShell>

    </>
  );
}

export default ConveneShell;
