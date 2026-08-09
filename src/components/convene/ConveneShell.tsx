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
import { HubTabsRow } from '@/components/shell/HubTabsRow';

export const CONVENE_LENSES: Lens[] = [
  { id: 'all', label: 'All', icon: CalendarDays, description: 'Every upcoming event across the diaspora' },
  { id: 'near_me', label: 'Near Me', icon: MapPin, description: 'Events happening close to your current location' },
  { id: 'this_week', label: 'This Week', icon: Clock, description: 'Events taking place within the next seven days' },
  { id: 'online', label: 'Virtual', icon: Video, description: 'Virtual events you can join from anywhere in the world' },
  { id: 'free', label: 'Free', icon: Ticket, description: 'No-cost events open to all community members' },
  { id: 'network', label: 'Network', icon: UserCheck, description: 'Events hosted by or attended by people in your network' },
];

function ConveneTabStrip() {
  return (
    <HubTabsRow>
      <LensBar lenses={CONVENE_LENSES} ariaLabel="Convene lenses" c="convene" />
    </HubTabsRow>
  );
}

interface ConveneShellProps {
  children: ReactNode;
  /** Set false when the page renders its own fixed bottom bar (e.g. the
   *  event detail's StickyRSVPBar) — never two fixed bottom bars. */
  showBottomNav?: boolean;
  /** Extra classes on the scrolling content wrapper. */
  contentClassName?: string;
  /** The discovery lens bar (All / Near Me / This Week / Virtual / Free /
   *  Network) filters events on the hub, and ONLY the hub. Per BD375, no
   *  other Convene page may inherit it by default: MyEvents has its own
   *  Hosting/Attending toggle, EventsIndex has its own six-facet filter set,
   *  EventDetail has nothing to filter, it's one event. Every non-hub caller
   *  must pass tabs={null} explicitly. Defaults to the hub's bar so
   *  ConveneDiscovery, which already calls <ConveneShell> with no props,
   *  needs no change. */
  tabs?: ReactNode;
}

export function ConveneShell({
  children,
  showBottomNav = true,
  contentClassName,
  tabs = <ConveneTabStrip />,
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
        tabs={tabs}
        showBottomNav={showBottomNav}
        contentClassName={contentClassName}
      >
        {children}
      </DnaMobileHubShell>

    </>
  );
}

export default ConveneShell;
