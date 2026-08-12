/**
 * MyEventsTabStrip — the My Events lens bar (Attending / Hosting / Managing /
 * Drafted / Cancelled), mounted in AppShell's `tabs` slot (BD458): passed
 * straight through to DnaMobileHubShell's `tabs` slot on mobile, rendered
 * above the content column on desktop. One component, one mount, both
 * widths — the exact pattern ConveneTabStrip already established for the
 * Convene hub (see ConveneShell.tsx).
 *
 * Replaces the old split between this file's mobile-only chrome bar and
 * MyEvents.tsx's desktop-only LensRail: AppShell owns both widths' chrome
 * now, so the lens switcher needs exactly one implementation, not two kept
 * in sync by hand.
 */
import React from 'react';
import { Calendar, BarChart3, Pencil, CircleSlash, Shield } from 'lucide-react';
import { LensBar } from '@/components/shell/LensBar';
import { HubTabsRow } from '@/components/shell/HubTabsRow';

export function MyEventsTabStrip() {
  return (
    <HubTabsRow>
      <LensBar
        ariaLabel="My events"
        c="convene"
        lenses={[
          { id: 'attending', label: 'Attending', icon: Calendar },
          { id: 'hosting', label: 'Hosting', icon: BarChart3 },
          { id: 'managing', label: 'Managing', icon: Shield },
          { id: 'drafted', label: 'Drafted', icon: Pencil },
          { id: 'cancelled', label: 'Cancelled', icon: CircleSlash },
        ]}
      />
    </HubTabsRow>
  );
}

export default MyEventsTabStrip;
